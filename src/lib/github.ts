import type { ProjectItem, ProjectSortBy } from '@/types/config';

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── GraphQL Query ──────────────────────────────────────────────────────────
// Fetches both pinned items (to know which repos are pinned) and all non-fork
// public repos owned by the user, ordered by stars descending (up to 100).

const REPOS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
          }
        }
      }
      repositories(
        first: 100
        isFork: false
        ownerAffiliations: OWNER
        privacy: PUBLIC
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          name
          description
          url
          homepageUrl
          stargazerCount
          updatedAt
          createdAt
          primaryLanguage {
            name
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
        }
      }
    }
  }
`;

// ─── Types ──────────────────────────────────────────────────────────────────

interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  updatedAt: string;
  createdAt: string;
  primaryLanguage: { name: string } | null;
  repositoryTopics: {
    nodes: Array<{ topic: { name: string } }>;
  };
}

interface GitHubPinnedItem {
  name: string;
}

interface GitHubGraphQLResponse {
  data?: {
    user?: {
      pinnedItems?: {
        nodes: GitHubPinnedItem[];
      };
      repositories?: {
        nodes: GitHubRepo[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

interface CachedData {
  pinnedNames: Set<string>;
  repos: GitHubRepo[];
  timestamp: number;
}

let cache: CachedData | null = null;

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch all non-fork public repos for a GitHub user. Pinned repos are placed
 * first (marked `pinned: true` / `featured: true`), followed by the remaining
 * repos sorted by the chosen strategy. The total count is capped at `maxRepos`.
 *
 * When `topics` is provided, non-pinned repos are filtered to only those that
 * have at least one matching topic. Pinned repos always appear regardless.
 */
export async function fetchGitHubRepos(
  username: string,
  sortBy: ProjectSortBy = 'stars',
  maxRepos: number = 20,
  topics?: string[],
): Promise<ProjectItem[]> {
  let pinnedNames: Set<string>;
  let repos: GitHubRepo[];

  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    pinnedNames = cache.pinnedNames;
    repos = cache.repos;
  } else {
    const result = await fetchFromAPI(username);
    pinnedNames = result.pinnedNames;
    repos = result.repos;
    cache = { pinnedNames, repos, timestamp: Date.now() };
  }

  // Build a lowercase topic set for case-insensitive matching
  const topicFilter =
    topics && topics.length > 0
      ? new Set(topics.map((t) => t.toLowerCase()))
      : null;

  // Split into pinned and non-pinned
  const pinned: ProjectItem[] = [];
  const others: ProjectItem[] = [];

  for (const repo of repos) {
    if (pinnedNames.has(repo.name)) {
      // Pinned repos always included regardless of topic filter
      pinned.push(repoToProjectItem(repo, true));
    } else {
      // Apply topic filter to non-pinned repos
      if (topicFilter && !repoMatchesTopics(repo, topicFilter)) {
        continue;
      }
      others.push(repoToProjectItem(repo, false));
    }
  }

  // Sort non-pinned repos by the configured strategy
  const sortedOthers = sortProjects(others, sortBy);

  // Pinned first, then sorted rest, capped at maxRepos
  return [...pinned, ...sortedOthers].slice(0, maxRepos);
}

// ─── Internals ──────────────────────────────────────────────────────────────

async function fetchFromAPI(
  username: string,
): Promise<{ pinnedNames: Set<string>; repos: GitHubRepo[] }> {
  const token = import.meta.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      'GITHUB_TOKEN environment variable is required to fetch GitHub repositories',
    );
  }

  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: REPOS_QUERY,
      variables: { username },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API returned ${response.status}: ${response.statusText}`,
    );
  }

  const json = (await response.json()) as GitHubGraphQLResponse;

  if (json.errors?.length) {
    throw new Error(
      `GitHub GraphQL error: ${json.errors.map((e) => e.message).join(', ')}`,
    );
  }

  const user = json.data?.user;

  if (!user) {
    throw new Error(`GitHub user "${username}" not found`);
  }

  const pinnedNames = new Set(
    (user.pinnedItems?.nodes ?? []).map((item) => item.name),
  );

  const repos = user.repositories?.nodes ?? [];

  return { pinnedNames, repos };
}

function repoToProjectItem(repo: GitHubRepo, isPinned: boolean): ProjectItem {
  const technologies: string[] = [];

  if (repo.primaryLanguage?.name) {
    technologies.push(repo.primaryLanguage.name);
  }

  for (const { topic } of repo.repositoryTopics.nodes) {
    if (!technologies.includes(topic.name)) {
      technologies.push(topic.name);
    }
  }

  return {
    name: repo.name,
    description: repo.description ?? '',
    url: repo.homepageUrl || repo.url,
    technologies,
    highlights: [],
    featured: isPinned,
    stars: repo.stargazerCount,
    updatedAt: repo.updatedAt,
    createdAt: repo.createdAt,
    pinned: isPinned,
  };
}

function repoMatchesTopics(
  repo: GitHubRepo,
  topicFilter: Set<string>,
): boolean {
  return repo.repositoryTopics.nodes.some(({ topic }) =>
    topicFilter.has(topic.name.toLowerCase()),
  );
}

function sortProjects(
  projects: ProjectItem[],
  sortBy: ProjectSortBy,
): ProjectItem[] {
  return [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return b.stars - a.stars;
      case 'updated':
        return (
          new Date(b.updatedAt ?? 0).getTime() -
          new Date(a.updatedAt ?? 0).getTime()
        );
      case 'created':
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}

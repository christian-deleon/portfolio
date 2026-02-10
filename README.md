# christian.deleon.me

My personal portfolio site, built with [Hyprfolio](https://github.com/christian-deleon/hyprfolio) -- a config-driven Astro static site that recreates a Linux desktop running the Hyprland compositor.

## Stack

- **Astro** -- Static site framework
- **Tailwind CSS v4** -- Utility CSS
- **TypeScript** -- Type safety
- **Vercel** -- Hosting and deployment

## Development

```bash
just install    # Install dependencies
just dev        # Start dev server at localhost:4321
just build      # Production build to dist/
just preview    # Preview the production build
```

## Configuration

All content lives in `hyprfolio.config.yaml`. Edit that file to update resume content, tile layout, palettes, and visual settings.

## License

[MIT](LICENSE)

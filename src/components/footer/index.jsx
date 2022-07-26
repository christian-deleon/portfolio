import React, { Component } from "react";
import "./style.css";

class Footer extends Component {
  render() {
    return (
      <section className="footer-block">
        <footer className="container footer-container">
          <h4>
            Copyright © 2022 CDL
            <br />
            <br />
            Designed and Developed by Christian De Leon -{" "}
            <span>
              <a
                href="https://github.com/christian-deleon/portfolio"
                target="_blank"
                className="github__footer"
              >
                GitHub Repo
              </a>
            </span>
          </h4>
        </footer>
      </section>
    );
  }
}

export default Footer;

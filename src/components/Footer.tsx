import type { FC } from 'react';

const Footer: FC = () => (
  <footer className="portal-footer" role="contentinfo">
    <div className="portal-footer__inner">
      <div className="portal-footer__left">
        <span className="portal-footer__name">Developed by Vinayak Sharma</span>
        <span className="portal-footer__meta">
          CSE · MITRC &nbsp;·&nbsp; Frontend / Full Stack Developer Intern
        </span>
      </div>
      <nav className="portal-footer__links" aria-label="Developer links">
        <a
          href="https://Vinayak2922k.github.io/Portfolio-Site/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Vinayak Sharma's Portfolio (opens in new tab)"
        >
          Portfolio
        </a>
        <a
          href="https://github.com/vinayak2922k"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Vinayak Sharma on GitHub (opens in new tab)"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/vinayak2922k/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Vinayak Sharma on LinkedIn (opens in new tab)"
        >
          LinkedIn
        </a>
      </nav>
      <span className="portal-footer__copy">
        © {new Date().getFullYear()} Vinayak Sharma
      </span>
    </div>
  </footer>
);

export default Footer;

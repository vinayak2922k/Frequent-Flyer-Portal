import type { FC } from 'react';

const Header: FC = () => (
  <header className="portal-header" role="banner">
    <div className="portal-header__inner">
      <span className="portal-header__icon" aria-hidden="true">✈</span>
      <div>
        <h1 className="portal-header__title">Frequent Flyer Portal</h1>
        <p className="portal-header__sub">ENG-163087 · Airline Floor Staff</p>
      </div>
    </div>
  </header>
);

export default Header;

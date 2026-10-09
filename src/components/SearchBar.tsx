import type { FC, ChangeEvent } from 'react';

interface Props {
  value: string;
  onChange: (q: string) => void;
}

const SearchBar: FC<Props> = ({ value, onChange }) => (
  <div className="search-bar">
    <label htmlFor="member-search" className="sr-only">Search members</label>
    <input
      id="member-search"
      type="search"
      className="search-bar__input"
      placeholder="Search by ID, name, or email…"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      aria-label="Search by ID, name, or email"
      autoComplete="off"
    />
    <span className="search-bar__icon" aria-hidden="true">🔍</span>
  </div>
);

export default SearchBar;

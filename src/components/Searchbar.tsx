import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './Searchbar.css'; // Dedikert CSS

const Searchbar: React.FC = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Her vil du senere implementere selve søkelogikken
    // f.eks. omdirigere til en søkeresultatside, eller filtrere en liste
    if (query.trim() === '') return;
    alert(`Søker etter: ${query}`);
    // Eksempel: navigate(`/search?q=${query}`);
  };

  return (
    <form className="searchbar-form" onSubmit={handleSearch}>
      <Search className="searchbar-icon" size={18} />
      <input
        type="text"
        className="searchbar-input"
        placeholder="Søk i analyser, boter, modeller..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
};

export default Searchbar;
import React, { useState } from "react";
import "./App.css";
import SearchForm from "./components/SearchForm";
import SearchResults from "./components/SearchResults";

export interface SearchResult {
  image: string;
  title: string;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
}

function App() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
    setError(null);
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSearchResults([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pretraga slika</h1>
        <p>Pretraga slika pomoću teksta ili slike</p>
      </header>

      <main className="App-main">
        <SearchForm
          onSearchResults={handleSearchResults}
          onLoading={handleLoading}
          onError={handleError}
        />

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
          </div>
        )}

        {searchResults.length > 0 && !loading && (
          <SearchResults results={searchResults} />
        )}
      </main>
    </div>
  );
}

export default App;

import React from "react";
import { SearchResult } from "../App";

interface SearchResultsProps {
  results: SearchResult[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  return (
    <div className="search-results">
      <h2>Rezultati ({results.length})</h2>
      <div className="results-grid">
        {results.map((result, index) => (
          <div key={index} className="result-card">
            <div className="result-image">
              <img
                src={`data:image/jpeg;base64,${result.image}`}
                alt={result.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const errorDiv = target.nextElementSibling as HTMLElement;
                  if (errorDiv) {
                    errorDiv.style.display = "block";
                  }
                }}
              />
              <div className="image-error" style={{ display: "none" }}>
                <p>Slika nije dostupna</p>
              </div>
            </div>
            <div className="result-info">
              <h3>{result.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="no-results">
          <p>Nema rezultata. Pokušajte sa drugim pojmom za pretragu.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;

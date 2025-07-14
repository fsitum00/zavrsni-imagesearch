import React, { useState, useRef } from "react";
import axios from "axios";
import { SearchResult } from "../App";

interface SearchFormProps {
  onSearchResults: (results: SearchResult[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearchResults,
  onLoading,
  onError,
}) => {
  const [searchType, setSearchType] = useState<"text" | "image">("text");
  const [textQuery, setTextQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleTextSearch = async () => {
    if (!textQuery.trim()) {
      onError("Please enter a search query");
      return;
    }

    onLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/search/text`, {
        query: textQuery,
        limit: 20,
      });

      if (response.status === 200) {
        onSearchResults(response.data.results);
      } else {
        onError("Search failed");
      }
    } catch (error) {
      console.error("Text search error:", error);
      onError("Failed to perform text search");
    } finally {
      onLoading(false);
    }
  };

  const handleImageSearch = async () => {
    if (!selectedFile) {
      onError("Please select an image file");
      return;
    }

    onLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("limit", "20");

      const response = await axios.post(
        `${API_BASE_URL}/search/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        onSearchResults(response.data.results);
      } else {
        onError("Search failed");
      }
    } catch (error) {
      console.error("Image search error:", error);
      onError("Failed to perform image search");
    } finally {
      onLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchType === "text") {
      handleTextSearch();
    } else {
      handleImageSearch();
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="search-form">
      <div className="search-type-selector">
        <button
          className={`search-type-btn ${searchType === "text" ? "active" : ""}`}
          onClick={() => setSearchType("text")}
        >
          Tekstualna pretraga
        </button>
        <button
          className={`search-type-btn ${
            searchType === "image" ? "active" : ""
          }`}
          onClick={() => setSearchType("image")}
        >
          Slikovna pretraga
        </button>
      </div>

      <div className="search-input-container">
        {searchType === "text" ? (
          <div className="text-search">
            <input
              type="text"
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              placeholder="Unesite pojam za pretragu..."
              className="text-input"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        ) : (
          <div className="image-search">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
                <button onClick={clearImage} className="clear-btn">
                  X
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={handleSearch} className="search-btn">
        Traži
      </button>
    </div>
  );
};

export default SearchForm;

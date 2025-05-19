import { createContext, useState, useContext } from "react";

// Create Context
export const SearchContext = createContext();

// Context Provider Component
export const SearchProvider = ({ children }) => {
  const [searchedBlogs, setSearchedBlogs] = useState(null);
  const [query, setQuery] = useState(null);

  return (
    <SearchContext.Provider value={{ searchedBlogs, setSearchedBlogs, query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
};
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Importing Components
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import Preview from "./pages/Preview";
import { SearchProvider } from "./searchContext";
function App() {
  return (
    
    <BrowserRouter>
      <SearchProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/post/" element={<Post />} />
        <Route path="/preview/:id" element={<Preview />} />
      </Routes>
      </SearchProvider>
    </BrowserRouter>
    
  );
}

export default App;

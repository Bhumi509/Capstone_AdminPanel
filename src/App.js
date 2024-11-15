// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Categories from "./components/Categories";
import Products from "./components/Products";
import FeaturedProducts from "./components/FeaturedProducts";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
        <Route path="/" element={<AdminDashboard />}/>
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/featured" element={<FeaturedProducts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

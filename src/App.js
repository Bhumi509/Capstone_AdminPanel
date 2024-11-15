// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Categories from "./components/Categories";
import Products from "./components/Products";
import FeaturedProducts from "./components/FeaturedProducts";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow p-4 flex space-x-4">
          <Link to="/categories" className="text-blue-500 font-semibold">
            Categories
          </Link>
          <Link to="/products" className="text-blue-500 font-semibold">
            Products
          </Link>
          <Link to="/featured" className="text-blue-500 font-semibold">
            Featured
          </Link>
        </nav>
        <Routes>
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/featured" element={<FeaturedProducts />} />
          <Route
            path="/"
            element={
              <div className="p-6">
                <h1 className="text-3xl font-bold">
                  Welcome to the Admin Panel
                </h1>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Categories from "./components/Categories";
import Navbar from "./components/Navbar";
import Products from "./components/Products";
import FeaturedProducts from "./components/FeaturedProducts";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  return (
    <Router>
      <div className="flex">
        <Navbar setUser={setUser} user={user} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard user={user} />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/featured" element={<FeaturedProducts />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
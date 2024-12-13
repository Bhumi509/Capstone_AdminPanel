// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Categories from "./components/Categories";
import Navbar from "./components/Navbar";
import Products from "./components/Products";
import { query, collectionGroup, getDocs } from "firebase/firestore";
import FeaturedProducts from "./components/FeaturedProducts";
import AdminDashboard from "./components/AdminDashboard";
import ManageUser from "./components/ManageUser";
import OrdersPage from "./components/OrdersPage";
import { db } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const ordersQuery = query(collectionGroup(db, "orders"));
      const orderSnapshot = await getDocs(ordersQuery);

      const ordersList = orderSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          totalAmount: data.totalAmount || 0,
          timestamp: data.timestamp.toDate(),
          items: data.items || [],
        };
      });

      setOrders(ordersList);
    };

    fetchOrders();
  }, []);
  return (
    <Router>
      <div className="flex">
        <Navbar setUser={setUser} user={user} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard user={user} />} />
            <Route path="/manageUser" element={<ManageUser user={user} />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<OrdersPage orders={orders} />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/featured" element={<FeaturedProducts />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

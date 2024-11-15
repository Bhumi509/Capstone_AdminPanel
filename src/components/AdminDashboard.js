import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-pink-300 text-white flex flex-col">
        <h2 className="text-2xl font-bold p-4">Admin Page</h2>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li className="p-4 hover:bg-pink-400 cursor-pointer">Dashboard</li>
            <li className="p-4 hover:bg-pink-400 cursor-pointer">Order</li>
            <li className="p-4 hover:bg-pink-400 cursor-pointer"><Link to="/products">
            Products
          </Link></li>
            <li className="p-4 hover:bg-pink-400 cursor-pointer"><Link to="/categories">
            Categories
          </Link></li>
            <li className="p-4 hover:bg-pink-400 cursor-pointer"><Link to="/featured">
            Featured
          </Link></li>
            <li className="p-4 hover:bg-pink-400 cursor-pointer">Setting</li>
          </ul>
        </nav>
        <button className="p-4 mt-auto hover:bg-pink-400 cursor-pointer">Log Out</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <input
            type="text"
            placeholder="Search Here"
            className="p-2 border rounded-md flex-1 max-w-sm"
          />
          <button className="bg-pink-300 text-white p-2 rounded-md ml-4">
            Show all User
          </button>
        </div>

        {/* Form */}
        <div className="bg-pink-200 p-8 rounded-md max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Add User</h2>
          <form>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="fullname">
                Full Name
              </label>
              <input
                type="text"
                id="fullname"
                placeholder="Enter full name"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter email"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600"
              >
                Submit
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

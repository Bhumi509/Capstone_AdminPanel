import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import AddUser from "./AddUser";
import ShowAllUsers from "./ShowAllUser";

function AdminDashboard() {
  const [view, setView] = useState("addUser");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleShowUsers = () => setView("showUsers");
  const handleAddUser = () => setView("addUser");

  if (!user) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <Navbar setUser={setUser} />
        <main className="flex-1 p-8">
          <h2 className="text-xl font-bold text-center">
            Please sign in to access the dashboard.
          </h2>
        </main>
      </div>
    );
  }

  if (user.role === "viewer") {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <Navbar setUser={setUser} />
        <main className="flex-1 p-8">
          <h2 className="text-xl font-bold text-center">
            Welcome, {user.name}! You can only view details on this platform.
          </h2>
        </main>
      </div>
    );
  }

  if (user.role === "editor") {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <Navbar setUser={setUser} />
        <main className="flex-1 p-8">
          <h2 className="text-xl font-bold text-center">
            Welcome, {user.name}! You can manage products, categories, and
            featured items.
          </h2>
        </main>
      </div>
    );
  }

  if (user.role === "admin") {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <Navbar setUser={setUser} />
        <main className="flex-1 p-8">
          {view === "addUser" && <AddUser onShowUsers={handleShowUsers} />}
          {view === "showUsers" && <ShowAllUsers onAddUser={handleAddUser} />}
        </main>
      </div>
    );
  }

  return null;
}

export default AdminDashboard;

import React, { useState } from "react";
import AddUser from "./AddUser";
import ShowAllUsers from "./ShowAllUser";

function AdminDashboard({ user }) {
  const [view, setView] = useState("addUser");

  if (!user) {
    return (
      <div className="min-h-screen flex bg-gray-100">
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
        <main className="flex-1 p-8">
          {view === "addUser" && (
            <AddUser onShowUsers={() => setView("showUsers")} />
          )}
          {view === "showUsers" && (
            <ShowAllUsers onAddUser={() => setView("addUser")} />
          )}
        </main>
      </div>
    );
  }

  return null;
}

export default AdminDashboard;

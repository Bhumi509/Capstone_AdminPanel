import React, { useState } from "react";
import AddUser from "./AddUser";
import ShowAllUsers from "./ShowAllUser";

function ManageUser({ user }) {
  const [view, setView] = useState("addUser");

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

export default ManageUser;

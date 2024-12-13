import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    const db = getDatabase();
    const adminUsersRef = ref(db, "Admin-users");

    get(adminUsersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users = snapshot.val();
          const userKey = Object.keys(users).find(
            (key) =>
              users[key].email === email && users[key].password === password
          );

          if (userKey) {
            const signedInUser = users[userKey];
            const userData = {
              name: signedInUser.name,
              role: signedInUser.role,
              email: signedInUser.email,
            };
            sessionStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            navigate("/");
            setIsModalOpen(false);
          } else {
            alert("Invalid email or password.");
          }
        } else {
          alert("No users found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        alert("An error occurred. Please try again.");
      });
  };

  const handleLogOut = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <aside className="w-64 bg-pink-300 text-white flex flex-col">
      <h2 className="text-2xl font-bold p-4">Admin Page</h2>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li className="p-4 hover:bg-pink-400 cursor-pointer">
            <Link to="/">Dashboard</Link>
          </li>
          {user && user.role === "admin" && (
            <li className="p-4 hover:bg-pink-400 cursor-pointer">
              <Link to="/manageUser">Manage Users</Link>
            </li>
          )}
          {user && (
            <>
              <li className="p-4 hover:bg-pink-400 cursor-pointer">
                <Link to="/products">Products</Link>
              </li>
              <li className="p-4 hover:bg-pink-400 cursor-pointer">
                <Link to="/categories">Categories</Link>
              </li>
              <li className="p-4 hover:bg-pink-400 cursor-pointer">
                <Link to="/featured">Featured</Link>
              </li>
              <li className="p-4 hover:bg-pink-400 cursor-pointer">
                <Link to="/orders">Orders</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <div className="p-4 mt-auto">
        {user ? (
          <div>
            <p>
              Signed in as <strong>{user.name}</strong> ({user.role})
            </p>
            <button
              onClick={handleLogOut}
              className="mt-2 px-4 py-2 bg-red-500 rounded hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Sign In</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-black px-3 py-2 border rounded"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 text-black py-2 border rounded"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Navbar;

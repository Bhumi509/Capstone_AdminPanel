import React, { useState } from "react";
import { getDatabase, ref, push, set, get } from "firebase/database";

function AddUser({ onShowUsers }) {
  const [formValues, setFormValues] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "viewer",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { fullname, email, password, role } = formValues;

    if (!fullname || !email || !password || !role) {
      setError("All fields are required.");
      return;
    }

    const db = getDatabase();
    const adminUsersRef = ref(db, "Admin-users");

    try {
      const snapshot = await get(adminUsersRef);
      if (snapshot.exists()) {
        const users = snapshot.val();

        const userExists = Object.values(users).some(
          (user) => user.email === email
        );

        if (userExists) {
          setError("A user with this email already exists.");
          return;
        }

        if (role === "admin") {
          const adminExists = Object.values(users).some(
            (user) => user.role === "admin"
          );

          if (adminExists) {
            setError("An admin already exists. Only one admin is allowed.");
            return;
          }
        }
      }

      const newAdminRef = push(adminUsersRef);
      await set(newAdminRef, {
        name: fullname,
        email,
        password,
        role,
      });

      setSuccess("User added successfully!");
      setFormValues({ fullname: "", email: "", password: "", role: "viewer" });
    } catch (err) {
      setError("Failed to add user. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <button
          className="bg-pink-300 text-white p-2 rounded-md ml-4"
          onClick={onShowUsers}
        >
          Show All Users
        </button>
      </div>
      <div className="bg-pink-200 p-8 rounded-md max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Add User</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="fullname"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              required
              placeholder="Enter full name"
              className="w-full p-2 border rounded-md"
              value={formValues.fullname}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="Enter email"
              className="w-full p-2 border rounded-md"
              value={formValues.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              placeholder="Enter password"
              className="w-full p-2 border rounded-md"
              value={formValues.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="role"
            >
              Role
            </label>
            <select
              id="role"
              required
              className="w-full p-2 border rounded-md"
              value={formValues.role}
              onChange={handleInputChange}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
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
              onClick={() =>
                setFormValues({
                  fullname: "",
                  email: "",
                  password: "",
                  role: "viewer",
                })
              }
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUser;

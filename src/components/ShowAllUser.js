import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, update, remove } from "firebase/database";
import { FaEdit, FaTrash } from "react-icons/fa";
import DeleteConfirmation from "./DeleteConfirmation";

function ShowAllUsers({ onAddUser }) {
  const [adminUsers, setAdminUsers] = useState([]);
  const [error, setError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedDetails, setEditedDetails] = useState({});
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    const db = getDatabase();
    const adminUsersRef = ref(db, "Admin-users");

    get(adminUsersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users = Object.entries(snapshot.val()).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setAdminUsers(users);
        } else {
          setAdminUsers([]);
          setError("No users found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching admin users:", error);
        setError("Failed to fetch users.");
      });
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditedDetails({ name: user.name, email: user.email, role: user.role });
  };

  const handleSave = (userId) => {
    const db = getDatabase();
    const userRef = ref(db, `Admin-users/${userId}`);
    update(userRef, editedDetails)
      .then(() => {
        fetchUsers();
        setEditingUserId(null);
      })
      .catch((error) => console.error("Error updating user:", error));
  };

  const handleDelete = () => {
    const db = getDatabase();
    const userRef = ref(db, `Admin-users/${deleteUserId}`);
    remove(userRef)
      .then(() => {
        fetchUsers();
        setIsDeletePopupOpen(false);
        setDeleteUserId(null);
      })
      .catch((error) => console.error("Error deleting user:", error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails({ ...editedDetails, [name]: value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Admin Users</h2>
        <button
          className="bg-pink-300 text-white p-2 rounded-md ml-4"
          onClick={onAddUser}
        >
          Back to Add User
        </button>
      </div>
      <div className="bg-white p-4 rounded-md shadow-md">
        <ul className="space-y-2">
          {adminUsers.map((user) => (
            <li
              key={user.id}
              className="p-4 border rounded-md bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
            >
              {editingUserId === user.id ? (
                <div className="flex-1">
                  <p>
                    <strong>Name:</strong>
                    <input
                      type="text"
                      name="name"
                      value={editedDetails.name}
                      onChange={handleInputChange}
                      className="ml-2 p-1 border rounded"
                    />
                  </p>
                  <p>
                    <strong>Email:</strong>
                    <input
                      type="email"
                      name="email"
                      value={editedDetails.email}
                      onChange={handleInputChange}
                      className="ml-2 p-1 border rounded"
                    />
                  </p>
                  <p>
                    <strong>Role:</strong>
                    <select
                      name="role"
                      value={editedDetails.role}
                      onChange={handleInputChange}
                      className="ml-2 p-1 border rounded"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </p>
                  <button
                    className="bg-green-500 text-white p-1 mt-2 rounded"
                    onClick={() => handleSave(user.id)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-500 text-white p-1 mt-2 rounded ml-2"
                    onClick={() => setEditingUserId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex-1">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => handleEdit(user)}
                >
                  <FaEdit />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    setDeleteUserId(user.id);
                    setIsDeletePopupOpen(true);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}

      <DeleteConfirmation
        isOpen={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}

export default ShowAllUsers;

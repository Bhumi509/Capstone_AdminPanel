import React, { useState, useEffect } from "react";
import { database, storage } from "../firebase";
import Modal from "react-modal";
import { FaTrash, FaEdit, FaSpinner } from "react-icons/fa";

function Categories() {
  const [categories, setCategories] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [categoryKey, setCategoryKey] = useState("");
  const [categoryData, setCategoryData] = useState({
    name: "",
    image: null,
    imageUrl: "",
  });

  useEffect(() => {
    const categoriesRef = database.ref("categories");
    setLoading(true);
    categoriesRef.on("value", async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesWithUrls = {};
        for (const key in data) {
          const category = data[key];
          let imageUrl = category.imageUrl;

          if (imageUrl && imageUrl.startsWith("gs://")) {
            const fileName = imageUrl.split("/").pop();
            const storageRef = storage.ref(fileName);
            try {
              imageUrl = await storageRef.getDownloadURL();
            } catch (error) {
              console.error(
                `Error fetching image for ${category.name}:`,
                error
              );
              imageUrl = "https://via.placeholder.com/150";
            }
          }

          categoriesWithUrls[key] = {
            ...category,
            imageUrl,
          };
        }
        setCategories(categoriesWithUrls);
      } else {
        setCategories({});
      }
      setLoading(false);
    });

    return () => {
      database.ref("categories").off();
    };
  }, []);

  const openModal = (category = null, key = "") => {
    if (category) {
      setEditing(true);
      setCategoryKey(key);
      setCategoryData({
        name: category.name,
        image: null,
        imageUrl: category.imageUrl,
      });
    } else {
      setEditing(false);
      setCategoryData({
        name: "",
        image: null,
        imageUrl: "",
      });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setCategoryData({ ...categoryData, image: e.target.files[0] });
    } else {
      setCategoryData({ ...categoryData, [e.target.name]: e.target.value });
    }
  };

  const saveCategory = () => {
    if (categoryData.name) {
      const categoryKeyToUse = editing
        ? categoryKey
        : encodeURIComponent(categoryData.name);

      const saveData = (url = categoryData.imageUrl) => {
        const newCategory = {
          name: categoryData.name,
          imageUrl: url,
        };

        const categoriesRef = database.ref(`categories/${categoryKeyToUse}`);
        setSaving(true);
        categoriesRef.set(newCategory).then(() => {
          setSaving(false);
          closeModal();
        });
      };

      if (categoryData.image) {
        const imageRef = storage.ref(categoryData.image.name);
        setSaving(true);
        imageRef.put(categoryData.image).then(() => {
          imageRef.getDownloadURL().then((url) => {
            saveData(url);
          });
        });
      } else {
        saveData();
      }
    } else {
      alert("Please enter a name.");
    }
  };

  const deleteCategory = (categoryKey) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const categoriesRef = database.ref(`categories/${categoryKey}`);
      categoriesRef.remove();
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="flex items-center mb-4 space-x-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => openModal()}
        >
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <FaSpinner className="animate-spin text-4xl" />
          <span className="ml-2">Loading categories...</span>
        </div>
      ) : (
        <table className="min-w-full bg-gray-800 text-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-gray-700">
                Image
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-gray-700">
                Name
              </th>
              <th className="py-3 px-4 text-center font-semibold text-sm bg-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories &&
              Object.entries(categories).map(([key, cat]) => (
                <tr
                  key={key}
                  className="border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="py-3 px-4">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="py-3 px-4">{cat.name}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="text-blue-400 hover:text-blue-500 mx-2"
                      onClick={() => openModal(cat, key)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-400 hover:text-red-500 mx-2"
                      onClick={() => deleteCategory(key)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add or Edit Category"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-100">
            {editing ? "Edit Category" : "Add Category"}
          </h2>
          <div className="space-y-4">
            <input
              className="border p-2 w-full bg-gray-700 text-gray-200 rounded"
              name="name"
              value={categoryData.name}
              onChange={handleChange}
              placeholder="Category Name"
            />
            <input
              className="border p-2 w-full bg-gray-700 text-gray-200 rounded"
              name="image"
              type="file"
              onChange={handleChange}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="bg-gray-600 text-gray-200 px-4 py-2 rounded hover:bg-gray-700"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
              onClick={saveCategory}
              disabled={saving}
            >
              {saving ? <FaSpinner className="animate-spin mr-2" /> : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Categories;

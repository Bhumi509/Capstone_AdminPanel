import React, { useState, useEffect } from "react";
import { database, storage } from "../firebase";
import Modal from "react-modal";
import { FaTrash, FaEdit, FaSpinner } from "react-icons/fa";

function Products() {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [productKey, setProductKey] = useState("");
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    available: true,
    rating: "",
    reviews: "",
    stock: "",
    tags: "",
    image: null,
    imageUrl: "",
  });
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const { role } = JSON.parse(storedUser);
      setRole(role);
    }
  }, []);

  useEffect(() => {
    const categoriesRef = database.ref("categories");
    categoriesRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setCategories(data || {});
    });

    return () => {
      database.ref("categories").off();
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const productsRef = database.ref("products");
    productsRef.on("value", async (snapshot) => {
      const data = snapshot.val();
      const productsWithUrls = {};

      if (data) {
        for (const category in data) {
          productsWithUrls[category] = {};
          for (const key in data[category]) {
            const product = data[category][key];
            let imageUrl = product.imageUrl;

            if (imageUrl && imageUrl.startsWith("gs://")) {
              const fileName = imageUrl.split("/").pop();
              const storageRef = storage.ref(fileName);
              try {
                imageUrl = await storageRef.getDownloadURL();
              } catch {
                imageUrl = "https://via.placeholder.com/150";
              }
            }

            productsWithUrls[category][key] = {
              ...product,
              imageUrl,
            };
          }
        }
        setProducts(productsWithUrls);
      } else {
        setProducts({});
      }
      setLoading(false);
    });

    return () => {
      database.ref("products").off();
    };
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setProductData({ ...productData, image: e.target.files[0] });
    } else {
      setProductData({ ...productData, [e.target.name]: e.target.value });
    }
  };

  const openModal = (product = null, key = "") => {
    if (product) {
      setEditing(true);
      setProductKey(key);
      setProductData({
        ...product,
        image: null,
      });
    } else {
      setEditing(false);
      setProductData({
        name: "",
        price: "",
        description: "",
        available: true,
        rating: "",
        reviews: "",
        stock: "",
        tags: "",
        image: null,
        imageUrl: "",
      });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const saveProduct = () => {
    if (selectedCategory && productData.name && productData.price) {
      setSaving(true);
      const productKeyToUse = editing
        ? productKey
        : encodeURIComponent(productData.name);

      const saveData = (url = productData.imageUrl) => {
        const parsedPrice = parseFloat(productData.price);
        const updatedProduct = {
          name: productData.name,
          price: {
            amount: isNaN(parsedPrice) ? 0 : parsedPrice,
            currency: "CAD",
          },
          description: productData.description,
          available:
            productData.available === "true" || productData.available === true,
          rating: parseFloat(productData.rating) || 0,
          reviews: parseInt(productData.reviews) || 0,
          stock: parseInt(productData.stock) || 0,
          tags: Array.isArray(productData.tags)
            ? productData.tags
            : productData.tags.split(",").map((tag) => tag.trim()),
          imageUrl: url,
        };

        const productRef = database.ref(
          `products/${selectedCategory}/${productKeyToUse}`
        );
        productRef.set(updatedProduct);
        setSaving(false);
        closeModal();
      };

      if (productData.image) {
        const imageRef = storage.ref(productData.image.name);
        imageRef.put(productData.image).then(() => {
          imageRef.getDownloadURL().then((url) => {
            saveData(url);
          });
        });
      } else {
        saveData();
      }
    } else {
      alert("Please fill out all required fields.");
    }
  };

  const deleteProduct = (categoryKey, productKey) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const productRef = database.ref(`products/${categoryKey}/${productKey}`);
      productRef.remove();
    }
  };

  return (
    <div className="p-6 text-gray-800 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <div className="flex items-center mb-4 space-x-4">
        <select
          className="border p-2 bg-pink-500 text-white"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories &&
            Object.entries(categories).map(([key, cat]) => (
              <option value={cat.name} key={key}>
                {cat.name}
              </option>
            ))}
        </select>
        {role !== "viewer" && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => openModal()}
          >
            Add Product
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <FaSpinner className="animate-spin text-4xl" />
          <span className="ml-2">Loading products...</span>
        </div>
      ) : selectedCategory && products[selectedCategory] ? (
        <table className="min-w-full bg-pink-200 text-gray-800 rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-pink-400">
                Image
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-pink-400">
                Name
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-pink-400">
                Price
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-pink-400">
                Available
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-pink-400">
                Rating
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-pink-400">
                Reviews
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-pink-400">
                Stock
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-pink-400">
                Tags
              </th>
              {role !== "viewer" && (
                <th className="py-3 px-4 text-center font-semibold text-sm bg-pink-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {Object.entries(products[selectedCategory]).map(([key, prod]) => (
              <tr
                key={key}
                className="border-b border-gray-700 hover:bg-pink-400"
              >
                <td className="py-3 px-4">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="py-3 px-4">{prod.name}</td>
                <td className="py-3 px-4">${prod.price.amount.toFixed(2)}</td>
                <td className="py-3 px-4">{prod.available ? "Yes" : "No"}</td>
                <td className="py-3 px-4">{prod.rating}</td>
                <td className="py-3 px-4">{prod.reviews}</td>
                <td className="py-3 px-4">{prod.stock}</td>
                <td className="py-3 px-4">
                  {prod.tags ? prod.tags.join(", ") : ""}
                </td>
                {role !== "viewer" && (
                  <td className="py-3 px-4 flex justify-center space-x-2">
                    <button
                      className="text-gray-800 hover:text-gray-600 mx-2"
                      onClick={() => openModal(prod, key)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-500 mx-2"
                      onClick={() => deleteProduct(selectedCategory, key)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4 text-center">
          No products available in this category.
        </p>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Product"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-pink-400 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-100">
            {editing ? "Edit Product" : "Add Product"}
          </h2>
          <div className="space-y-4">
            <input
              className="border p-2 w-full bg-pink-100 text-gray-800 rounded"
              name="name"
              value={productData.name}
              onChange={handleChange}
              placeholder="Product Name"
            />
            <input
              className="border p-2 w-full bg-pink-100 text-gray-800 rounded"
              name="price"
              value={productData.price}
              onChange={handleChange}
              placeholder="Price"
              type="number"
            />
            <textarea
              className="border p-2 w-full bg-pink-100 text-gray-800 rounded"
              name="description"
              value={productData.description}
              onChange={handleChange}
              placeholder="Description"
            />
            <select
              className="border p-2 w-full bg-pink-100 text-gray-800 rounded"
              name="available"
              value={productData.available}
              onChange={handleChange}
            >
              <option value={true}>Available</option>
              <option value={false}>Unavailable</option>
            </select>
            <input
              className="border p-2 w-full bg-pink-100 text-gray-800 rounded"
              name="rating"
              value={productData.rating}
              onChange={handleChange}
              placeholder="Rating"
              type="number"
              step="0.1"
            />
            <input
              className="border p-2 w-full bg-pink-100 text-gray-800 rounded"
              name="reviews"
              value={productData.reviews}
              onChange={handleChange}
              placeholder="Reviews"
              type="number"
            />
            <input
              className="border p-2 w-full bg-pink-100 text-gray-800 rounded"
              name="stock"
              value={productData.stock}
              onChange={handleChange}
              placeholder="Stock"
              type="number"
            />
            <input
              className="border p-2 w-full bg-pink-100 text-gray-800 rounded"
              name="tags"
              value={productData.tags}
              onChange={handleChange}
              placeholder="Tags (comma separated)"
            />
            <input
              className="border p-2 w-full bg-pink-100 text-gray-800 rounded"
              name="image"
              type="file"
              onChange={handleChange}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="bg-pink-100 text-gray-800 px-4 py-2 rounded hover:bg-pink-100"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
              onClick={saveProduct}
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

export default Products;

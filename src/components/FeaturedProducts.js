import React, { useState, useEffect } from "react";
import { database, storage } from "../firebase";
import Modal from "react-modal";
import { FaTrash, FaEdit, FaSpinner } from "react-icons/fa";

function FeaturedProducts() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [productIndex, setProductIndex] = useState(null);
  const [productData, setProductData] = useState({
    name: "",
    category: "",
    price: {
      amount: "",
      currency: "CAD",
    },
    rating: "",
    reviews: "",
    image: null,
    imageUrl: "",
  });

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await database.ref("categories").once("value");
      const data = snapshot.val();

      // Ensure categories are an array of objects with names for display
      const categoryList = data
        ? Object.values(data).map((category) => category.name)
        : [];
      setCategories(categoryList);
    };
    fetchCategories();
  }, []);

  // Fetch featured products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const snapshot = await database.ref("featuredProducts").once("value");
      const data = snapshot.val() || [];

      const productsWithUrls = await Promise.all(
        data.map(async (product) => {
          let imageUrl = product.imageUrl;
          if (imageUrl && imageUrl.startsWith("gs://")) {
            const fileName = imageUrl.split("/").pop();
            const storageRef = storage.ref(fileName);
            try {
              imageUrl = await storageRef.getDownloadURL();
            } catch (error) {
              console.error(`Error fetching image for ${product.name}:`, error);
              imageUrl = "https://via.placeholder.com/150";
            }
          }
          return { ...product, imageUrl };
        })
      );
      setFeaturedProducts(productsWithUrls);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const openModal = (product = null, index = null) => {
    if (product) {
      setEditing(true);
      setProductIndex(index);
      setProductData({
        ...product,
        price: {
          amount: product.price.amount,
          currency: product.price.currency || "CAD",
        },
        image: null,
      });
    } else {
      setEditing(false);
      setProductData({
        name: "",
        category: "",
        price: { amount: "", currency: "CAD" },
        rating: "",
        reviews: "",
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
      setProductData({ ...productData, image: e.target.files[0] });
    } else if (e.target.name === "price") {
      setProductData({
        ...productData,
        price: { ...productData.price, amount: e.target.value },
      });
    } else {
      setProductData({ ...productData, [e.target.name]: e.target.value });
    }
  };

  const saveProduct = () => {
    setSaving(true);
    const updatedData = {
      ...productData,
      price: {
        amount: parseFloat(productData.price.amount) || 0,
        currency: "CAD",
      },
      rating: parseFloat(productData.rating) || 0,
      reviews: parseInt(productData.reviews, 10) || 0,
    };

    const saveData = async (url = productData.imageUrl) => {
      const newProduct = { ...updatedData, imageUrl: url };

      const updatedProducts = editing
        ? featuredProducts.map((item, idx) =>
            idx === productIndex ? newProduct : item
          )
        : [...featuredProducts, newProduct];

      try {
        await database.ref("featuredProducts").set(updatedProducts);
        setFeaturedProducts(updatedProducts);
        setSaving(false);
        closeModal();
      } catch (error) {
        console.error("Error saving product:", error);
        setSaving(false);
      }
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
  };

  const deleteProduct = (index) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = featuredProducts.filter(
        (_, idx) => idx !== index
      );
      database.ref("featuredProducts").set(updatedProducts);
      setFeaturedProducts(updatedProducts);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
      <div className="flex items-center mb-4 space-x-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => openModal()}
        >
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <FaSpinner className="animate-spin text-4xl" />
          <span className="ml-2">Loading products...</span>
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
              <th className="py-3 px-4 text-left font-semibold text-sm bg-gray-700">
                Category
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-gray-700">
                Price
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-gray-700">
                Rating
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm bg-gray-700">
                Reviews
              </th>
              <th className="py-3 px-4 text-center font-semibold text-sm bg-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {featuredProducts.map((product, index) => (
              <tr
                key={index}
                className="border-b border-gray-700 hover:bg-gray-700"
              >
                <td className="py-3 px-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="py-3 px-4">{product.name}</td>
                <td className="py-3 px-4">{product.category}</td>
                <td className="py-3 px-4">
                  ${product.price.amount.toFixed(2)}
                </td>
                <td className="py-3 px-4">{product.rating}</td>
                <td className="py-3 px-4">{product.reviews}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    className="text-blue-400 hover:text-blue-500 mx-2"
                    onClick={() => openModal(product, index)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-400 hover:text-red-500 mx-2"
                    onClick={() => deleteProduct(index)}
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
        contentLabel="Add or Edit Product"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-100">
            {editing ? "Edit Product" : "Add Product"}
          </h2>
          <div className="space-y-4">
            <input
              className="border p-2 w-full bg-gray-700 text-gray-200 rounded"
              name="name"
              value={productData.name}
              onChange={handleChange}
              placeholder="Product Name"
            />
            <select
              className="border p-2 w-full bg-gray-700 text-gray-200 rounded"
              name="category"
              value={productData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((category, idx) => (
                <option key={idx} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              className="border p-2 w-full bg-gray-700 text-gray-200 rounded"
              name="price"
              value={productData.price.amount}
              onChange={handleChange}
              placeholder="Price"
              type="number"
            />
            <input
              className="border p-2 w-full bg-gray-700 text-gray-200 rounded"
              name="rating"
              value={productData.rating}
              onChange={handleChange}
              placeholder="Rating"
              type="number"
              step="0.1"
            />
            <input
              className="border p-2 w-full bg-gray-700 text-gray-200 rounded"
              name="reviews"
              value={productData.reviews}
              onChange={handleChange}
              placeholder="Reviews"
              type="number"
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

export default FeaturedProducts;

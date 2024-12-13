import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const OrdersPage = ({ orders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const closeDetails = () => setSelectedOrder(null);

  useEffect(() => {
    const loadImages = async () => {
      if (selectedOrder) {
        const storage = getStorage();
        const updatedItems = await Promise.all(
          selectedOrder.items.map(async (item) => {
            let imageUrl = item.imageUrl;
            if (imageUrl && imageUrl.startsWith("gs://")) {
              const fileName = imageUrl.split("/").pop();
              const storageRef = ref(storage, fileName);
              try {
                imageUrl = await getDownloadURL(storageRef);
              } catch {
                imageUrl = "https://via.placeholder.com/150";
              }
            }
            return { ...item, imageUrl };
          })
        );
        setSelectedOrder((prev) => ({ ...prev, items: updatedItems }));
      }
    };
    loadImages();
  }, [selectedOrder]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Orders Overview
      </h1>
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          All Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r bg-pink-400 text-white">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id || index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } hover:bg-pink-200`}
                >
                  <td className="py-3 px-4">{order.id}</td>
                  <td className="py-3 px-4">
                    {new Date(order.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-red-600">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">{order.items.length}</td>
                  <td className="py-3 px-4">
                    <button
                      className="text-pink-600 underline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-right">
          <h3 className="text-xl font-semibold text-gray-800">
            Total Sales:{" "}
            <span className="text-pink-600 font-bold">
              ${totalSales.toFixed(2)}
            </span>
          </h3>
        </div>
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Order Details - {selectedOrder.id}
            </h3>
            <div className="space-y-4">
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-16 h-16 rounded-md"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={closeDetails}
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

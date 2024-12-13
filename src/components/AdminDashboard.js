import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { database, db } from "../firebase";
import { collectionGroup, getDocs, query } from "firebase/firestore";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

function AdminDashboard({ user }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [productStockChartData, setProductStockChartData] = useState(null);
  const [orders, setOrders] = useState({ totalSales: 0, itemsSold: 0 });

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await database.ref("products").once("value");
      const categories = snapshot.val();

      const data = Object.keys(categories).map((categoryKey) => {
        const category = categories[categoryKey];
        const productCount = category ? Object.keys(category).length : 0;
        return {
          name: categoryKey,
          productCount,
        };
      });

      setCategories(data);

      const labels = data.map((category) => category.name);
      const counts = data.map((category) => category.productCount);
      const colors = generateColors(data.length);

      setChartData({
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            hoverBackgroundColor: colors.map((color) => `${color}AA`),
          },
        ],
      });
    };

    fetchCategories();
  }, []);

  const generateColors = (numColors) => {
    return Array.from({ length: numColors }, () => {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(
        16
      )}`;
      return randomColor.padEnd(7, "0");
    });
  };

  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async () => {
        const snapshot = await database
          .ref(`products/${selectedCategory}`)
          .once("value");
        const products = snapshot.val();
        const productList = Object.keys(products).map((key) => ({
          name: products[key].name,
          stock: products[key].stock,
        }));
        setProducts(productList);

        const labels = productList.map((product) => product.name);
        const data = productList.map((product) => product.stock);

        setProductStockChartData({
          labels,
          datasets: [
            {
              label: "Product Stock Levels",
              data,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
          ],
        });
      };

      fetchProducts();
    }
  }, [selectedCategory]);

  useEffect(() => {
    const fetchOrders = async () => {
      const ordersQuery = query(collectionGroup(db, "orders"));
      const orderSnapshot = await getDocs(ordersQuery);

      const ordersList = orderSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          totalAmount: data.totalAmount || 0,
          timestamp: data.timestamp.toDate(),
          items: data.items || [],
        };
      });

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const filteredOrders = ordersList.filter((order) => {
        const orderDate = new Date(order.timestamp);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      });

      const totalSales = filteredOrders.reduce(
        (acc, order) => acc + order.totalAmount,
        0
      );
      const itemsSold = filteredOrders.reduce(
        (acc, order) => acc + order.items.length,
        0
      );

      setOrders({ totalSales, itemsSold });
    };

    fetchOrders();
  }, []);
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
  } else {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Admin Dashboard
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Stock Overview{" "}
            </h2>
            <div className="mb-8 max-w-lg">
              <label
                htmlFor="category-select"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Select Category
              </label>
              <select
                id="category-select"
                className="p-3 border rounded w-full text-gray-700 shadow-sm"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">-- Select a Category --</option>
                {categories.map((category, index) => (
                  <option key={category.key || index} value={category.key}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && productStockChartData && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Product Stock Levels
                </h2>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Bar data={productStockChartData} />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Category Overview
              </h2>
              <div className="flex flex-col items-center gap-6">
                {chartData && (
                  <div className="bg-white p-6 shadow-md rounded-md max-w-md w-full">
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
                      Product Distribution by Category
                    </h2>
                    <Pie data={chartData} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Monthly Overview
          </h2>
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex flex-col items-center">
                <p className="text-lg font-semibold">Total Sales</p>
                <p className="text-4xl font-bold mt-2 mb-4">
                  ${orders.totalSales.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col items-center border-t border-blue-300 pt-4 mt-4">
                <p className="text-lg font-semibold">Items Sold</p>
                <p className="text-4xl font-bold mt-2">{orders.itemsSold}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminDashboard;

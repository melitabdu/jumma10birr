import React, { useEffect, useState } from "react";
import axios from "axios";

const predefinedIcons = [
  { label: "Mosque", value: "mosque" },
  { label: "Water Well", value: "water" },
  { label: "Students", value: "students" },
  { label: "Donors", value: "donors" },
  { label: "Orphans", value: "orphans" },
  { label: "Quran School", value: "quran" },
];

const ImpactManagement = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [count, setCount] = useState("");
  const [icon, setIcon] = useState(predefinedIcons[0].value);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : null;

  // Fetch impact items (public)
  const fetchItems = async () => {
    try {
      const { data } = await axios.get("/api/impact");
      setItems(data);
    } catch (err) {
      console.error("Error fetching impact items:", err.response?.data || err.message);
      setError("Failed to load impact items.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add or Update item (admin only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || count === "") {
      alert("Title and Count are required");
      return;
    }
    if (!token) {
      alert("You must be logged in as admin to perform this action.");
      return;
    }

    setLoading(true);
    try {
      let data;
      if (editingId) {
        // Update
        const res = await axios.put(
          `/api/impact/${editingId}`,
          { title, count: Number(count), icon },
          config
        );
        data = res.data;
        setItems(items.map((item) => (item._id === editingId ? data : item)));
        setEditingId(null);
      } else {
        // Create
        const res = await axios.post(
          "/api/impact",
          { title, count: Number(count), icon },
          config
        );
        data = res.data;
        setItems([data, ...items]);
      }

      setTitle("");
      setCount("");
      setIcon(predefinedIcons[0].value);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data.message || "Error saving impact item");
    }
    setLoading(false);
  };

  // Edit item
  const handleEdit = (item) => {
    setEditingId(item._id);
    setTitle(item.title);
    setCount(item.count);
    setIcon(item.icon || predefinedIcons[0].value);
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!token) {
      alert("You must be logged in as admin to perform this action.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`/api/impact/${id}`, config);
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data.message || "Error deleting item");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Impact Management</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Add / Edit Form */}
      {token && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <div>
            <label className="block font-semibold">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full"
              placeholder="E.g., Mosques Built"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Count</label>
            <input
              type="number"
              min="0"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="border p-2 w-full"
              placeholder="E.g., 25"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Icon</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="border p-2 w-full"
            >
              {predefinedIcons.map((ic) => (
                <option key={ic.value} value={ic.value}>
                  {ic.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            disabled={loading}
          >
            {editingId ? "Update Item" : "Add Item"}
          </button>
        </form>
      )}

      {/* Impact Items Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Title</th>
            <th className="border p-2">Count</th>
            <th className="border p-2">Icon</th>
            {token && <th className="border p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td className="border p-2">{item.title}</td>
              <td className="border p-2">{item.count}</td>
              <td className="border p-2">{item.icon}</td>
              {token && (
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={token ? 4 : 3} className="text-center p-4">
                No impact items yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ImpactManagement;

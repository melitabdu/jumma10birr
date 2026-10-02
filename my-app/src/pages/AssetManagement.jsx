import React, { useEffect, useState } from "react";
import axios from "axios";

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalAssets: 0,
    activeAssets: 0,
    missingAssets: 0,
    assetsUnderMaintenance: 0,
    totalEstimatedValue: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [condition, setCondition] = useState("");
  const [region, setRegion] = useState("");

  const token = localStorage.getItem("adminToken");

  const API_URL = "http://localhost:5000/api/assets";

  /*
  ================================================
  FETCH ASSETS
  ================================================
  */

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      if (condition) params.condition = condition;
      if (region) params.region = region;

      const response = await axios.get(API_URL, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssets(response.data.assets || []);
    } catch (err) {
      console.error("Error fetching assets:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load assets"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ================================================
  FETCH STATISTICS
  ================================================
  */

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(
        response.data.summary || {
          totalAssets: 0,
          activeAssets: 0,
          missingAssets: 0,
          assetsUnderMaintenance: 0,
          totalEstimatedValue: 0,
        }
      );
    } catch (err) {
      console.error("Error fetching asset statistics:", err);
    }
  };

  /*
  ================================================
  INITIAL LOAD
  ================================================
  */

  useEffect(() => {
    fetchAssets();
    fetchStats();
  }, []);

  /*
  ================================================
  ARCHIVE ASSET
  ================================================
  */

  const handleArchive = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to archive this asset?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchAssets();
      fetchStats();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to archive asset"
      );
    }
  };

  /*
  ================================================
  FORMAT CURRENCY
  ================================================
  */

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  /*
  ================================================
  CATEGORY LABEL
  ================================================
  */

  const formatCategory = (category) => {
    if (!category) return "-";

    return category
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Asset & Wealth Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage EIASC assets, properties, vehicles,
            equipment, and other institutional wealth.
          </p>
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
          onClick={() => {
  window.location.href = "/admin/assets/register";
}}
        >
          + Register Asset
        </button>
      </div>

      {/* ========================================
          STATISTICS
      ======================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">
            Total Assets
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {stats.totalAssets}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">
            Active Assets
          </p>

          <h2 className="text-2xl font-bold mt-2 text-green-600">
            {stats.activeAssets}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">
            Missing Assets
          </p>

          <h2 className="text-2xl font-bold mt-2 text-red-600">
            {stats.missingAssets}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">
            Under Maintenance
          </p>

          <h2 className="text-2xl font-bold mt-2 text-yellow-600">
            {stats.assetsUnderMaintenance}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">
            Estimated Value
          </p>

          <h2 className="text-xl font-bold mt-2 text-blue-600">
            {formatCurrency(
              stats.totalEstimatedValue
            )}
          </h2>
        </div>

      </div>

      {/* ========================================
          FILTERS
      ======================================== */}

      <div className="bg-white p-5 rounded-xl shadow mb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* Search */}

          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchAssets();
              }
            }}
            className="border rounded-lg px-4 py-3"
          />

          {/* Category */}

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setTimeout(fetchAssets, 0);
            }}
            className="border rounded-lg px-4 py-3"
          >
            <option value="">
              All Categories
            </option>

            <option value="land">
              Land
            </option>

            <option value="building">
              Building
            </option>

            <option value="vehicle">
              Vehicle
            </option>

            <option value="equipment">
              Equipment
            </option>

            <option value="furniture">
              Furniture
            </option>

            <option value="it_equipment">
              IT Equipment
            </option>

            <option value="religious_asset">
              Religious Asset
            </option>

            <option value="financial_asset">
              Financial Asset
            </option>

            <option value="other">
              Other
            </option>
          </select>

          {/* Status */}

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setTimeout(fetchAssets, 0);
            }}
            className="border rounded-lg px-4 py-3"
          >
            <option value="">
              All Statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="under_maintenance">
              Under Maintenance
            </option>

            <option value="missing">
              Missing
            </option>

            <option value="transferred">
              Transferred
            </option>

            <option value="disposed">
              Disposed
            </option>
          </select>

          {/* Condition */}

          <select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setTimeout(fetchAssets, 0);
            }}
            className="border rounded-lg px-4 py-3"
          >
            <option value="">
              All Conditions
            </option>

            <option value="excellent">
              Excellent
            </option>

            <option value="good">
              Good
            </option>

            <option value="fair">
              Fair
            </option>

            <option value="poor">
              Poor
            </option>

            <option value="damaged">
              Damaged
            </option>
          </select>

          {/* Region */}

          <input
            type="text"
            placeholder="Region..."
            value={region}
            onChange={(e) =>
              setRegion(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchAssets();
              }
            }}
            className="border rounded-lg px-4 py-3"
          />

        </div>

        <div className="flex gap-3 mt-4">

          <button
            onClick={fetchAssets}
            className="bg-gray-800 text-white px-5 py-2 rounded-lg"
          >
            Search
          </button>

          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setStatus("");
              setCondition("");
              setRegion("");

              setTimeout(fetchAssets, 0);
            }}
            className="border px-5 py-2 rounded-lg"
          >
            Reset
          </button>

        </div>

      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* ========================================
          TABLE
      ======================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-5 border-b">
          <h2 className="text-xl font-bold">
            Registered Assets
          </h2>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            Loading assets...
          </div>
        ) : assets.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No assets found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>
                  <th className="text-left px-5 py-4">
                    Asset ID
                  </th>

                  <th className="text-left px-5 py-4">
                    Name
                  </th>

                  <th className="text-left px-5 py-4">
                    Category
                  </th>

                  <th className="text-left px-5 py-4">
                    Location
                  </th>

                  <th className="text-left px-5 py-4">
                    Condition
                  </th>

                  <th className="text-left px-5 py-4">
                    Status
                  </th>

                  <th className="text-left px-5 py-4">
                    Value
                  </th>

                  <th className="text-left px-5 py-4">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody>

                {assets.map((asset) => (

                  <tr
                    key={asset._id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-5 py-4 font-mono text-sm">
                      {asset.assetId}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {asset.name}
                    </td>

                    <td className="px-5 py-4">
                      {formatCategory(
                        asset.category
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {asset.location?.region || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {asset.condition || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {asset.status || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {formatCurrency(
                        asset.estimatedValue
                      )}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() =>
                            alert(
                              `View ${asset.assetId}`
                            )
                          }
                        >
                          View
                        </button>

                        <button
                          className="text-yellow-600 hover:underline"
                          onClick={() =>
                            alert(
                              `Edit ${asset.assetId}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="text-red-600 hover:underline"
                          onClick={() =>
                            handleArchive(
                              asset._id
                            )
                          }
                        >
                          Archive
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default AssetManagement;
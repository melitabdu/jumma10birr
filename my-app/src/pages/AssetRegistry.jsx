import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AssetRegistration = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    description: "",
    category: "",
    subCategory: "",

    // Acquisition
    acquisitionMethod: "",
    acquisitionDate: "",
    acquisitionCost: "",
    currency: "ETB",

    // Ownership
    ownershipType: "",
    legalOwner: "",
    ownershipDocumentNumber: "",

    // Location
    region: "",
    city: "",
    zone: "",
    woreda: "",
    kebele: "",
    specificLocation: "",

    // Responsibility
    responsibleDepartment: "",
    responsibleOffice: "",
    responsiblePerson: "",

    // Condition and status
    condition: "good",
    status: "active",

    // Valuation
    estimatedValue: "",
    valuationDate: "",

    // Specifications
    specifications: {},
  });

  /*
  ================================================
  HANDLE INPUT
  ================================================
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  ================================================
  HANDLE SPECIFICATION
  ================================================
  */

  const handleSpecificationChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,

      specifications: {
        ...previous.specifications,
        [name]: value,
      },
    }));
  };

  /*
  ================================================
  SUBMIT
  ================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: formData.name,
        description: formData.description,

        category: formData.category,
        subCategory: formData.subCategory,

        acquisitionMethod:
          formData.acquisitionMethod,

        acquisitionDate:
          formData.acquisitionDate || undefined,

        acquisitionCost:
          formData.acquisitionCost
            ? Number(formData.acquisitionCost)
            : 0,

        currency: formData.currency,

        ownershipType:
          formData.ownershipType,

        legalOwner:
          formData.legalOwner,

        ownershipDocumentNumber:
          formData.ownershipDocumentNumber,

        location: {
          region: formData.region,
          city: formData.city,
          zone: formData.zone,
          woreda: formData.woreda,
          kebele: formData.kebele,
          specificLocation:
            formData.specificLocation,
        },

        responsibleDepartment:
          formData.responsibleDepartment,

        responsibleOffice:
          formData.responsibleOffice,

        responsiblePerson:
          formData.responsiblePerson,

        condition: formData.condition,

        status: formData.status,

        estimatedValue:
          formData.estimatedValue
            ? Number(formData.estimatedValue)
            : 0,

        valuationDate:
          formData.valuationDate || undefined,

        specifications:
          formData.specifications,
      };

      const response = await axios.post(
        "http://localhost:5000/api/assets",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(
        `Asset registered successfully. Asset ID: ${response.data.asset.assetId}`
      );

      setTimeout(() => {
        navigate("/admin/assets");
      }, 1500);

    } catch (err) {
      console.error("Asset registration error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to register asset"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ================================================
  INPUT COMPONENT
  ================================================
  */

  const InputField = ({
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Asset Registry
          </h1>

          <p className="text-gray-500 mt-1">
            Register an existing EIASC asset in the institutional asset register.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/assets")}
          className="border border-gray-300 bg-white px-5 py-3 rounded-lg hover:bg-gray-50"
        >
          ← Back to Assets
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ========================================
            BASIC INFORMATION
        ======================================== */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            1. Basic Asset Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="md:col-span-2">

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name
                <span className="text-red-500 ml-1">
                  *
                </span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Example: EIASC Head Office Building"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
                <span className="text-red-500 ml-1">
                  *
                </span>
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >

                <option value="">
                  Select Category
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

            </div>

            <InputField
              label="Subcategory"
              name="subCategory"
              placeholder="Example: Office Building"
            />

            <div className="md:col-span-2">

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the asset..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />

            </div>

          </div>

        </div>

        {/* ========================================
            ACQUISITION
        ======================================== */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            2. Acquisition Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <InputField
              label="Acquisition Method"
              name="acquisitionMethod"
              placeholder="Purchased / Donated / Constructed"
            />

            <InputField
              label="Acquisition Date"
              name="acquisitionDate"
              type="date"
            />

            <InputField
              label="Acquisition Cost"
              name="acquisitionCost"
              type="number"
              placeholder="0"
            />

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>

              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >

                <option value="ETB">
                  ETB
                </option>

                <option value="USD">
                  USD
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* ========================================
            OWNERSHIP
        ======================================== */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            3. Ownership Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <InputField
              label="Ownership Type"
              name="ownershipType"
              placeholder="Owned / Leased / Donated"
            />

            <InputField
              label="Legal Owner"
              name="legalOwner"
              placeholder="Ethiopian Islamic Affairs Supreme Council"
            />

            <InputField
              label="Ownership Document Number"
              name="ownershipDocumentNumber"
              placeholder="Title deed / registration number"
            />

          </div>

        </div>

        {/* ========================================
            LOCATION
        ======================================== */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            4. Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <InputField
              label="Region"
              name="region"
            />

            <InputField
              label="City"
              name="city"
            />

            <InputField
              label="Zone"
              name="zone"
            />

            <InputField
              label="Woreda"
              name="woreda"
            />

            <InputField
              label="Kebele"
              name="kebele"
            />

            <InputField
              label="Specific Location"
              name="specificLocation"
              placeholder="Building / compound / address"
            />

          </div>

        </div>

        {/* ========================================
            RESPONSIBILITY
        ======================================== */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            5. Responsibility and Control
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <InputField
              label="Responsible Department"
              name="responsibleDepartment"
            />

            <InputField
              label="Responsible Office"
              name="responsibleOffice"
            />

            <InputField
              label="Responsible Person"
              name="responsiblePerson"
            />

          </div>

        </div>

        {/* ========================================
            CONDITION AND VALUE
        ======================================== */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            6. Condition and Valuation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>

              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >

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

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >

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

            </div>

            <InputField
              label="Estimated Current Value"
              name="estimatedValue"
              type="number"
            />

            <InputField
              label="Valuation Date"
              name="valuationDate"
              type="date"
            />

          </div>

        </div>

        {/* ========================================
            DYNAMIC SPECIFICATIONS
        ======================================== */}

        {formData.category === "land" && (

          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              7. Land Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <input
                name="plotNumber"
                placeholder="Plot Number"
                onChange={handleSpecificationChange}
                className="border rounded-lg px-4 py-3"
              />

              <input
                name="titleDeedNumber"
                placeholder="Title Deed Number"
                onChange={handleSpecificationChange}
                className="border rounded-lg px-4 py-3"
              />

              <input
                name="area"
                placeholder="Area"
                onChange={handleSpecificationChange}
                className="border rounded-lg px-4 py-3"
              />

            </div>

          </div>

        )}

        {formData.category === "vehicle" && (

          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              7. Vehicle Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <input
                name="plateNumber"
                placeholder="Plate Number"
                onChange={handleSpecificationChange}
                className="border rounded-lg px-4 py-3"
              />

              <input
                name="chassisNumber"
                placeholder="Chassis Number"
                onChange={handleSpecificationChange}
                className="border rounded-lg px-4 py-3"
              />

              <input
                name="engineNumber"
                placeholder="Engine Number"
                onChange={handleSpecificationChange}
                className="border rounded-lg px-4 py-3"
              />

            </div>

          </div>

        )}

        {formData.category === "it_equipment" && (

          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              7. IT Equipment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <input
                name="brand"
                placeholder="Brand"
                onChange={handleSpecificationChange}
                className="border rounded-lg px-4 py-3"
              />

              <input
                name="model"
                placeholder="Model"
                onChange={handleSpecificationChange}
                className="border rounded-lg px-4 py-3"
              />

              <input
                name="serialNumber"
                placeholder="Serial Number"
                onChange={handleSpecificationChange}
                className="border rounded-lg px-4 py-3"
              />

            </div>

          </div>

        )}

        {/* ========================================
            SUBMIT
        ======================================== */}

        <div className="flex justify-end gap-4 mb-10">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/assets")
            }
            className="border px-6 py-3 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading
              ? "Registering..."
              : "Register Asset"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default AssetRegistration;
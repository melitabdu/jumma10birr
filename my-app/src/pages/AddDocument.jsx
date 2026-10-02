import React, { useState } from "react";
import axios from "axios";
import "./AddDocuments.css";

const AddDocument = () => {
  const token = localStorage.getItem("adminToken");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Hajj",
    language: "English",
    source: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    if (!file) {
      setError("Please select a document file.");
      return;
    }

    const data = new FormData();

    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("language", formData.language);
    data.append("source", formData.source);
    data.append("file", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/documents",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(
        res.data?.message || "✅ Document uploaded successfully."
      );

      setFormData({
        title: "",
        description: "",
        category: "Hajj",
        language: "English",
        source: "",
      });

      setFile(null);

      // Reset file input
      const fileInput = document.getElementById("document-file");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Document upload error:", err);

      setError(
        err.response?.data?.message ||
          "❌ Failed to upload document."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-document-page">
      <div className="add-document-card">
        <div className="add-document-header">
          <h2>📄 Add Hajj Document</h2>
          <p>
            Upload official Hajj information to the EIASC AI knowledge base.
          </p>
        </div>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              Document Title <span>*</span>
            </label>

            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Example: Hajj Registration Guide"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this document..."
              rows="4"
            />
          </div>

          {/* Category */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Hajj">Hajj</option>
                <option value="Registration">
                  Registration
                </option>
                <option value="Guidelines">
                  Guidelines
                </option>
                <option value="Travel">
                  Travel
                </option>
                <option value="Health">
                  Health
                </option>
                <option value="General">
                  General
                </option>
              </select>
            </div>

            {/* Language */}
            <div className="form-group">
              <label htmlFor="language">
                Language
              </label>

              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="English">
                  English
                </option>

                <option value="Amharic">
                  Amharic
                </option>
              </select>
            </div>
          </div>

          {/* Source */}
          <div className="form-group">
            <label htmlFor="source">
              Source
            </label>

            <input
              id="source"
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="Example: EIASC Hajj Directorate"
            />
          </div>

          {/* File */}
          <div className="form-group">
            <label htmlFor="document-file">
              Document File <span>*</span>
            </label>

            <input
              id="document-file"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              required
            />

            {file && (
              <div className="selected-file">
                📎 {file.name}
              </div>
            )}

            <small>
              Supported formats: PDF, DOC, DOCX, TXT
            </small>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="upload-document-button"
            disabled={loading}
          >
            {loading
              ? "⏳ Uploading..."
              : "📤 Upload Document"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDocument;
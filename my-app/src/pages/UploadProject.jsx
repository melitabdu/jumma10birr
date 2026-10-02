import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UploadProject.css";

const UploadProject = () => {
  // ======================
  // FORM STATES
  // ======================
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("planned");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  // ======================
  // PROJECT STATES
  // ======================
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("adminToken");

  // ======================
  // BASE URL
  // ======================
  const API_BASE = "http://localhost:5000/api/proposals";

  // ======================
  // FETCH PROJECTS
  // ======================
  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(API_BASE);
      setProjects(data.proposals || []);
    } catch (err) {
      console.error("Fetch projects error:", err);

      setMessage(
        err.response?.data?.message ||
          "❌ Failed to fetch projects"
      );
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ======================
  // RESET FORM
  // ======================
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setStatus("planned");
    setProgress(0);
    setEditingId(null);

    // Reset file input visually
    const fileInput = document.getElementById("proposal-file");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // ======================
  // UPLOAD PROJECT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !file) {
      setMessage(
        "❌ Please fill all fields and select a file."
      );
      return;
    }

    try {
      setMessage("Uploading project...");

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("proposalFile", file);
      formData.append("status", status);
      formData.append("progress", Number(progress));

      console.log("Uploading:");
      console.log("Title:", title);
      console.log("Description:", description);
      console.log("File:", file);
      console.log("Status:", status);
      console.log("Progress:", progress);

      const { data } = await axios.post(
        `${API_BASE}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("UPLOAD RESPONSE:", data);

      setMessage(
        "✅ Project uploaded successfully!"
      );

      resetForm();

      await fetchProjects();
    } catch (err) {
      console.error("Upload error:", err);

      console.error(
        "Server response:",
        err.response?.data
      );

      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;

      setMessage(`❌ Upload failed: ${serverMsg}`);
    }
  };

  // ======================
  // UPDATE PROJECT
  // ======================
  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      setMessage("Updating project...");

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("status", status);
      formData.append("progress", Number(progress));

      if (file) {
        formData.append("proposalFile", file);
      }

      const { data } = await axios.put(
        `${API_BASE}/${editingId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("UPDATE RESPONSE:", data);

      setMessage(
        "✅ Project updated successfully!"
      );

      resetForm();

      await fetchProjects();
    } catch (err) {
      console.error("Update error:", err);

      console.error(
        "Server response:",
        err.response?.data
      );

      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;

      setMessage(`❌ Update failed: ${serverMsg}`);
    }
  };

  // ======================
  // DELETE PROJECT
  // ======================
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(
        "✅ Project deleted successfully!"
      );

      await fetchProjects();
    } catch (err) {
      console.error("Delete error:", err);

      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;

      setMessage(`❌ Delete failed: ${serverMsg}`);
    }
  };

  // ======================
  // START EDIT
  // ======================
  const startEdit = (project) => {
    setEditingId(project._id);
    setTitle(project.title || "");
    setDescription(project.description || "");
    setStatus(project.status || "planned");
    setProgress(project.progress || 0);
    setFile(null);

    setMessage(
      "Editing project. Select a new file only if you want to replace the existing file."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================
  // CANCEL EDIT
  // ======================
  const cancelEdit = () => {
    resetForm();
    setMessage("");
  };

  return (
    <div className="upload-container">
      <h1 className="upload-title">
        Admin Project Manager
      </h1>

      {message && (
        <p className="upload-message">
          {message}
        </p>
      )}

      {/* ================= FORM ================= */}
      <form
        className="upload-form"
        onSubmit={
          editingId
            ? (e) => e.preventDefault()
            : handleSubmit
        }
      >
        <input
          type="text"
          placeholder="Project Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />

        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          required
        />

        <input
          id="proposal-file"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          required={!editingId}
        />

        {file && (
          <p className="selected-file">
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="planned">
            Planned
          </option>

          <option value="ongoing">
            Ongoing
          </option>

          <option value="completed">
            Completed
          </option>
        </select>

        <input
          type="number"
          min="0"
          max="100"
          placeholder="Progress %"
          value={progress}
          onChange={(e) =>
            setProgress(e.target.value)
          }
        />

        {editingId ? (
          <div className="edit-actions">
            <button
              type="button"
              className="upload-btn"
              onClick={handleUpdate}
            >
              Update Project
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="submit"
            className="upload-btn"
          >
            Upload Project
          </button>
        )}
      </form>

      {/* ================= PROJECT LIST ================= */}
      <h2 className="admin-subtitle">
        Existing Projects
      </h2>

      <div className="admin-project-list">
        {projects.length === 0 ? (
          <p>No projects uploaded yet.</p>
        ) : (
          projects.map((p) => (
            <div
              className="admin-project-card"
              key={p._id}
            >
              <h3>{p.title}</h3>

              <p>{p.description}</p>

              <p>
                Status:{" "}
                <strong>{p.status}</strong>
              </p>

              <p>
                Progress: {p.progress}%
              </p>

              {p.fileUrl && (
                <p>
                  <a
                    href={p.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 View Proposal
                  </a>
                </p>
              )}

              <div className="admin-actions">
                <button
                  onClick={() => startEdit(p)}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(p._id)
                  }
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UploadProject;
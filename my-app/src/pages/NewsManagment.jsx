import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NewsManagement.css";

const NewsManagement = () => {
  // ==========================================
  // FORM STATES
  // ==========================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("general");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // ==========================================
  // NEWS STATES
  // ==========================================

  const [news, setNews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState("");

  const token = localStorage.getItem("adminToken");

  // ==========================================
  // API
  // ==========================================

  const API_BASE = "http://localhost:5000/api/news";

  // ==========================================
  // FETCH NEWS
  // ==========================================

  const fetchNews = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(API_BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNews(data.news || []);
    } catch (err) {
      console.error("Fetch news error:", err);

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to fetch news: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContent("");
    setImage("");
    setCategory("general");
    setYoutubeUrl("");
    setVideoUrl("");
    setIsFeatured(false);
    setIsPublished(false);
    setEditingId(null);
  };

  // ==========================================
  // CREATE NEWS
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !description.trim() ||
      !content.trim()
    ) {
      setMessageText(
        "❌ Title, description and content are required."
      );
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        API_BASE,
        {
          title,
          description,
          content,
          image,
          category,
          youtubeUrl,
          videoUrl,
          isFeatured,
          isPublished,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageText(
        "✅ News created successfully!"
      );

      resetForm();
      await fetchNews();
    } catch (err) {
      console.error("Create news error:", err);

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to create news: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE NEWS
  // ==========================================

  const handleUpdate = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !content.trim()
    ) {
      setMessageText(
        "❌ Title, description and content are required."
      );
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${API_BASE}/${editingId}`,
        {
          title,
          description,
          content,
          image,
          category,
          youtubeUrl,
          videoUrl,
          isFeatured,
          isPublished,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageText(
        "✅ News updated successfully!"
      );

      resetForm();
      await fetchNews();
    } catch (err) {
      console.error("Update news error:", err);

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to update news: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE NEWS
  // ==========================================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this news?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(`${API_BASE}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessageText(
        "✅ News deleted successfully!"
      );

      await fetchNews();
    } catch (err) {
      console.error("Delete news error:", err);

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to delete news: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // START EDIT
  // ==========================================

  const startEdit = (item) => {
    setEditingId(item._id);

    setTitle(item.title || "");
    setDescription(item.description || "");
    setContent(item.content || "");
    setImage(item.image || "");
    setCategory(item.category || "general");
    setYoutubeUrl(item.youtubeUrl || "");
    setVideoUrl(item.videoUrl || "");
    setIsFeatured(Boolean(item.isFeatured));
    setIsPublished(Boolean(item.isPublished));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // TOGGLE PUBLISH
  // ==========================================

  const togglePublish = async (item) => {
    try {
      setLoading(true);

      await axios.put(
        `${API_BASE}/${item._id}`,
        {
          isPublished: !item.isPublished,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageText(
        item.isPublished
          ? "✅ News unpublished."
          : "✅ News published."
      );

      await fetchNews();
    } catch (err) {
      console.error(
        "Publish toggle error:",
        err
      );

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to change publication status: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // TOGGLE FEATURED
  // ==========================================

  const toggleFeatured = async (item) => {
    try {
      setLoading(true);

      await axios.put(
        `${API_BASE}/${item._id}`,
        {
          isFeatured: !item.isFeatured,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageText(
        item.isFeatured
          ? "✅ News removed from featured."
          : "⭐ News added to featured."
      );

      await fetchNews();
    } catch (err) {
      console.error(
        "Featured toggle error:",
        err
      );

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to change featured status: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-container">

      {/* ========================================
          PAGE TITLE
      ======================================== */}

      <h1 className="news-title">
        News Management
      </h1>

      {messageText && (
        <p className="news-message">
          {messageText}
        </p>
      )}

      {/* ========================================
          FORM
      ======================================== */}

      <form
        className="news-form"
        onSubmit={
          editingId
            ? (e) => e.preventDefault()
            : handleSubmit
        }
      >
        <h2>
          {editingId
            ? "Edit News"
            : "Create News"}
        </h2>

        {/* TITLE */}

        <input
          type="text"
          placeholder="News Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />

        {/* DESCRIPTION */}

        <textarea
          placeholder="Short Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          rows={3}
          required
        />

        {/* CONTENT */}

        <textarea
          placeholder="Full News Content"
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          rows={8}
          required
        />

        {/* IMAGE */}

        <input
          type="text"
          placeholder="Image URL (optional)"
          value={image}
          onChange={(e) =>
            setImage(e.target.value)
          }
        />

        {/* CATEGORY */}

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option value="general">
            General
          </option>

          <option value="hajj">
            Hajj
          </option>

          <option value="eiasc">
            EIASC
          </option>

          <option value="saudi">
            Saudi Arabia
          </option>

          <option value="guidance">
            Hajj Guidance
          </option>
        </select>

        {/* YOUTUBE */}

        <input
          type="url"
          placeholder="YouTube Video URL (optional)"
          value={youtubeUrl}
          onChange={(e) =>
            setYoutubeUrl(e.target.value)
          }
        />

        {/* DIRECT VIDEO */}

        <input
          type="url"
          placeholder="Video URL (optional)"
          value={videoUrl}
          onChange={(e) =>
            setVideoUrl(e.target.value)
          }
        />

        {/* FEATURED */}

        <label className="news-checkbox">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) =>
              setIsFeatured(e.target.checked)
            }
          />

          ⭐ Feature this news
        </label>

        {/* PUBLISH */}

        <label className="news-checkbox">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) =>
              setIsPublished(e.target.checked)
            }
          />

          Publish immediately
        </label>

        {/* BUTTONS */}

        <div className="news-form-actions">

          {editingId ? (
            <>
              <button
                type="button"
                className="news-btn"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading
                  ? "Updating..."
                  : "Update News"}
              </button>

              <button
                type="button"
                className="news-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="news-btn"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create News"}
            </button>
          )}

        </div>
      </form>

      {/* ========================================
          NEWS LIST
      ======================================== */}

      <h2 className="news-subtitle">
        Existing News
      </h2>

      {loading && news.length === 0 ? (
        <p>Loading news...</p>
      ) : news.length === 0 ? (
        <p>No news created yet.</p>
      ) : (
        <div className="news-list">

          {news.map((item) => (
            <div
              className="news-card"
              key={item._id}
            >

              {/* IMAGE */}

              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="news-image"
                />
              )}

              <h3>{item.title}</h3>

              {/* DESCRIPTION */}

              <p className="news-card-description">
                {item.description}
              </p>

              {/* CATEGORY */}

              <p>
                Category:{" "}
                <strong>
                  {item.category}
                </strong>
              </p>

              {/* YOUTUBE */}

              {item.youtubeUrl && (
                <p>
                  🎬 YouTube:{" "}
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch Video
                  </a>
                </p>
              )}

              {/* VIDEO */}

              {item.videoUrl && (
                <p>
                  🎥 Direct Video:{" "}
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch Video
                  </a>
                </p>
              )}

              {/* FEATURED STATUS */}

              <p>
                Featured:{" "}
                <strong>
                  {item.isFeatured
                    ? "⭐ Yes"
                    : "No"}
                </strong>
              </p>

              {/* PUBLISHED STATUS */}

              <p>
                Status:{" "}
                <strong
                  className={
                    item.isPublished
                      ? "published"
                      : "draft"
                  }
                >
                  {item.isPublished
                    ? "Published"
                    : "Draft"}
                </strong>
              </p>

              {/* DATE */}

              {item.publishedAt && (
                <p>
                  Published:{" "}
                  {new Date(
                    item.publishedAt
                  ).toLocaleString()}
                </p>
              )}

              {/* ACTIONS */}

              <div className="news-actions">

                <button
                  onClick={() =>
                    startEdit(item)
                  }
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() =>
                    toggleFeatured(item)
                  }
                >
                  {item.isFeatured
                    ? "Remove Featured"
                    : "⭐ Feature"}
                </button>

                <button
                  onClick={() =>
                    togglePublish(item)
                  }
                >
                  {item.isPublished
                    ? "Unpublish"
                    : "Publish"}
                </button>

                <button
                  onClick={() =>
                    handleDelete(item._id)
                  }
                >
                  🗑 Delete
                </button>

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default NewsManagement;
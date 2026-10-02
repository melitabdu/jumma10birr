import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

import Sidebar from "../components/Sidebar";
import "./AdminLayouts.css";

const AdminLayouts = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <Sidebar
        menuOpen={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />

      {/* Main area */}
      <div className="admin-content">

        {/* Mobile menu button */}
        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Current page */}
        <main className="admin-main">
          <Outlet />
        </main>

      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

    </div>
  );
};

export default AdminLayouts;

import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageCircle,
  Upload,
  Newspaper,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Boxes,
  Megaphone,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({ onNavigate }) {
  const navClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <aside className="sidebar">

      {/* Sidebar Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">EI</div>

        <div>
          <h2>EIASC</h2>
          <span>Hajj AI Admin</span>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="sidebar-nav">

        {/* Dashboard */}
        <NavLink
          to="/"
          end
          onClick={onNavigate}
          className={navClass}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* Documents */}
        <NavLink
          to="/documents"
          end
          onClick={onNavigate}
          className={navClass}
        >
          <FileText size={20} />
          <span>Documents</span>
        </NavLink>

        {/* Add Document */}
        <NavLink
          to="/documents/add"
          onClick={onNavigate}
          className={navClass}
        >
          <PlusCircle size={20} />
          <span>Add Document</span>
        </NavLink>

        {/* Test Chatbot */}
        <NavLink
          to="/chatbot"
          onClick={onNavigate}
          className={navClass}
        >
          <MessageCircle size={20} />
          <span>Test Chatbot</span>
        </NavLink>

        {/* Upload Project */}
        <NavLink
          to="/projects/upload"
          onClick={onNavigate}
          className={navClass}
        >
          <Upload size={20} />
          <span>Upload Project</span>
        </NavLink>

        {/* News Management */}
        <NavLink
          to="/news"
          onClick={onNavigate}
          className={navClass}
        >
          <Newspaper size={20} />
          <span>News Management</span>
        </NavLink>

        {/* Impact Management */}
        <NavLink
          to="/impact"
          onClick={onNavigate}
          className={navClass}
        >
          <ChartNoAxesColumnIncreasing size={20} />
          <span>Impact Management</span>
        </NavLink>

        {/* Asset Registry */}
        <NavLink
          to="/assets/registry"
          onClick={onNavigate}
          className={navClass}
        >
          <ClipboardList size={20} />
          <span>Asset Registry</span>
        </NavLink>

        {/* Asset Management */}
        <NavLink
          to="/assets"
          end
          onClick={onNavigate}
          className={navClass}
        >
          <Boxes size={20} />
          <span>Asset Management</span>
        </NavLink>

        {/* Announcement Management */}
        <NavLink
          to="/announcements"
          onClick={onNavigate}
          className={navClass}
        >
          <Megaphone size={20} />
          <span>Announcement Management</span>
        </NavLink>

      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <p>EIASC Hajj Operation</p>
        <span>RAG Knowledge System</span>
      </div>

    </aside>
  );
}

export default Sidebar;
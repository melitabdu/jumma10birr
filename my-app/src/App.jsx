
import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Layout
import AdminLayouts from "./layouts/AdminLayouts";

import AdminRegister from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import AddDocument from "./pages/AddDocument";
import Chatbot from "./pages/Chatbot";

// Project, News, and Impact Pages
import UploadProject from "./pages/UploadProject";
import NewsManagement from "./pages/NewsManagment";
import ImpactManagement from "./pages/ImpactManagment";

// Asset and Announcement Pages
import AssetRegistry from "./pages/AssetRegistry";
import AssetManagment from "./pages/AssetManagement";
import AnnouncementManagement from "./pages/AnnouncementManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Admin Layout */}
        <Route element={<AdminLayouts />}>
        <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Documents */}
          <Route
            path="/documents"
            element={<Documents />}
          />

          {/* Add Document */}
          <Route
            path="/documents/add"
            element={<AddDocument />}
          />

          {/* Test Chatbot */}
          <Route
            path="/chatbot"
            element={<Chatbot />}
          />

          {/* Upload Project */}
          <Route
            path="/projects/upload"
            element={<UploadProject />}
          />

          {/* News Management */}
          <Route
            path="/news"
            element={<NewsManagement />}
          />

          {/* Impact Management */}
          <Route
            path="/impact"
            element={<ImpactManagement />}
          />

          {/* Asset Registry */}
          <Route
            path="/assets/registry"
            element={<AssetRegistry />}
          />

          {/* Asset Management */}
          <Route
            path="/assets"
            element={<AssetManagment />}
          />

          {/* Announcement Management */}
          <Route
            path="/announcements"
            element={<AnnouncementManagement />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
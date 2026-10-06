// server.js

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import morgan from "morgan";

// ===== Routes =====
import userRoutes from "./routes/userRoutes.js";
import mosqueRoutes from "./routes/mosqueRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import impactRoutes from "./routes/impactRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
// ===== Middleware =====
import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

// ======================================================
// LOAD ENVIRONMENT VARIABLES
// ======================================================

dotenv.config();

// ======================================================
// CONNECT DATABASE
// ======================================================

connectDB();

// ======================================================
// INITIALIZE EXPRESS
// ======================================================

const app = express();

// ======================================================
// BODY PARSERS
// ======================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// CORS SETUP
// ======================================================

const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5734",
  "http://localhost:8081",
  "http://localhost:19006",
  "https://your-vercel-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // such as Postman or server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (!allowedOrigins.includes(origin)) {
        return callback(
          new Error(`CORS blocked for origin: ${origin}`),
          false
        );
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

// ======================================================
// LOGGER
// ======================================================

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ======================================================
// ROOT TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.send("✅ EIASC Fundraising API is running...");
});

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/users", userRoutes);

app.use("/api/mosques", mosqueRoutes);

app.use("/api/donations", donationRoutes);

app.use("/api/transfers", transferRoutes);

app.use("/api/admin", adminAuthRoutes);

app.use("/api/impact", impactRoutes);
app.use("/api/news", newsRoutes);

app.use("/api/proposals", proposalRoutes);

app.use("/api/assets", assetRoutes);

app.use("/api/announcements", announcementRoutes);




app.use("/api/notifications", notificationRoutes);
// ======================================================
// CHATBOT ROUTES
// ======================================================

app.use("/api/chatbot", chatbotRoutes);
app.use("/api/documents", documentRoutes);
// ======================================================
// HEALTH ROUTE
// ======================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server running fine 🚀",
  });
});

// ======================================================
// SUPABASE TEST ROUTE
// ======================================================

import supabase from "./config/supabase.js";

app.get("/api/supabase-test", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Supabase Error:", error);

      return res.status(500).json({
        success: false,
        message: "Supabase connection failed",
        error: error.message,
      });
    }

    console.log("✅ Supabase connection successful");

    return res.status(200).json({
      success: true,
      message: "Supabase connection successful",
      data,
    });
  } catch (error) {
    console.error("❌ Supabase Test Error:", error);

    return res.status(500).json({
      success: false,
      message: "Supabase test failed",
      error: error.message,
    });
  }
});

// ======================================================
// ERROR HANDLERS
// ======================================================

app.use(notFound);

app.use(errorHandler);

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );

});
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getPrivacySettings,
  updatePrivacySettings,
  resetPrivacySettings,
} from "../controllers/settings.controller.js";

const router = express.Router();

// Privacy settings routes
router.get("/privacy", protectRoute, getPrivacySettings);
router.put("/privacy", protectRoute, updatePrivacySettings);
router.post("/privacy/reset", protectRoute, resetPrivacySettings);

export default router;

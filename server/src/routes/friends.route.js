import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  blockUser,
  unblockUser,
  getFriendRequests,
  getFriends,
  removeFriend,
} from "../controllers/friends.controller.js";

const router = express.Router();

// Friend request routes
router.post("/request/:receiverId", protectRoute, sendFriendRequest);
router.post("/accept/:senderId", protectRoute, acceptFriendRequest);
router.post("/reject/:senderId", protectRoute, rejectFriendRequest);

// Block/unblock routes
router.post("/block/:targetId", protectRoute, blockUser);
router.post("/unblock/:targetId", protectRoute, unblockUser);

// Get data routes
router.get("/requests", protectRoute, getFriendRequests);
router.get("/", protectRoute, getFriends);

// Remove friend
router.delete("/:friendId", protectRoute, removeFriend);

export default router;

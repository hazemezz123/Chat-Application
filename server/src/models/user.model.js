import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    // Friend system fields
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    friendRequests: [{
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    sentRequests: [{
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // Privacy settings
    privacySettings: {
      allowMessagesFrom: {
        type: String,
        enum: ["everyone", "friends", "nobody"],
        default: "everyone"
      },
      allowFriendRequestsFrom: {
        type: String,
        enum: ["everyone", "nobody"],
        default: "everyone"
      },
      showOnlineStatus: {
        type: Boolean,
        default: true
      },
      showLastSeen: {
        type: Boolean,
        default: true
      }
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

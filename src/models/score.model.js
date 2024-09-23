import mongoose, { Schema } from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    domain_name: {
      type: String,
      required: true,
    },
    blocker: {
      type: Number,
      default: 0,
    },
    critical: {
      type: Number,
      default: 0,
    },
    major: {
      type: Number,
      default: 0,
    },
    normal: {
      type: Number,
      default: 0,
    },
    minor: {
      type: Number,
      default: 0,
    },
    issueScore: {
      type: Number,
      required: true,
    },
    issueCount: {
      type: Number,
      default: 0,
    },
    previousScore: {
      type: Number,
      default: 0,
    },
    activities: {
      type: [String],
      default: [],
    },
    numberOfActivities: {
      type: Number,
      default: 0,
    },
    courses: {
      type: [String],
      default: [],
    },
    numberOfCourses: {
      type: Number,
      default: 0,
    },
    biweeklyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "biweeklyData",
    },
    image_url: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2012/04/13/21/07/user-33638_1280.png",
    },
  },
  {
    timestamps: true, // Enable timestamps
  },
);

export const Score = mongoose.model("Score", scoreSchema);

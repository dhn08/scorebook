import mongoose, { Schema } from "mongoose";

const calenderSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  team: { type: String },

  activities_performed: {
    type: [String],
    default: [], // Empty array by default
  },
  day: {
    type: String,
    required: true,
  },
});
export const Calender = mongoose.model("Calender", calenderSchema);

import mongoose, { Schema } from "mongoose";

const monthlyCalenderDataSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  excelFile: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Calendar",
    },
  ],
});
export const MonthlyCalenderData = mongoose.model(
  "MonthlyCalenderData",
  monthlyCalenderDataSchema,
);

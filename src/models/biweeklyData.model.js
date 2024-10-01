import mongoose, { Schema } from "mongoose";

const biweeklyDataSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    excelFile: {
      public_Id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
    },
    scores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Score", // Assuming you have a 'Score' model defined elsewhere
      },
    ],
  },
  {
    timestamps: true, // Enable timestamps
  },
);

export const BiweeklyData = mongoose.model("BiweeklyData", biweeklyDataSchema);

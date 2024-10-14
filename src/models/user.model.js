import mongoose, { Schema } from "mongoose";

const user = new mongoose.Schema({
  domain_name: {
    type: String,
    unique: true,
  },

  image: {
    public_Id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});
export const User = mongoose.model("User", user);

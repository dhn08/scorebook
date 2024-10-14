import { User } from "../models/user.model.js";
import {
  deleteImageFile,
  imageUploadOnCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";

const uploadUserImage = async (req, res) => {
  const { domainName } = req.body;
  const file = req.file;
  // console.log("Domain Name", domainName, typeof domainName);
  // console.log("File", file);
  try {
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    //Check if image already uploadded.
    const exixtingUser = await User.findOne({
      domain_name: domainName.toLowerCase(),
    });
    if (exixtingUser) {
      return res.status(400).json({
        message: "Image already added",
      });
    }
    //upload image to cloudinary

    const imageUploadCloudinryResponse = await imageUploadOnCloudinary(file);
    console.log("imageUploadCloudinryResponse", imageUploadCloudinryResponse);
    let userDoc = {
      domain_name: domainName.toLowerCase(),
      image: {
        public_Id: imageUploadCloudinryResponse.public_id,
        url: imageUploadCloudinryResponse.url,
      },
    };
    const newUserDoc = new User(userDoc);
    await newUserDoc.save();
    fs.unlinkSync(file.path);
    res.status(200).json({
      message: "Image uploaded",
      data: { newUserDoc },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};
const deleteAllImage = async (req, res) => {
  try {
    const allUser = await User.find();
    // console.log(allUser);
    if (!allUser.length) {
      return res.status(404).json({ message: "No users found" });
    }

    const ids = allUser.map((item) => item._id);
    const publicIds = allUser.map((item) => item.image.public_Id);
    //delete all documents
    console.log("hello");

    const result = await User.deleteMany({
      _id: { $in: ids },
    });
    console.log(result);
    for (const publicId of publicIds) {
      try {
        await deleteImageFile(publicId);
        console.log(`Deleted Cloudinary image: ${publicId}`);
      } catch (error) {
        console.error(`Error deleting Cloudinary image: ${publicId}`, error);
      }
    }
    return res.status(200).json({
      message: "Image Deleted",
    });
  } catch (error) {
    res.status(400).json({
      message: "Han error",
    });
  }
};
export { uploadUserImage, deleteAllImage };

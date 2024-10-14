import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (file) => {
  try {
    const localFilePath = file.path;
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "scorebook",
      //   filename_override: file.originalname,
      format: file.originalname.split(".").pop(), //This line is used so that when excel file is uploaded it does not shown NA as format . By adding the above line or this one format of xlsx is detected otherwise excel file link was not opening.
    });

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally save temp file
    return null;
  }
};
const imageUploadOnCloudinary = async (file) => {
  try {
    const localFilePath = file.path;
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      folder: "scorebook",
      //   filename_override: file.originalname,
      format: file.originalname.split(".").pop(), //This line is used so that when excel file is uploaded it does not shown NA as format . By adding the above line or this one format of xlsx is detected otherwise excel file link was not opening.
    });

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally save temp file
    return null;
  }
};
const deleteCloudinaryFile = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
    //resource_type add is important otherwise file not found

    return response;
  } catch (error) {
    return error;
  }
};
const deleteImageFile = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    //resource_type add is important otherwise file not found

    return response;
  } catch (error) {
    return error;
  }
};
export {
  uploadOnCloudinary,
  deleteCloudinaryFile,
  imageUploadOnCloudinary,
  deleteImageFile,
};

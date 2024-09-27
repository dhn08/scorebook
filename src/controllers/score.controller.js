import { BiweeklyData } from "../models/biweeklyData.model.js";
import { Score } from "../models/score.model.js";
import {
  deleteCloudinaryFile,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";
import fs from "fs";
import xlsx from "xlsx";

import { validateUploadDocs } from "../utils/helpers.js";
import { start } from "repl";

const uploadExcelData = async (req, res) => {
  const file = req.file;
  const { startDate, endDate } = req.body;

  try {
    console.log("Inside upload excel data api , file is :", file);
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ensure date format 2024-08-12  YYYY-MM-DD
    // console.log();
    // console.log(file, startDate, endDate);
    // console.log("Type : ", typeof startDate);

    //create biweekly doc
    //upload excel to cloudinary

    const excelUploadCloudinryResponse = await uploadOnCloudinary(file);

    //create biweekly doc

    let biweekyDoc = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      excelFile: {
        public_Id: excelUploadCloudinryResponse.public_id,
        url: excelUploadCloudinryResponse.url,
      },
    };
    const newBiweeklyDoc = new BiweeklyData(biweekyDoc);
    await newBiweeklyDoc.save();

    //Read excell data and prepare score document.

    const workbook = xlsx.readFile(file.path);
    const sheet_name_list = workbook.SheetNames;

    const xlData = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]],
    );
    console.log("xlData in json :", xlData);
    let uploadDoc = [];
    xlData.map((data) => {
      // console.log(data);
      let doc = {};
      doc.domain_name = data.name;
      doc.blocker = data.Blocker || 0;
      doc.critical = data.Critical || 0;
      doc.major = data.Major || 0;
      doc.normal = data.Normal || 0;
      doc.minor = data.Minor || 0;
      doc.issueScore = data.issuescore || 0;
      doc.issueCount = data["Issue count"];
      doc.previousScore = data.previousscore || 0;
      let actString = data.activities
        ?.replace(/[ ]{2,}/g, " ") // Replace multiple spaces with a single space
        .replace(/\n{2,}/g, "\n") // Replace multiple newlines with a single newline
        .split("\n") // Split the string into an array by newlines
        .filter((line) => line.trim() !== "") // Remove empty lines
        .join("\n"); // Join the array back into a string

      doc.activities = actString?.split("\r\n") || [];
      doc.numberOfActivities = doc.activities.length;
      let couString = data.courses
        ?.replace(/[ ]{2,}/g, " ") // Replace multiple spaces with a single space
        .replace(/\n{2,}/g, "\n") // Replace multiple newlines with a single newline
        .split("\n") // Split the string into an array by newlines
        .filter((line) => line.trim() !== "") // Remove empty lines
        .join("\n"); // Join the array back into a string

      doc.courses = couString?.split("\r\n") || [];
      doc.numberOfCourses = doc.courses.length;
      doc.biweeklyId = newBiweeklyDoc._id;
      uploadDoc.push(doc);
    });
    console.log("Upload doc ", uploadDoc);

    //Before inserting into mongodb first validate the uploadDoc
    const uploadDocErrors = await validateUploadDocs(uploadDoc);

    if (uploadDocErrors) {
      //Delete the excel file which was uploaded

      const cloudinaryPublicId = newBiweeklyDoc.excelFile.public_Id;
      await deleteCloudinaryFile(cloudinaryPublicId);

      //Delete the biweekly doc which was created earlier
      await BiweeklyData.deleteOne({ _id: newBiweeklyDoc._id });

      fs.unlinkSync(file.path);

      return res
        .status(400)
        .json({ message: "Validation error", errors: uploadDocErrors });
    }

    const scoreDocsInserted = await Score.insertMany(uploadDoc);

    //Add these scores to biweekly data scores array

    const scoreIds = scoreDocsInserted.map((score) => score._id);

    const updatedBiweeklyData = await BiweeklyData.findByIdAndUpdate(
      newBiweeklyDoc._id,
      { $push: { scores: { $each: scoreIds } } },
      { new: true },
    );
    fs.unlinkSync(file.path);
    res.status(200).json({
      message: "ok",
      data: { updatedBiweeklyData, scoreDocsInserted },
    });
  } catch (error) {
    fs.unlinkSync(file.path);
    res.status(400).json({ message: "error", error });
  }
};
const deleteAllBiweeklyData = async (req, res) => {
  try {
    const { biweeklyId } = req.body;
    console.log("id", biweeklyId);
    if (!mongoose.Types.ObjectId.isValid(biweeklyId)) {
      return res.status(400).json({ message: "Invalid biweekly ID format" });
    }

    //Find the biweekly doc which need to be deleted
    const biweeklyDoc = await BiweeklyData.findById(biweeklyId);
    console.log("biweeklyDoc", biweeklyDoc);
    if (!biweeklyDoc)
      return res
        .status(400)
        .json({ message: "No records found for particular biweekly id" });
    //Delete all the scores associated with that particular biweekly period
    const scoresIdsToBeDeleted = biweeklyDoc.scores;

    // Delete documents with matching _id values
    await Score.deleteMany({ _id: { $in: scoresIdsToBeDeleted } });

    //Delete excel file uploaded on cloudinary
    //Get the excel publicId
    const cloudinaryPublicId = biweeklyDoc.excelFile.public_Id;
    await deleteCloudinaryFile(cloudinaryPublicId);

    //Delete the biweeklyDoc.
    await BiweeklyData.deleteOne({ _id: biweeklyId });
    res.status(200).json({ message: "biweekly data deleted" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
const getLatestBiweeklyData = async (req, res) => {
  try {
    const latestBiweeklyData = await BiweeklyData.findOne()
      .sort({
        endDate: -1,
      })
      .populate("scores");

    if (!latestBiweeklyData) {
      return res.status(404).json({ message: "No biweekly data found." });
    }

    //extract scores
    const scoresArray = latestBiweeklyData.scores;
    return res.status(200).json({ message: "ok", data: scoresArray });
  } catch (error) {}
};
const getAllBiweeklyData = async (req, res) => {
  const latestBiweeklyData = await BiweeklyData.find().populate("scores");

  if (latestBiweeklyData.length == 0) {
    return res.status(404).json({ message: "No biweekly data found." });
  }

  return res.status(200).json({ message: "ok", data: latestBiweeklyData });
};

export {
  uploadExcelData,
  deleteAllBiweeklyData,
  getLatestBiweeklyData,
  getAllBiweeklyData,
};

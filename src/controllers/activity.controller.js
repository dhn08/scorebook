import fs from "fs";
import xlsx from "xlsx";
import {
  activityStringToArrayConversion,
  excelDateToJSDate,
  validateUploadDocsCalender,
} from "../utils/helpers.js";
import { Calender } from "../models/calender.model.js";
import {
  deleteCloudinaryFile,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { url } from "inspector";
import { MonthlyCalenderData } from "../models/monthlyCalenderData.model.js";
import mongoose from "mongoose";

const uploadExcelData = async (req, res) => {
  const file = req.file;
  const { month, year } = req.body;
  try {
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    //Check for case when excell data is not completed for entire month

    //Hanlde case when month is alredy added

    //Upload excel to cloudinary
    const excelUploadCloudinryResponse = await uploadOnCloudinary(file);

    //Create monthlyCalenderdata doc
    let monthlyCalenderdataDoc = {
      month: month,
      year: Number(year),
      excelFile: {
        public_id: excelUploadCloudinryResponse.public_id,
        url: excelUploadCloudinryResponse.url,
      },
    };

    const newMonthlyCalenderdataDoc = new MonthlyCalenderData(
      monthlyCalenderdataDoc,
    );
    await newMonthlyCalenderdataDoc.save();

    //Read excel data
    const workbook = xlsx.readFile(file.path);
    const sheet_name_list = workbook.SheetNames;

    const xlData = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]],
    );
    // console.log("xlData in json :", xlData);
    let uploadDoc = [];
    xlData.map((data) => {
      let doc = {
        date: excelDateToJSDate(data.Date),
        day: data.Day,
        activities_performed: data["Activities Performed"]
          ? activityStringToArrayConversion(data["Activities Performed"])
          : [],
      };

      // console.log("Doc", doc);
      uploadDoc.push(doc);
    });
    // console.log("upload doc", uploadDoc, uploadDoc.length);

    //Before inserting into mongodb first validate the uploadDoc
    const uploadDocErrors = await validateUploadDocsCalender(uploadDoc);
    console.log("uploadDocsErorr:", uploadDocErrors);
    if (uploadDocErrors) {
      //Delete the excel file which was uploaded

      const cloudinaryPublicId = newMonthlyCalenderdataDoc.excelFile.public_Id;
      await deleteCloudinaryFile(cloudinaryPublicId);

      //Delete the monthly_calender doc which was created earlier
      await MonthlyCalenderData.deleteOne({
        _id: newMonthlyCalenderdataDoc._id,
      });

      fs.unlinkSync(file.path);

      return res
        .status(400)
        .json({ message: "Validation error", errors: uploadDocErrors });
    }

    const calenderDocsInserted = await Calender.insertMany(uploadDoc);

    //Add the calender doc _id to monthlyCalenderData table activities array
    const calenderIds = calenderDocsInserted.map((calender) => calender._id);

    const updatedMonthlyCalenderData =
      await MonthlyCalenderData.findByIdAndUpdate(
        newMonthlyCalenderdataDoc._id,
        { $push: { activities: { $each: calenderIds } } },
        { new: true },
      );

    fs.unlinkSync(file.path);
    res.status(200).json({
      message: "ok",
      data: { updatedMonthlyCalenderData, calenderDocsInserted },
    });
  } catch (error) {
    res.status(400).json({ message: "error", error });
    fs.unlinkSync(file.path);
  }
};

const deleteAllCalenderDataByMonth = async (req, res) => {
  try {
    const { monthlyCalenderDataId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(monthlyCalenderDataId)) {
      return res.status(400).json({ message: "Invalid biweekly ID format" });
    }

    const monthlyCalenderDataDoc = await MonthlyCalenderData.findById(
      monthlyCalenderDataId,
    );
    if (!monthlyCalenderDataDoc) {
      return res
        .status(400)
        .json({ message: "No records found for particular biweekly id" });
    }

    //Delete all the activities that are was done in that month
    const calenderIdsToBeDeleted = monthlyCalenderDataDoc.activities;

    //Delete all documents from calender table matching above id

    await Calender.deleteMany({
      _id: {
        $in: calenderIdsToBeDeleted,
      },
    });
    //Delete excel file uploaded on cloudinary
    //Get the excel publicId
    const cloudinaryPublicId = monthlyCalenderDataDoc.excelFile.public_id;
    await deleteCloudinaryFile(cloudinaryPublicId);

    // delete the monthlyCalenderData doc
    await MonthlyCalenderData.deleteOne({
      _id: monthlyCalenderDataId,
    });
    res.status(200).json({ message: "monthly calender data deleted" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
const getAllCalenderData = async (req, res) => {
  try {
    const calenderData = await Calender.find().sort({ date: 1 });
    if (calenderData.length == 0) {
      return res.status(404).json({
        message: "No calender data found",
      });
    }
    return res.status(200).json({ message: "ok", data: calenderData });
  } catch (error) {
    res.status(400).json({ error });
  }
};
export { uploadExcelData, deleteAllCalenderDataByMonth, getAllCalenderData };

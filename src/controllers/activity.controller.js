import fs from "fs";
import xlsx from "xlsx";
import {
  activityStringToArrayConversion,
  excelDateToJSDate,
  validateUploadDocsCalender,
} from "../utils/helpers.js";
import { Calender } from "../models/calender.model.js";

const uploadExcelData = async (req, res) => {
  const file = req.file;
  const { month } = req.body;
  try {
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    //Check for case when excell data is not completed for entire month

    //Read excel data
    const workbook = xlsx.readFile(file.path);
    const sheet_name_list = workbook.SheetNames;

    const xlData = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]],
    );
    // console.log("xlData in json :", xlData);
    let uploadDoc = [];
    xlData.map((data) => {
      console.log("Inside map");
      console.log(excelDateToJSDate(data.Date));
      let doc = {
        date: excelDateToJSDate(data.Date),
        day: data.Day,
        activities_performed: data["Activities Performed"]
          ? activityStringToArrayConversion(data["Activities Performed"])
          : [],
      };

      // doc.month = month;
      // doc.date = excelDateToJSDate(data.Date);
      // doc.day = data.Day;
      // doc.activites_performed = data["Activities Performed"]
      //   ? activityStringToArrayConversion(data["Activities Performed"])
      //   : [];

      console.log("Doc", doc);
      uploadDoc.push(doc);
    });
    // console.log("upload doc", uploadDoc, uploadDoc.length);

    //Before inserting into mongodb first validate the uploadDoc
    const uploadDocErrors = await validateUploadDocsCalender(uploadDoc);
    console.log("uploadDocsErorr:", uploadDocErrors);
    if (uploadDocErrors) {
      //Delete the excel file which was uploaded

      // const cloudinaryPublicId = newBiweeklyDoc.excelFile.public_Id;
      // await deleteCloudinaryFile(cloudinaryPublicId);

      //Delete the monthly_calender doc which was created earlier
      // await BiweeklyData.deleteOne({ _id: newBiweeklyDoc._id });

      fs.unlinkSync(file.path);

      return res
        .status(400)
        .json({ message: "Validation error", errors: uploadDocErrors });
    }
    const calenderDocsInserted = await Calender.insertMany(uploadDoc);

    fs.unlinkSync(file.path);
    res.status(200).json({ message: "ok", data: calenderDocsInserted });
  } catch (error) {
    res.status(400).json({ message: "error", error });
    fs.unlinkSync(file.path);
  }
};

export { uploadExcelData };

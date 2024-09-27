import fs from "fs";
import xlsx from "xlsx";
import {
  activityStringToArrayConversion,
  excelDateToJSDate,
} from "../utils/helpers.js";

const uploadExcelData = async (req, res) => {
  const file = req.file;
  const { month } = req.body;
  try {
    console.log("inside upload excel : file,", file);
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
        month: month,
        date: excelDateToJSDate(data.Date),
        day: data.Day,
        activites_performed: data["Activities Performed"]
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

    fs.unlinkSync(file.path);
    res.status(200).json({ message: "ok", data: uploadDoc });
  } catch (error) {
    fs.unlinkSync(file.path);
  }
};

export { uploadExcelData };

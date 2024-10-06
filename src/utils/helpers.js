import { Calender } from "../models/calender.model.js";
import { Score } from "../models/score.model.js";

//Validate upload docs for biweekly scores data
const validateUploadDocs = async (uploadDoc) => {
  console.log("Inside validate upload Docs");
  const errors = [];

  for (const doc of uploadDoc) {
    // Create a new instance of the Score model
    const scoreInstance = new Score(doc);
    const validationError = scoreInstance.validateSync(); // Validate against the schema

    if (validationError) {
      // If validation fails, collect the errors
      errors.push({
        document: doc,
        error: validationError.errors,
      });
    }
  }

  return errors.length > 0 ? errors : null;
};
const validateUploadDocsCalender = async (uploadDoc) => {
  console.log("Inside validate upload Docs");
  const errors = [];

  for (const doc of uploadDoc) {
    // Create a new instance of the Score model
    const calenderInstance = new Calender(doc);
    const validationError = calenderInstance.validateSync(); // Validate against the schema

    if (validationError) {
      // If validation fails, collect the errors
      errors.push({
        document: doc,
        error: validationError.errors,
      });
    }
  }

  return errors.length > 0 ? errors : null;
};
const excelDateToJSDate = (excelDate) => {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date;
};

const activityStringToArrayConversion = (activityString) => {
  const lines = activityString.split("\r\n");
  const finalArray = lines.map((line) => line.replace(/^\d+\.\s*/, ""));
  return finalArray;
};
const normalizeColumnName = (name) => {
  return name.replace(/\s+/g, "").toLowerCase(); // Remove spaces and convert to lowercase
};

const getDateInReadableFormat = (date) => {
  const newDate = new Date(date);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedNewDate = newDate.toLocaleDateString(undefined, options);
  return formattedNewDate;
};
export {
  validateUploadDocs,
  excelDateToJSDate,
  activityStringToArrayConversion,
  validateUploadDocsCalender,
  normalizeColumnName,
  getDateInReadableFormat,
};

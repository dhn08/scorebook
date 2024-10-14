import { monthNames } from "../constants.js";
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
const validateUploadDocsCalender = async (uploadDoc, month, year, teamName) => {
  console.log("Inside validate upload Docs");
  const errors = [];
  // console.log("Upload doc inside validateUploadDocsCalender", uploadDoc);
  const datesArray = generateDatesForMonth(month, year);
  // console.log("datesArray", datesArray);

  for (const doc of uploadDoc) {
    // Create a new instance of the Score model
    const calenderInstance = new Calender(doc);

    try {
      // Validate the instance against the schema
      //Check if document date lies in the month and year given by the user
      const dateLiesInGivenMonthandYear = datesArray.some(
        (d) => d.toDateString() === doc.date.toDateString(),
      );

      if (!dateLiesInGivenMonthandYear) {
        errors.push({
          document: doc,
          error: `There exists a date ${doc.date} which does not lie in ${month} ${year}`,
        });
        break;
      }
      calenderInstance.validateSync();

      // Check for duplicate date in the database
      const duplicate = await Calender.findOne({
        date: calenderInstance.date,
        team: teamName,
      });
      if (duplicate) {
        errors.push({
          document: doc,
          error:
            "A document with the same date already exists. Please use a unique date.",
        });
        break;
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        // Handle validation errors
        Object.values(error.errors).forEach(({ message }) => {
          errors.push({
            document: doc,
            error: message,
          });
        });
      } else if (error.name === "CastError") {
        // Handle incorrect type errors
        errors.push({
          document: doc,
          error: `Invalid value for field ${error.path}: ${error.value}`,
        });
      } else if (error.name === "MongoNetworkError") {
        // Handle network errors
        errors.push({
          document: doc,
          error: "Network error occurred. Please try again later.",
        });
      } else if (error.name === "MongooseServerSelectionError") {
        // Handle server selection errors
        errors.push({
          document: doc,
          error:
            "Database server selection error. Please check your database connection.",
        });
      } else {
        // Handle other unknown errors
        errors.push({
          document: doc,
          error: "An unknown error occurred. Please try again.",
        });
      }
    }
  }

  // const validationError = calenderInstance.validateSync(); // Validate against the schema

  // if (validationError) {
  //   // If validation fails, collect the errors
  //   errors.push({
  //     document: doc,
  //     error: validationError.errors,
  //   });
  // }
  console.log("Errors from upload docs:", errors);

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
const generateDatesForMonth = (month, year) => {
  const monthFullName = monthNames[month] || month;
  const monthIndex = new Date(`${monthFullName} 1, ${year}`).getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from(
    { length: daysInMonth },
    (_, i) => new Date(Date.UTC(year, monthIndex, i + 1)),
  );
};
export {
  validateUploadDocs,
  excelDateToJSDate,
  activityStringToArrayConversion,
  validateUploadDocsCalender,
  normalizeColumnName,
  getDateInReadableFormat,
};

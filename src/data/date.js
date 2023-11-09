import customParseFormat from "dayjs/plugin/customParseFormat.js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const getTimezoneFromCharacter = (tzIn) => {
  // The API returns timezones as single characters. I've only encountered the
  // four primary continental US timezones. The continental part makes sense
  // because these are trains, after all, but this doesn't account for all the
  // quirks with states and/or municipalities opting out of daylight savings
  // time.
  switch (tzIn.toUpperCase()) {
    case "P":
      return "America/Los_Angeles";
    case "M":
      return "America/Denver";
    case "C":
      return "America/Chicago";
    case "E":
    default:
      return "America/New_York";
  }
};

export const parseDate = (uglyDate, tz = "America/New_York") => {
  if (!uglyDate) {
    return null;
  }

  // DayJS can parse the ugly dates if we tell it what the format is. Give it a
  // timezone and then turn that puppy into an ISO8601 UTC string.
  return dayjs.tz(uglyDate, "MM/DD/YYYY hh:mm:ss", tz).toISOString();
};

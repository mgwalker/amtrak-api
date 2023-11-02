import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getTimezoneFromCharacter = (tzIn) => {
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

export const parseDate = (uglyDate, timezone = "America/New_York") => {
  if (timezone.length === 1) {
    const tz = getTimezoneFromCharacter(timezone);
    return dayjs.tz(uglyDate, tz).toISOString();
  }
  return dayjs.tz(uglyDate, timezone).toISOString();
};

import DayJS from "dayjs";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

DayJS.extend(duration);
DayJS.extend(relativeTime);
DayJS.extend(utc);
DayJS.extend(timezone);

export const dayjs = DayJS;

export const dateAndTimeString = (timestamp) =>
  [" on ", timestamp.format("dddd"), " at ", timestamp.format("h:mm A")].join(
    "",
  );

export const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[\s_]/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-{2,}/g, "-");

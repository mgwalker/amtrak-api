import handlebars from "handlebars";
import { dateAndTimeString, dayjs } from "../utils.js";

export const stationStatusText = function () {
  const stringParts = [];

  if (this.status === "departed") {
    // train left
    stringParts.push("<ul>");

    const departed = dayjs(this.departureActual).tz(this.timezone);

    if (this.arrivalActual) {
      const arrived = dayjs(this.arrivalActual).tz(this.timezone);
      stringParts.push("<li><strong>Arrived</strong> ");
      stringParts.push(dateAndTimeString(arrived));
      stringParts.push("</li>");
    }

    stringParts.push("<li><strong>Departed</strong> ");
    stringParts.push(dateAndTimeString(departed));
    stringParts.push("</li>");
    stringParts.push("</ul>");
  } else if (this.status === "enroute" || this.status === "scheduled") {
    // train is coming
    const scheduled = dayjs(this.arrivalScheduled).tz(this.timezone);
    const arrival = dayjs(this.arrivalEstimated ?? this.arrivalScheduled).tz(
      this.timezone,
    );
    const delay = dayjs.duration(arrival.diff(scheduled));

    const departure = dayjs(
      this.departureEstimated ?? this.departureScheduled,
    ).tz(this.timezone);

    if (delay.asMinutes() > 10) {
      stringParts.push("<p>This train is expected to be about ");
      stringParts.push(delay.humanize());
      stringParts.push(" late.</p>");
    }

    stringParts.push("<ul><li><strong>Expected to arrive</strong> ");
    stringParts.push(dateAndTimeString(arrival));
    stringParts.push("</li><li><strong>Expected to depart</strong>");
    stringParts.push(dateAndTimeString(departure));
    stringParts.push("</li></ul>");
  } else if (this.status === "arrived") {
    // train is here
  }

  return new handlebars.SafeString(stringParts.join(""));
};

import { dateAndTimeString, dayjs } from "../utils.js";

export const trainStartStop = function () {
  const stringParts = [];

  if (this.stations[0].status === "scheduled") {
    const first = this.stations[0];
    const last = this.stations[this.stations.length - 1];

    const estimatedDeparture = dayjs(
      first.departureEstimated ?? first.departureScheduled,
    ).tz(first.timezone);
    const scheduledDeparture = dayjs(first.departureScheduled).tz(
      first.timezone,
    );

    const scheduledArrival = dayjs(last.arrivalScheduled).tz(last.timezone);

    const departureDelay = dayjs.duration(
      estimatedDeparture.diff(scheduledDeparture),
    );

    stringParts.push("Scheduled to depart ");
    stringParts.push(first.station.name);
    stringParts.push(dateAndTimeString(scheduledDeparture));
    stringParts.push(" and arrive at ");
    stringParts.push(last.station.name);
    stringParts.push(dateAndTimeString(scheduledArrival));
    stringParts.push(".");

    if (departureDelay.asMinutes() > 10) {
      stringParts.push(" This train is currently estimated to leave about ");
      stringParts.push(departureDelay.humanize());
      stringParts.push(" late.");
    }
  } else if (this.stations[this.stations.length - 1].status === "arrived") {
    // Train is finished
    const station = this.stations[this.stations.length - 1];
    const arrived = dayjs(station.arrivalActual).tz(station.timezone);
    const scheduled = dayjs(station.arrivalScheduled).tz(station.timezone);
    const delay = dayjs.duration(arrived.diff(scheduled));

    stringParts.push("Arrived at ");
    stringParts.push(station.station.name);
    if (delay.asMinutes() > 10) {
      stringParts.push(" about ");
      stringParts.push(delay.humanize());
      stringParts.push(" late ");
    }
    stringParts.push(dateAndTimeString(arrived));
    stringParts.push(".");
  } else if (this.stations.some(({ status }) => status === "arrived")) {
    // Train is sitting at a station along its route.
    const firstIndex = this.stations.findIndex(
      ({ status }) => status === "arrived",
    );
    const first = this.stations[firstIndex];
    const next = this.stations[firstIndex + 1];

    const arrived = dayjs(first.arrivalActual).tz(first.timezone);
    const scheduled = dayjs(first.arrivalScheduled).tz(first.timezone);
    const delay = dayjs.duration(arrived.diff(scheduled));

    const departure = dayjs(first.departureEstimated).tz(first.timezone);
    const arrival = dayjs(next.arrivalEstimated).tz(next.timezone);

    stringParts.push("Arrived at ");
    stringParts.push(first.station.name);
    if (delay.asMinutes() > 10) {
      stringParts.push(" about ");
      stringParts.push(delay.humanize());
      stringParts.push(" late");
    }
    stringParts.push(dateAndTimeString(arrived));
    stringParts.push(". Expected to depart ");
    stringParts.push(dateAndTimeString(departure));
    stringParts.push(" and arrive at ");
    stringParts.push(next.station.name);
    stringParts.push(dateAndTimeString(arrival));
    stringParts.push(".");
  } else if (this.stations[0].status === "departed") {
    // Train is honking on down the tracks.

    const firstIndex = this.stations.findLastIndex(
      ({ status }) => status === "departed",
    );

    const first = this.stations[firstIndex];
    const next = this.stations[firstIndex + 1];

    const departed = dayjs(first.departureActual).tz(first.timezone);
    const arrivalScheduled = dayjs(next.arrivalScheduled).tz(next.timezone);
    const arrivalEstimated = dayjs(
      next.arrivalEstimated ?? next.arrivalScheduled,
    ).tz(next.timezone);

    const arrivalDelay = dayjs.duration(
      arrivalEstimated.diff(arrivalScheduled),
    );

    stringParts.push("Departed ");
    stringParts.push(first.station.name);
    stringParts.push(" on ");
    stringParts.push(departed.format("dddd"));
    stringParts.push(" at ");
    stringParts.push(departed.format("h:mm A"));

    if (arrivalDelay.asMinutes() > 10) {
      stringParts.push(". The train is currently running about ");
      stringParts.push(arrivalDelay.humanize());
      stringParts.push(" late, and is expected to arrive at ");
    } else {
      stringParts.push(" and is scheduled to arrive at ");
    }

    stringParts.push(next.station.name);
    stringParts.push(" on ");
    stringParts.push(arrivalEstimated.format("dddd"));
    stringParts.push(" at ");
    stringParts.push(arrivalEstimated.format("h:mm A"));
  } else {
    return "Unclear what's happening.";
  }

  return stringParts.join("");
};

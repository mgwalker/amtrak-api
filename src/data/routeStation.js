import { getTimezoneFromCharacter, parseDate } from "./date.js";

export const parseRouteStation = (routeStation, first = false) => {
  const timezone = getTimezoneFromCharacter(routeStation.tz);

  const station = {
    code: routeStation.code,
    bus: routeStation.bus,
    arrivalActual: null,
    arrivalEstimated: null,
    arrivalScheduled: null,
    departureActual: null,
    departureEstimated: null,
    departureScheduled: null,
    status: null,
    timezone,
  };

  if (first && !routeStation.postdep) {
    // If this is the first station and the train has not yet departed, then
    // this station is scheduled. We only have scheduled and estimated departure
    // times available to us.
    station.status = "scheduled";
    station.departureEstimated = parseDate(routeStation.estdep, timezone);
    station.departureScheduled = parseDate(routeStation.schdep, timezone);
  } else if (routeStation.postdep) {
    // If the train has departed this station...
    station.status = "departed";

    if (first) {
      // ...and this is the first station, we only have scheduled and actual
      // departure times available, as the train kinda didn't arrive. It was
      // just... there. Spooky train.
      station.departureActual = parseDate(routeStation.postdep, timezone);
      station.departureScheduled = parseDate(routeStation.schdep, timezone);
    } else {
      // ...otherwise we can capture the scheduled and actual arrival and
      // depature times for this station.
      station.arrivalActual = parseDate(routeStation.postarr, timezone);
      station.arrivalScheduled = parseDate(routeStation.scharr, timezone);
      station.departureActual = parseDate(routeStation.postdep, timezone);
      station.departureScheduled = parseDate(routeStation.schdep, timezone);
    }
  } else if (routeStation.postarr) {
    // If the has not departed but HAS arrived, then the train is currently
    // sitting at the station. We can know when it was supposed to arrive, when
    // it did, when it is scheduled to leave, and when they think it'll actually
    // depart.
    station.status = "arrived";
    station.arrivalActual = parseDate(routeStation.postarr, timezone);
    station.arrivalScheduled = parseDate(routeStation.scharr, timezone);
    station.departureEstimated = parseDate(routeStation.estdep, timezone);
    station.departureScheduled = parseDate(routeStation.schdep, timezone);
  } else {
    // If the train has neither departed nor arrived, then it must be on its
    // way. We only have scheduled and estimated times to work with.
    station.status = "enroute";
    station.arrivalEstimated = parseDate(routeStation.estarr, timezone);
    station.arrivalScheduled = parseDate(routeStation.scharr, timezone);
    station.departureEstimated = parseDate(routeStation.estdep, timezone);
    station.departureScheduled = parseDate(routeStation.schdep, timezone);
  }

  return station;
};

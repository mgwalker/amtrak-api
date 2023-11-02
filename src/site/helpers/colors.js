export const trainTrackColor = function (stations) {
  return stations[0].status === "scheduled"
    ? "bg-base-light"
    : "bg-primary-light";
};

export const stationColor = function () {
  switch (this.status) {
    case "arrived":
      return "bg-gold";
    case "enroute":
      return "bg-green";
    case "departed":
      return "bg-primary-dark";
    case "scheduled":
      return "bg-base-light";
    default:
      return "bg-black";
  }
};

export const spacerColor = function (stations, index) {
  if (!stations || !index) {
    if (this.status === "departed") {
      return "bg-primary-dark";
    }
  } else {
    if (stations[index - 1].status === "departed") {
      return "bg-primary-dark";
    }
  }
};

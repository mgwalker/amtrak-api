export * from "./colors.js";
export * from "./links.js";
export * from "./stationStatusText.js";
export * from "./trainStartStop.js";

export const firstTrainStation = function () {
  return this.stations[0];
};

export const lastTrainStation = function () {
  return this.stations.slice(-1);
};

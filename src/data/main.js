import fs from "node:fs/promises";
import { getStations } from "./stations.js";
import { getTrains } from "./trains.js";

const stations = await getStations();
const trains = await getTrains(stations);

await fs.writeFile("_site/stations.json", JSON.stringify(stations));
await fs.writeFile("_site/trains.json", JSON.stringify(trains));

const routes = Array.from(new Set(trains.map(({ route }) => route)))
  .map((routeName) => ({
    route: routeName,
    trains: trains.filter(({ route }) => route === routeName),
  }))
  .sort(({ route: a }, { route: b }) => {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  });

await fs.writeFile("_site/routes.json", JSON.stringify(routes));

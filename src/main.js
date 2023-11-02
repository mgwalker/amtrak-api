import fs from "node:fs/promises";
import { getStations } from "./stations.js";
import { getTrains } from "./trains.js";

const stations = await getStations();
const trains = await getTrains(stations);

await fs.writeFile("_site/stations.json", JSON.stringify(stations));
await fs.writeFile("_site/trains.json", JSON.stringify(trains));

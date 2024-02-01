import defaultFs from "node:fs/promises";
import { getStations as defaultGetStations } from "./stations.js";
import { getTrains as defaultGetTrains } from "./trains.js";

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[\s_]/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-{2,}/g, "-");

export const main = async ({
  fs = defaultFs,
  getStations = defaultGetStations,
  getTrains = defaultGetTrains,
} = {}) => {
  const stations = await getStations();
  const trains = await getTrains(stations);

  await fs.mkdir(`_site/routes`, { recursive: true });

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

  for await (const route of routes) {
    await fs.writeFile(
      `_site/routes/${slugify(route.route)}.json`,
      JSON.stringify(route),
    );
  }
};

const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  main();
}

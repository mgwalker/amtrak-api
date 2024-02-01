import sinon from "sinon";
import tap from "tap";

import { main } from "./main.js";

const sandbox = sinon.createSandbox();

tap.test("main module", async (t) => {
  const fs = { mkdir: sandbox.spy(), writeFile: sandbox.spy() };
  const getStations = sandbox.stub();
  const getTrains = sandbox.stub();

  t.beforeEach(async () => {});

  t.afterEach(() => {
    sandbox.restore();
  });

  t.test("main works", async () => {
    const stations = [
      { code: "station 1", name: "Moopville Station" },
      { code: "station 2", name: "Mooptropolis" },
    ];
    getStations.resolves(stations);

    const trains = [
      { id: 1, number: 1, route: "Route 1" },
      { id: 2, number: 2, route: "Route 1" },
      { id: 4, number: 3, route: "Route 1" },
      { id: 5, number: 20, route: "Route 3" },
      { id: 8, number: 30, route: "Route 4" },
      { id: 6, number: 10, route: "Route 2" },
      { id: 7, number: 11, route: "Route 2" },
    ];
    getTrains.resolves(trains);

    const routes = [
      {
        route: "Route 1",
        trains: [
          { id: 1, number: 1, route: "Route 1" },
          { id: 2, number: 2, route: "Route 1" },
          { id: 4, number: 3, route: "Route 1" },
        ],
      },
      {
        route: "Route 2",
        trains: [
          { id: 6, number: 10, route: "Route 2" },
          { id: 7, number: 11, route: "Route 2" },
        ],
      },
      { route: "Route 3", trains: [{ id: 5, number: 20, route: "Route 3" }] },
      { route: "Route 4", trains: [{ id: 8, number: 30, route: "Route 4" }] },
    ];

    await main({ fs, getStations, getTrains });

    t.ok(fs.mkdir.calledWith("_site/routes", { recursive: true }));
    t.ok(
      fs.writeFile.calledWith("_site/stations.json", JSON.stringify(stations)),
    );
    t.ok(fs.writeFile.calledWith("_site/trains.json", JSON.stringify(trains)));
    t.ok(fs.writeFile.calledWith("_site/routes.json", JSON.stringify(routes)));

    t.ok(
      fs.writeFile.calledWith(
        "_site/routes/route-1.json",
        JSON.stringify(routes[0]),
      ),
    );

    t.ok(
      fs.writeFile.calledWith(
        "_site/routes/route-2.json",
        JSON.stringify(routes[1]),
      ),
    );

    t.ok(
      fs.writeFile.calledWith(
        "_site/routes/route-3.json",
        JSON.stringify(routes[2]),
      ),
    );

    t.ok(
      fs.writeFile.calledWith(
        "_site/routes/route-4.json",
        JSON.stringify(routes[3]),
      ),
    );
  });
});

import sinon from "sinon";
import tap from "tap";

import { getStations } from "./stations.js";

tap.test("stations fetcher", async (stationTests) => {
  const fetch = sinon.stub();

  stationTests.beforeEach(() => {
    fetch.reset();

    fetch.withArgs("https://maps.amtrak.com/rttl/js/RoutesList.json").resolves({
      json: async () => [],
    });

    const s = "12345678";
    const v = "12345678901234567890123456789012";

    fetch
      .withArgs("https://maps.amtrak.com/rttl/js/RoutesList.v.json")
      .resolves({
        json: async () => ({
          arr: ["0b1d2897-640a-4c64-a1d8-b54f453a7ad7"],
          s: [s, s, s, s, s, s, s, s, "deadbeef"],
          // prettier-ignore
          v: [
            v, v, v, v, v, v, v, v, v, v,
            v, v, v, v, v, v, v, v, v, v,
            v, v, v, v, v, v, v, v, v, v,
            v, v,
            "7e117a1e7e117a1e7e117a1e7e117a1e",
          ],
        }),
      });
  });

  stationTests.test("maps stations into our lingo", async (test) => {
    fetch
      .withArgs(
        "https://maps.amtrak.com/services/MapDataService/stations/trainStations",
      )
      .resolves({
        text: async () => "this is some text",
      });

    const cryptoParse = sinon.stub();
    cryptoParse.resolves({
      StationsDataResponse: {
        features: [
          {
            properties: {
              Code: "STA1",
              StationName: "Station 1",
              Address1: "Street 1",
              Address2: "Unit 1",
              City: "Cityville",
              State: "FR",
              lat: 31,
              lon: -31,
              Zipcode: 11111,
            },
          },
          {
            properties: {
              Code: "STA2",
              StationName: "Station Two",
              Address1: "Street 2",
              Address2: "Apt 2",
              City: "Metropolis",
              State: "BQ",
              lat: 32,
              lon: -32,
              Zipcode: 22222,
            },
          },
          {
            properties: {
              Code: "STA3",
              StationName: "Third Station",
              Address1: "Street 3",
              Address2: "Loft #3",
              City: "Gotham City",
              State: "OP",
              lat: 33,
              lon: -33,
              Zipcode: 33333,
            },
          },
        ],
      },
    });

    const out = await getStations({ fetch, cryptoParse });
    test.same(out, [
      {
        code: "STA1",
        name: "Station 1",
        address1: "Street 1",
        address2: "Unit 1",
        city: "Cityville",
        state: "FR",
        lat: 31,
        lon: -31,
        zip: 11111,
        _raw: {
          Code: "STA1",
          StationName: "Station 1",
          Address1: "Street 1",
          Address2: "Unit 1",
          City: "Cityville",
          State: "FR",
          lat: 31,
          lon: -31,
          Zipcode: 11111,
        },
      },
      {
        code: "STA2",
        name: "Station Two",
        address1: "Street 2",
        address2: "Apt 2",
        city: "Metropolis",
        state: "BQ",
        lat: 32,
        lon: -32,
        zip: 22222,
        _raw: {
          Code: "STA2",
          StationName: "Station Two",
          Address1: "Street 2",
          Address2: "Apt 2",
          City: "Metropolis",
          State: "BQ",
          lat: 32,
          lon: -32,
          Zipcode: 22222,
        },
      },
      {
        code: "STA3",
        name: "Third Station",
        address1: "Street 3",
        address2: "Loft #3",
        city: "Gotham City",
        state: "OP",
        lat: 33,
        lon: -33,
        zip: 33333,
        _raw: {
          Code: "STA3",
          StationName: "Third Station",
          Address1: "Street 3",
          Address2: "Loft #3",
          City: "Gotham City",
          State: "OP",
          lat: 33,
          lon: -33,
          Zipcode: 33333,
        },
      },
    ]);
  });
});

import sinon from "sinon";
import tap from "tap";
import { enroute, enrouteArrived, scheduled } from "./trains.test.data.js";

import { getTrains } from "./trains.js";

tap.test("trains fetcher", async (trainTests) => {
  const fetch = sinon.stub();
  const cryptoParse = sinon.stub();

  trainTests.beforeEach(() => {
    fetch.reset();
    cryptoParse.reset();

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

    fetch
      .withArgs(
        "https://maps.amtrak.com/services/MapDataService/trains/getTrainsData",
      )
      .resolves({
        text: async () => "this is some text",
      });
  });

  trainTests.test("a scheduled train", async (test) => {
    cryptoParse.resolves(scheduled);

    const out = await getTrains(
      [
        { code: "STA1", station: "station 1 metadata" },
        { code: "STA2", station: "station 2 metadata" },
        { code: "STA3", station: "station 3 metadata" },
      ],
      { fetch, cryptoParse },
    );

    test.same(out, [
      {
        id: "train 1",
        heading: "nw",
        number: 37,
        route: "Big Route",
        stations: [
          {
            code: "STA1",
            bus: false,
            arrivalActual: null,
            arrivalEstimated: null,
            arrivalScheduled: null,
            departureActual: null,
            departureEstimated: "2020-10-10T11:00:00.000Z",
            departureScheduled: "2020-10-10T10:30:00.000Z",
            status: "scheduled",
            timezone: "America/New_York",
            station: {
              code: "STA1",
              station: "station 1 metadata",
            },
            _raw: {
              code: "STA1",
              bus: false,
              tz: "E",
              estdep: "10/10/2020 07:00:00",
              schdep: "10/10/2020 06:30:00",
            },
          },
          {
            code: "STA2",
            bus: false,
            arrivalActual: null,
            arrivalEstimated: null,
            arrivalScheduled: "2020-10-10T13:15:00.000Z",
            departureActual: null,
            departureEstimated: null,
            departureScheduled: "2020-10-10T13:20:00.000Z",
            status: "scheduled",
            timezone: "America/Denver",
            station: {
              code: "STA2",
              station: "station 2 metadata",
            },
            _raw: {
              code: "STA2",
              bus: false,
              tz: "M",
              scharr: "10/10/2020 07:15:00",
              schdep: "10/10/2020 07:20:00",
            },
          },
          {
            code: "STA3",
            bus: false,
            arrivalActual: null,
            arrivalEstimated: null,
            arrivalScheduled: "2020-10-10T15:00:00.000Z",
            departureActual: null,
            departureEstimated: null,
            departureScheduled: "2020-10-10T15:10:00.000Z",
            status: "scheduled",
            timezone: "America/Los_Angeles",
            station: {
              code: "STA3",
              station: "station 3 metadata",
            },
            _raw: {
              code: "STA3",
              bus: false,
              tz: "P",
              scharr: "10/10/2020 08:00:00",
              schdep: "10/10/2020 08:10:00",
            },
          },
        ],
        _raw: {
          ID: "train 1",
          Heading: "nw",
          TrainNum: "37",
          RouteName: "Big Route",
        },
      },
    ]);
  });

  trainTests.test(
    "a train that has begun its route but is currently sitting at a station",
    async (test) => {
      cryptoParse.resolves(enrouteArrived);

      const out = await getTrains(
        [
          { code: "STA1", station: "station 1 metadata" },
          { code: "STA2", station: "station 2 metadata" },
          { code: "STA3", station: "station 3 metadata" },
          { code: "STA4", station: "station 4 metadata" },
        ],
        { fetch, cryptoParse },
      );

      test.same(out, [
        {
          id: "train 2",
          heading: "ns",
          number: 42,
          route: "Choo Choo Route",
          stations: [
            {
              code: "STA1",
              bus: false,
              arrivalActual: null,
              arrivalEstimated: null,
              arrivalScheduled: null,
              departureActual: "2020-10-10T18:25:00.000Z",
              departureEstimated: null,
              departureScheduled: null,
              status: "departed",
              timezone: "America/Chicago",
              station: {
                code: "STA1",
                station: "station 1 metadata",
              },
              _raw: {
                code: "STA1",
                bus: false,
                tz: "C",
                postdep: "10/10/2020 13:25:00",
              },
            },
            {
              code: "STA2",
              bus: false,
              arrivalActual: "2020-10-10T19:45:00.000Z",
              arrivalEstimated: null,
              arrivalScheduled: null,
              departureActual: "2020-10-10T19:48:00.000Z",
              departureEstimated: null,
              departureScheduled: null,
              status: "departed",
              timezone: "America/Denver",
              station: {
                code: "STA2",
                station: "station 2 metadata",
              },
              _raw: {
                code: "STA2",
                bus: false,
                tz: "M",
                postarr: "10/10/2020 13:45:00",
                postdep: "10/10/2020 13:48:00",
              },
            },
            {
              code: "STA3",
              bus: false,
              arrivalActual: "2020-10-10T18:19:00.000Z",
              arrivalEstimated: null,
              arrivalScheduled: null,
              departureActual: null,
              departureEstimated: null,
              departureScheduled: null,
              status: "arrived",
              timezone: "America/New_York",
              station: {
                code: "STA3",
                station: "station 3 metadata",
              },
              _raw: {
                code: "STA3",
                bus: false,
                tz: "E",
                postarr: "10/10/2020 14:19:00",
              },
            },
            {
              code: "STA4",
              bus: false,
              arrivalActual: null,
              arrivalEstimated: null,
              arrivalScheduled: "2020-10-11T00:15:00.000Z",
              departureActual: null,
              departureEstimated: null,
              departureScheduled: null,
              status: "scheduled",
              timezone: "America/Denver",
              station: {
                code: "STA4",
                station: "station 4 metadata",
              },
              _raw: {
                code: "STA4",
                bus: false,
                tz: "M",
                scharr: "10/10/2020 18:15:00",
              },
            },
          ],
          _raw: {
            ID: "train 2",
            Heading: "ns",
            TrainNum: "42",
            RouteName: "Choo Choo Route",
          },
        },
      ]);
    },
  );

  trainTests.test(
    "a train that has begun its route and is currently between stations",
    async (test) => {
      cryptoParse.resolves(enroute);

      const out = await getTrains(
        [
          { code: "STA1", station: "station 1 metadata" },
          { code: "STA2", station: "station 2 metadata" },
          { code: "STA3", station: "station 3 metadata" },
          { code: "STA4", station: "station 4 metadata" },
          { code: "STA5", station: "station 5 metadata" },
        ],
        { fetch, cryptoParse },
      );

      test.same(out, [
        {
          id: "train 2",
          heading: "ns",
          number: 42,
          route: "Choo Choo Route",
          stations: [
            {
              code: "STA1",
              bus: false,
              arrivalActual: null,
              arrivalEstimated: null,
              arrivalScheduled: null,
              departureActual: "2020-10-10T18:25:00.000Z",
              departureEstimated: null,
              departureScheduled: null,
              status: "departed",
              timezone: "America/Chicago",
              station: {
                code: "STA1",
                station: "station 1 metadata",
              },
              _raw: {
                code: "STA1",
                bus: false,
                tz: "C",
                postdep: "10/10/2020 13:25:00",
              },
            },
            {
              code: "STA2",
              bus: false,
              arrivalActual: "2020-10-10T19:45:00.000Z",
              arrivalEstimated: null,
              arrivalScheduled: null,
              departureActual: "2020-10-10T19:48:00.000Z",
              departureEstimated: null,
              departureScheduled: null,
              status: "departed",
              timezone: "America/Denver",
              station: {
                code: "STA2",
                station: "station 2 metadata",
              },
              _raw: {
                code: "STA2",
                bus: false,
                tz: "M",
                postarr: "10/10/2020 13:45:00",
                postdep: "10/10/2020 13:48:00",
              },
            },
            {
              code: "STA3",
              bus: false,
              arrivalActual: "2020-10-10T18:19:00.000Z",
              arrivalEstimated: null,
              arrivalScheduled: null,
              departureActual: "2020-10-10T18:23:00.000Z",
              departureEstimated: null,
              departureScheduled: null,
              status: "departed",
              timezone: "America/New_York",
              station: {
                code: "STA3",
                station: "station 3 metadata",
              },
              _raw: {
                code: "STA3",
                bus: false,
                tz: "E",
                postarr: "10/10/2020 14:19:00",
                postdep: "10/10/2020 14:23:00",
              },
            },
            {
              code: "STA4",
              bus: false,
              arrivalActual: null,
              arrivalEstimated: null,
              arrivalScheduled: "2020-10-11T00:15:00.000Z",
              departureActual: null,
              departureEstimated: null,
              departureScheduled: null,
              status: "enroute",
              timezone: "America/Denver",
              station: {
                code: "STA4",
                station: "station 4 metadata",
              },
              _raw: {
                code: "STA4",
                bus: false,
                tz: "M",
                scharr: "10/10/2020 18:15:00",
              },
            },
            {
              code: "STA5",
              bus: false,
              arrivalActual: null,
              arrivalEstimated: null,
              arrivalScheduled: "2020-10-11T00:15:00.000Z",
              departureActual: null,
              departureEstimated: null,
              departureScheduled: null,
              status: "scheduled",
              timezone: "America/Denver",
              station: {
                code: "STA5",
                station: "station 5 metadata",
              },
              _raw: {
                code: "STA5",
                bus: false,
                tz: "M",
                scharr: "10/10/2020 18:15:00",
              },
            },
          ],
          _raw: {
            ID: "train 2",
            Heading: "ns",
            TrainNum: "42",
            RouteName: "Choo Choo Route",
          },
        },
      ]);
    },
  );
});

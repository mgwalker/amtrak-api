export const scheduled = {
  features: [
    {
      properties: {
        ID: "train 1",
        Heading: "nw",
        TrainNum: "37",
        RouteName: "Big Route",
        Station3: JSON.stringify({
          code: "STA3",
          bus: false,
          tz: "P",
          scharr: "10/10/2020 08:00:00",
          schdep: "10/10/2020 08:10:00",
        }),
        Station1: JSON.stringify({
          code: "STA1",
          bus: false,
          tz: "E",
          estdep: "10/10/2020 07:00:00",
          schdep: "10/10/2020 06:30:00",
        }),
        Station2: JSON.stringify({
          code: "STA2",
          bus: false,
          tz: "M",
          scharr: "10/10/2020 07:15:00",
          schdep: "10/10/2020 07:20:00",
        }),
      },
    },
  ],
};

export const enrouteArrived = {
  features: [
    {
      properties: {
        ID: "train 2",
        Heading: "ns",
        TrainNum: "42",
        RouteName: "Choo Choo Route",
        Station2: JSON.stringify({
          code: "STA2",
          bus: false,
          tz: "M",
          postarr: "10/10/2020 13:45:00",
          postdep: "10/10/2020 13:48:00",
        }),
        Station4: JSON.stringify({
          code: "STA4",
          bus: false,
          tz: "M",
          scharr: "10/10/2020 18:15:00",
        }),
        Station3: JSON.stringify({
          code: "STA3",
          bus: false,
          tz: "E",
          postarr: "10/10/2020 14:19:00",
        }),
        Station1: JSON.stringify({
          code: "STA1",
          bus: false,
          tz: "C",
          postdep: "10/10/2020 13:25:00",
        }),
      },
    },
  ],
};

export const enroute = {
  features: [
    {
      properties: {
        ID: "train 2",
        Heading: "ns",
        TrainNum: "42",
        RouteName: "Choo Choo Route",
        Station2: JSON.stringify({
          code: "STA2",
          bus: false,
          tz: "M",
          postarr: "10/10/2020 13:45:00",
          postdep: "10/10/2020 13:48:00",
        }),
        Station4: JSON.stringify({
          code: "STA4",
          bus: false,
          tz: "M",
          scharr: "10/10/2020 18:15:00",
        }),
        Station3: JSON.stringify({
          code: "STA3",
          bus: false,
          tz: "E",
          postarr: "10/10/2020 14:19:00",
          postdep: "10/10/2020 14:23:00",
        }),
        Station1: JSON.stringify({
          code: "STA1",
          bus: false,
          tz: "C",
          postdep: "10/10/2020 13:25:00",
        }),
        Station5: JSON.stringify({
          code: "STA5",
          bus: false,
          tz: "M",
          scharr: "10/10/2020 18:15:00",
        }),
      },
    },
  ],
};

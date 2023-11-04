import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import handlebars from "handlebars";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

dotenv.config();

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[\s_]/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-{2,}/g, "-");

const stationDelay = (station) => {
  const delay = { arrival: false, departure: false };

  if (
    station.arrivalScheduled &&
    (station.arrivalActual || station.arrivalEstimated)
  ) {
    // The train can't have a delayed arrival if there's not a scheduled arrival
    // or at least one of actual or estimated arrival.
    const scheduled = dayjs(station.arrivalScheduled).tz(station.timezone);
    const actual = dayjs(station.arrivalActual ?? station.arrivalEstimated).tz(
      station.timezone,
    );

    const delayTime = dayjs.duration(actual.diff(scheduled));
    if (delayTime.asMinutes() > 10) {
      delay.arrival = delayTime.humanize();
    }
  }

  if (
    station.departureScheduled &&
    (station.departureActual || station.departureEstimated)
  ) {
    // Same kinda logic for departure delays. :)
    const scheduled = dayjs(station.departureScheduled).tz(station.timezone);
    const actual = dayjs(
      station.departureActual ?? station.departureEstimated,
    ).tz(station.timezone);

    const delayTime = dayjs.duration(actual.diff(scheduled));
    if (delayTime.asMinutes() > 10) {
      delay.departure = delayTime.humanize();
    }
  }

  if (station.departureScheduled) {
  }
  return delay;
};

const dayAndTime = (str, tz) => {
  const ts = dayjs(str).tz(tz);
  return `${ts.format("dddd")} at ${ts.format("h:mm A")}`;
};

const BASE_URL = process.env.BASE_URL ?? "/amtrak-api";

const TAG_BG_COLORS = new Map([
  ["scheduled", "bg-base-lighter"],
  ["departed", "bg-primary-dark"],
  ["enroute", "bg-green"],
  ["on time", "bg-green"],
  ["arrived", "bg-gold"],
  ["delayed", "bg-secondary-dark"],
]);

const TAG_TEXT_COLORS = new Map([
  ["scheduled", "text-black"],
  ["departed", "text-white"],
  ["enroute", "text-white"],
  ["on time", "text-white"],
  ["arrived", "text-black"],
  ["delayed", "text-white"],
]);

const STATION_COLORS = new Map([
  ["arrived", "bg-gold"],
  ["enroute", "bg-green"],
  ["departed", "bg-primary-dark"],
  ["scheduled", "bg-base-light"],
]);

// Get the route data
const routes = JSON.parse(
  await fs.readFile("_site/routes.json", { encoding: "utf-8" }),
).map((routeInfo) => {
  const routeUrl = `${BASE_URL}/${slugify(routeInfo.route)}`;
  const routePath = `_site/${slugify(routeInfo.route)}`;
  const route = {
    name: routeInfo.route,
    filepath: routePath,
    url: routeUrl,
  };

  route.trains = routeInfo.trains.map((trainInfo) => {
    const train = {
      route: route.name,
      number: trainInfo.number,
      filepath: `${routePath}/${trainInfo.number}-${trainInfo.id}.html`,
      url: `${routeUrl}/${trainInfo.number}-${trainInfo.id}.html`,
      info: "",
      status: "scheduled",
      trackColor: "bg-base-light",
    };

    train.stations = trainInfo.stations.map((stationInfo) => {
      const station = {
        name: stationInfo.station.name,
        code: stationInfo.code,
        status: stationInfo.status,

        // Are our arrival and departure times known or expected? We know the
        // arrival time if the train has arrived or departed, and we know the
        // departure time if the train has departed. In all other cases, we're
        // just hoping for the best.
        arrivalKnown:
          stationInfo.status === "arrived" || stationInfo.status === "departed",
        departureKnown: stationInfo.status === "departed",

        delay: stationDelay(stationInfo),

        tag: {
          text: stationInfo.status,
          bg: TAG_BG_COLORS.get(stationInfo.status),
          color: TAG_TEXT_COLORS.get(stationInfo.status),
        },

        dotColor: STATION_COLORS.get(stationInfo.status),
        spacerColors: { before: "", after: "" },

        arrival: (() => {
          const t =
            stationInfo.arrivalActual ??
            stationInfo.arrivalEstimated ??
            stationInfo.arrivalScheduled ??
            false;
          if (t) {
            return dayAndTime(t, stationInfo.timezone);
          }
          return false;
        })(),
        departure: (() => {
          const t =
            stationInfo.departureActual ??
            stationInfo.departureEstimated ??
            stationInfo.departureScheduled ??
            false;
          if (t) {
            return dayAndTime(t, stationInfo.timezone);
          }
          return false;
        })(),
      };

      if (station.status === "enroute" || station.status === "scheduled") {
        station.info = [];
        if (station.delay.arrival || station.delay.departure) {
          station.info.push("This train is running behind schedule.");
          if (station.delay.arrival) {
            station.info.push(
              `It will arrive about ${station.delay.arrival} late`,
            );
          }

          if (station.delay.arrival && station.delay.departure) {
            station.info.push(" and ");
          }

          if (station.delay.departure) {
            if (!station.delay.arrival) {
              station.info.push("It ");
            }
            station.info.push(
              ` will depart about ${station.delay.departure} late.`,
            );
          }
        }
        station.info = station.info.join(" ");
      }

      return station;
    });

    train.stations.forEach((station, i) => {
      if (station.status === "departed") {
        station.spacerColors.after = "bg-primary-dark";
      }
      if (i > 0) {
        station.spacerColors.before = train.stations[i - 1].spacerColors.after;
      }
    });

    if (train.stations[0].status !== "scheduled") {
      train.status = "on time";
    }
    if (train.stations.slice(-1).pop().status === "arrived") {
      train.status = "arrived";
    }
    train.tag = {
      text: train.status,
      bg: TAG_BG_COLORS.get(train.status),
      color: TAG_TEXT_COLORS.get(train.status),
    };
    if (train.status !== "scheduled") {
      train.trackColor = "bg-primary-light";
    }

    const first = train.stations[0];
    const final = train.stations.slice(-1).pop();

    if (train.status === "scheduled") {
      train.info = `Scheduled to depart ${first.name} on ${first.departure} and arrive at ${final.name} on ${final.arrival}.`;
    } else {
      const { previous, next } = (() => {
        const index = train.stations.findLastIndex(
          ({ status }) => status === "departed" || status === "arrived",
        );
        if (index > 0) {
          return {
            previous: train.stations[index],
            next: train.stations[index + 1],
          };
        }
        return {
          previous: first,
          next: final,
        };
      })();

      if (previous?.delay.departure || next?.delay.arrival) {
        train.tag.text = "delayed";
        train.tag.bg = TAG_BG_COLORS.get("delayed");
        train.tag.color = TAG_TEXT_COLORS.get("delayed");
      }

      const info = [
        previous.status === "arrived" ? "Arrived at " : "Departed from ",
        previous.name,
      ];
      if (previous.status === "arrived" && previous.delay.arrival) {
        info.push(" about ", previous.delay.arrival, " late");
      }
      if (previous.status === "departed" && previous.delay.departure) {
        info.push(" about ", previous.delay.departure, " late");
      }

      info.push(" on ", previous.arrival);

      if (previous.status === "departed") {
        info.push(" and is scheduled to arrive at ", next.name);
        if (next.delay.arrival) {
          info.push(" about ", next.delay.arrival, " late");
        }
        info.push(" on ", next.arrival);
      } else if (next) {
        info.push(". Expected to depart");
        if (previous.delay.departure) {
          info.push(" about ", previous.delay.departure, " late");
        }
        info.push(" on ", previous.departure, " and arrive at ", next.name);
        if (next.delay.arrival) {
          info.push(" about ", next.delay.arrival, " late");
        }
        info.push(" on ", next.arrival);
      }
      info.push(".");

      train.info = info.join("");
    }

    train.from = train.stations[0].name;
    train.to = train.stations.slice(-1).pop().name;

    return train;
  });

  return route;
});

// Register all our handlebar partials so they're available in our templates.
await fs
  .readdir("src/site/templates/partials")
  .then((files) =>
    files
      .filter((file) => file.endsWith(".handlebars"))
      .map(async (file) => {
        const name = path.basename(file, ".handlebars");
        const template = await fs.readFile(
          path.join("src/site/templates/partials", file),
          { encoding: "utf-8" },
        );
        handlebars.registerPartial(name, template);
      }),
  )
  .then((promises) => Promise.all(promises));

// Load our two template files. One is for index pages (front page and route
// pages), and the other is for a single train.
const indexTemplate = await fs
  .readFile("src/site/templates/index.handlebars", {
    encoding: "utf-8",
  })
  .then((template) => handlebars.compile(template));
const trainTemplate = await fs
  .readFile("src/site/templates/train.handlebars", {
    encoding: "utf-8",
  })
  .then((template) => handlebars.compile(template));

// Build the front page
const indexPage = indexTemplate({
  index: true,
  routes,
});
await fs.writeFile("_site/index.html", indexPage);

// Build all the route pages.
const routePages = routes.map(async (route) => {
  // Make a directory for the route
  await fs.mkdir(route.filepath, { recursive: true });

  // Build the route index page and write it out.
  const page = indexTemplate({ routes: [route] });
  await fs.writeFile(path.join(route.filepath, "index.html"), page);

  // Now create pages for each train on the route.
  const trainPages = route.trains.map(async (train) => {
    const page = trainTemplate(train);
    await fs.writeFile(path.join(train.filepath), page);
  });
  await Promise.all(trainPages);
});

await Promise.all(routePages);

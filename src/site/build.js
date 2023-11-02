import fs from "node:fs/promises";
import path from "node:path";
import handlebars from "handlebars";
import * as helpers from "./helpers/index.js";
import { slugify } from "./utils.js";

// Get the route data
const routes = JSON.parse(
  await fs.readFile("_site/routes.json", { encoding: "utf-8" }),
);

// Register all of our handlebar helpers. Using these helpers feels kinda janky
// but it does work so... okay.
Object.entries(helpers).forEach(([name, handler]) => {
  handlebars.registerHelper(name, handler);
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
  // Get the route slug
  const slug = slugify(route.route);

  // Make a directory for the route
  const dir = path.join("_site", slug);
  await fs.mkdir(dir, { recursive: true });

  // Build the route index page and write it out.
  const page = indexTemplate({ routes: [route] });
  await fs.writeFile(path.join(dir, "index.html"), page);

  // Now create pages for each train on the route.
  const trainPages = route.trains.map(async (train) => {
    const page = trainTemplate(train);
    await fs.writeFile(
      path.join(dir, `${train.number}-${train.id}.html`),
      page,
    );
  });
  await Promise.all(trainPages);
});

await Promise.all(routePages);

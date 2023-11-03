import { slugify } from "../utils.js";

export const routeLink = function () {
  return `${slugify(this.route)}/`;
};

export const trainLink = function (isIndexPage) {
  const url = `${this.number}-${this.id}.html`;

  if (isIndexPage) {
    return `${slugify(this.route)}/${url}`;
  }
  return url;
};

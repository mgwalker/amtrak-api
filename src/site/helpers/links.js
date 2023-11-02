import { slugify } from "../utils.js";

export const routeLink = function () {
  return `${slugify(this.route)}/`;
};

export const trainLink = function () {
  return `${slugify(this.route)}/${this.number}.html`;
};

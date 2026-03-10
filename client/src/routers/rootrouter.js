import { createRootRoute } from "@tanstack/react-router";
import { rooteLayout } from "../App.jsx";
import { homeRouter } from "./homeRouter.js";
import { busListRouter } from "./busListRouter.js";
import { busDetailRouter } from "./busDetailRouter.js";

export const rootRoute = createRootRoute({
  component: rooteLayout,
});

export const routerTree = rootRoute.addChildren([
  homeRouter,
  busListRouter,
  busDetailRouter,
]);

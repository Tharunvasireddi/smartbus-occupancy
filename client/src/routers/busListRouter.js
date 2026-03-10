import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./rootrouter";
import { BusListPage } from "../pages/BusListPage";

export const busListRouter = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buses",
  component: BusListPage,
});

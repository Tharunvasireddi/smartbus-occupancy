import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./rootrouter";
import { BusDetailsPage } from "../pages/BusDetailsPage";

export const busDetailRouter = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buses/$busNumber",
  component: BusDetailsPage,
});

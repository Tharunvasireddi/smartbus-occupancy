import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./rootrouter";

// Entry route now sends everyone to the public buses page.
export const homeRouter = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/buses" });
  },
  component: () => null,
});


import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod/v4";
import { lazy } from "react";
import type { useAppStore, useMessageStore } from "@core/stores";
import type { useTranslation } from "react-i18next";

// Lazy Load Components (Break Circular Dependencies)
// Handle Named Exports: .then(module => ({ default: module.ExportName }))
const App = lazy(() => import("./App.tsx").then((module) => ({ default: module.App })));
const Connections = lazy(() => import("@pages/Connections/index.tsx").then((module) => ({ default: module.Connections })));
const DialogManager = lazy(() => import("@components/Dialog/DialogManager.tsx").then((module) => ({ default: module.DialogManager })));

// Handle Default Exports
const MapPage = lazy(() => import("@pages/Map/index.tsx"));
const MessagesPage = lazy(() => import("@pages/Messages.tsx"));
const NodesPage = lazy(() => import("@pages/Nodes/index.tsx"));
const ConfigPage = lazy(() => import("@pages/Settings/index.tsx"));

interface AppContext {
  stores: {
    app: ReturnType<typeof useAppStore>;
    message: ReturnType<typeof useMessageStore>;
  };
  i18n: ReturnType<typeof useTranslation>;
}

export const rootRoute = createRootRouteWithContext<AppContext>()({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Connections,
  // loader: () => {
  //   // Redirect to the broadcast messages page on initial load
  //   return redirect({ to: "/messages/broadcast/0", replace: true });
  // },
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
  beforeLoad: ({ params }) => {
    // const DEFAULT_CHANNEL = 0;
    // if (Object.values(params).length === 0) {
    //   throw redirect({
    //     to: `/messages/broadcast/${DEFAULT_CHANNEL}`,
    //     replace: true,
    //   });
    // }
  },
});

export const messagesWithParamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages/$type/$chatId",
  component: MessagesPage,
  parseParams: (params) => ({
    type: z
      .enum(["direct", "broadcast"])
      .refine((val) => val === "direct" || val === "broadcast", {
        message: 'Type must be "direct" or "broadcast".',
      })
      .parse(params.type),
    chatId: z.coerce.number().int().min(0).max(4294967294).parse(params.chatId),
  }),
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/map",
  component: MapPage,
});

const coordParamsSchema = z.object({
  long: z.coerce
    .number()
    .refine(
      (n) => Number.isFinite(n) && n >= -180 && n <= 180,
      "Invalid longitude (-180..180).",
    ),
  lat: z.coerce
    .number()
    .refine(
      (n) => Number.isFinite(n) && n >= -90 && n <= 90,
      "Invalid latitude (-90..90).",
    ),
  zoom: z.coerce
    .number()
    .int()
    .min(0, "Zoom too small.")
    .max(22, "Zoom too large."),
});

export const mapWithParamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/map/$long/$lat/$zoom",
  component: MapPage,
  parseParams: (raw) => coordParamsSchema.parse(raw),
});

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: ConfigPage,
});

export const radioRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "radio",
  component: ConfigPage,
});

export const deviceRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "device",
  component: ConfigPage,
});

export const moduleRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "module",
  component: ConfigPage,
});

const nodesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nodes",
  component: NodesPage,
});

const dialogWithParamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dialog/$dialogId",
  component: DialogManager,
});

const connectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connections",
  component: Connections,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  messagesRoute,
  messagesWithParamsRoute,
  mapRoute,
  mapWithParamsRoute,
  settingsRoute.addChildren([radioRoute, deviceRoute, moduleRoute]),
  nodesRoute,
  dialogWithParamsRoute,
  connectionsRoute,
]);

const router = createRouter({
  routeTree,
  context: {
    stores: {
      app: {} as ReturnType<typeof useAppStore>,
      message: {} as ReturnType<typeof useMessageStore>,
    },
    i18n: {} as ReturnType<typeof import("react-i18next").useTranslation>,
  },
});

export { router };

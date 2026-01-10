import React from "react";
console.log("Index.tsx executing...");
window.addEventListener("error", (event) => {
  const errDiv = document.createElement("div");
  errDiv.style.position = "fixed";
  errDiv.style.top = "0";
  errDiv.style.left = "0";
  errDiv.style.width = "100%";
  errDiv.style.background = "red";
  errDiv.style.color = "white";
  errDiv.style.zIndex = "9999";
  errDiv.style.padding = "20px";
  errDiv.innerText = "Global Error: " + event.message + "\n" + (event.error?.stack || "");
  document.body.appendChild(errDiv);
});
import "@app/index.css";

// Import feature flags and dev overrides
import "@core/services/dev-overrides.ts";
import { enableMapSet } from "immer";
import "maplibre-gl/dist/maplibre-gl.css";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./i18n-config.ts";
import { router } from "@app/routes.tsx";
import { useAppStore, useMessageStore } from "@core/stores";
import { type createRouter, RouterProvider } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

function IndexPage() {
  console.warn("1. IndexPage Rendering");
  try {
    enableMapSet();
    console.warn("2. MapSet enabled");
    const appStore = useAppStore();
    console.warn("3. AppStore loaded", appStore);
    const messageStore = useMessageStore();
    console.warn("4. MessageStore loaded");
    const translation = useTranslation();
    console.warn("5. Translation loaded");

   const context = React.useMemo(
    () => ({
      stores: {
        app: appStore,
        message: messageStore,
      },
      i18n: translation,
    }),
    [appStore, messageStore, translation],
  );

  return (
    <React.StrictMode>
      <Suspense fallback={<div>Loading Suspense...</div>}>
         {/* <div>Router would go here...</div> */}
         <RouterProvider router={router} context={context} />
      </Suspense>
    </React.StrictMode>
  );

  } catch (e: any) {
    console.error("CRITICAL RENDER ERROR", e);
    return <div style={{color: 'red'}}>CRITICAL ERROR: {e.message}</div>;
  }
}

root.render(<IndexPage />);

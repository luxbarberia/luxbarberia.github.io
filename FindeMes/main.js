import { App } from "./App.js";

const root = document.querySelector("#app");
const app = new App(root);
app.start();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("Service worker no disponible", error));
  });
}

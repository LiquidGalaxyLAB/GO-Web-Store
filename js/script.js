import { AnimatedLogo } from "./animated-logo.mjs";
import { Searchbar } from "./search-bar.mjs";
import { AppCard } from "./app-card.mjs";
import { getApps } from "./get-apps.mjs";

customElements.define("animated-logo", AnimatedLogo);
customElements.define("search-bar", Searchbar);
customElements.define("app-card", AppCard);

document.addEventListener("DOMContentLoaded", () => {
  // Don't automatically animate the main page logo - only splash screen animates
  getApps();
});

const searchbar = document.querySelector("search-bar");
searchbar.addEventListener("search", (event) => {
  getApps(event.detail);
});

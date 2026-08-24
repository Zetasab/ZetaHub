import { initCarousel } from "./carousel.js";
import { initVisitTracking } from "./ring/visit.js";

document.addEventListener("DOMContentLoaded", () => {
  initCarousel(document.getElementById("ring-root"));
  initVisitTracking();
});

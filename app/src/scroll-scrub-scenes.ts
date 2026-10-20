import { createElement } from "react";
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#9E5A3C",
  background: "#F4F1EA",
  ink: "#161816",
  muted: "#4E524D",
};

const openingActions = createElement(
  "div",
  { className: "pf-hero-actions" },
  createElement(
    "a",
    { href: "#surface-model", className: "pf-button pf-button-primary" },
    "Inspect 3D Surface & Light",
  ),
  createElement(
    "a",
    { href: "#finishes", className: "pf-button pf-button-quiet" },
    "Explore Finish Portfolio",
  ),
);

const macroActions = createElement(
  "div",
  { className: "pf-hero-actions" },
  createElement(
    "a",
    { href: "#approach", className: "pf-button pf-button-primary" },
    "5-Layer Wall Engineering",
  ),
  createElement(
    "a",
    { href: "#systems", className: "pf-button pf-button-quiet" },
    "View 15 Supplier Catalogues",
  ),
);

const interiorActions = createElement(
  "div",
  { className: "pf-hero-actions" },
  createElement(
    "a",
    { href: "#projects", className: "pf-button pf-button-primary" },
    "Executed Project Register (14)",
  ),
  createElement(
    "a",
    { href: "#contact", className: "pf-button pf-button-quiet" },
    "Request Sample Board",
  ),
);

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    id: "facade-monolith",
    label: "01 · Architecture Emerges",
    kicker: "Specialist Surface-Coatings Contractor & Applicator",
    title: "A building revealed through its surface.",
    body: "Scroll from the architecture outward, then return through the facade into the tactile finish systems Profacciata specifies and executes on site.",
    clip: "/assets/world/scene-01.mp4",
    poster: "/assets/world/scene-01-poster.jpg",
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.jpg",
    tags: ["Travertino & Lime Plaster", "Luxrock & Luxstone Exterior", "Pan-India Execution"],
    actions: openingActions,
    align: "left",
    scroll: 1.65,
    linger: 0.08,
    objectPosition: "center center",
    mobileObjectPosition: "center center",
  },
  {
    id: "grazing-relief",
    label: "02 · Enter the Surface",
    kicker: "Material Depth & Multi-Coat Discipline",
    title: "The facade becomes a landscape of light.",
    body: "A close architectural pass draws into the mineral grain, relief and shadow that give a wall its depth—before the material becomes something you can inspect.",
    clip: "/assets/world/scene-02.mp4",
    poster: "/assets/world/scene-02-poster.jpg",
    mobileClip: "/assets/world/scene-02-mobile.mp4",
    mobilePoster: "/assets/world/scene-02-mobile-poster.jpg",
    tags: ["Lime-N-Clay Heritage", "Culture Concrete CC01–CC12", "Substrate Engineering"],
    actions: macroActions,
    align: "right",
    scroll: 1.5,
    linger: 0.08,
    objectPosition: "center center",
    mobileObjectPosition: "center center",
  },
  {
    id: "interior-continuity",
    label: "03 · Material in Space",
    kicker: "Monolithic Walls, Floors & Sculpted 3D Relief",
    title: "A material that changes the room around it.",
    body: "From a macro surface to a manipulable facade fragment, then back to interiors, facades and feature walls—the finish carries the architecture forward.",
    clip: "/assets/world/scene-03.mp4",
    poster: "/assets/world/scene-03-poster.jpg",
    mobileClip: "/assets/world/scene-03-mobile.mp4",
    mobilePoster: "/assets/world/scene-03-mobile-poster.jpg",
    tags: ["Cemento 2K Floor LCF-101..116", "Iconic Walls & Signature 3D", "LCC Cladding"],
    actions: interiorActions,
    align: "left",
    scroll: 1.45,
    linger: 0.08,
    objectPosition: "center center",
    mobileObjectPosition: "center center",
  },
];

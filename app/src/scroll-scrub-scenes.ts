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
    label: "01 · Exterior Monolith",
    kicker: "Specialist Surface-Coatings Contractor & Applicator",
    title: "Where architecture meets the hand-troweled surface.",
    body: "Interior and exterior mineral plasters, architectural concrete, and natural stone coatings—sourced from premier manufacturers and executed on site by Profacciata.",
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
    label: "02 · Grazing Light",
    kicker: "Material Depth & Multi-Coat Discipline",
    title: "Built in five strata. Revealed by grazing light.",
    body: "From substrate moisture testing and alkali-resistant primers to hand-burnished silica aggregates and siloxane sealers, every surface is engineered for architectural permanence.",
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
    label: "03 · Interior Continuity",
    kicker: "Monolithic Walls, Floors & Sculpted 3D Relief",
    title: "Seamless mineral calm from wall to floor.",
    body: "Carved 3D sandstone reliefs, lightweight linear concrete cladding, and two-component Cemento 2K microtopping floors tailored for private residences, hospitality, and headquarters.",
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

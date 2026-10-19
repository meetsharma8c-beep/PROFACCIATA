import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { StructuredData } from "@/components/StructuredData";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

interface PbrMetallicRoughness {
  setBaseColorFactor: (rgba: [number, number, number, number]) => void;
  setRoughnessFactor: (value: number) => void;
  setMetallicFactor: (value: number) => void;
}

interface ModelMaterial {
  name: string;
  pbrMetallicRoughness: PbrMetallicRoughness;
}

type ModelViewerElement = HTMLElement & {
  model?: {
    materials?: ModelMaterial[];
  };
  cameraOrbit?: string;
  cameraTarget?: string;
  exposure?: number;
  shadowIntensity?: number;
  shadowSoftness?: number;
};

interface FinishPreset {
  id: string;
  code: string;
  name: string;
  supplier: string;
  catalogueRef: string;
  swatchClass: string;
  primaryRgba: [number, number, number, number];
  primaryRoughness: number;
  reliefRgba: [number, number, number, number];
  reliefRoughness: number;
  applicationZones: string;
  summary: string;
}

const FINISH_PRESETS: readonly FinishPreset[] = [
  {
    id: "travertino",
    code: "LMSC-304 / CALCE",
    name: "Travertino & Lime-N-Clay Plaster",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    catalogueRef: "Master Catalogue & Lime-N-Clay Heritage Plaster",
    swatchClass: "pf-swatch--travertino",
    primaryRgba: [0.89, 0.85, 0.77, 1.0],
    primaryRoughness: 0.78,
    reliefRgba: [0.83, 0.77, 0.67, 1.0],
    reliefRoughness: 0.72,
    applicationZones: "Interior feature walls, double-height lobbies & sheltered facades",
    summary:
      "Breathable zero-VOC slaked lime and earthen clay plaster with natural silica aggregate and hand-troweled pitting that catches oblique daylight.",
  },
  {
    id: "concrete",
    code: "CC-04 / LCC-02",
    name: "Architectural Formwork Concrete",
    supplier: "Luxture Culture Concrete & LCC Cladding",
    catalogueRef: "CULTURE CONCRETE (1).pdf & LCC catalogue A (2).pdf",
    swatchClass: "pf-swatch--concrete",
    primaryRgba: [0.66, 0.68, 0.65, 1.0],
    primaryRoughness: 0.66,
    reliefRgba: [0.56, 0.58, 0.55, 1.0],
    reliefRoughness: 0.62,
    applicationZones: "Corporate headquarters, monolithic elevations & cantilevered soffits",
    summary:
      "Mineral oxide formwork concrete and 4–6 mm lightweight linear concrete panels delivering true board-marked and fluted architectural mass without structural dead-load.",
  },
  {
    id: "sandstone",
    code: "IW-09 / SG-32",
    name: "Sculpted 3D Sandstone & Corten Relief",
    supplier: "Iconic Walls & Signature 3D Panels",
    catalogueRef: "Iconic Walls Catalogue.pdf & Signature 3D New Arrivals",
    swatchClass: "pf-swatch--sandstone",
    primaryRgba: [0.78, 0.61, 0.48, 1.0],
    primaryRoughness: 0.82,
    reliefRgba: [0.71, 0.52, 0.39, 1.0],
    reliefRoughness: 0.76,
    applicationZones: "Hospitality reception walls, staircase voids & gallery corridors",
    summary:
      "Deep-carved 12–55 mm fluted and harmonic wave relief panels in warm Agra sandstone and raw terracotta tones engineered for dramatic grazing shadows.",
  },
  {
    id: "microcement",
    code: "LCF-106 / LDC-208",
    name: "Cemento 2K & DecorCem Microtopping",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    catalogueRef: "Cemento 2K flooring shedcard.pdf & Decorcem Wall catalogue",
    swatchClass: "pf-swatch--microcement",
    primaryRgba: [0.79, 0.77, 0.72, 1.0],
    primaryRoughness: 0.38,
    reliefRgba: [0.73, 0.71, 0.66, 1.0],
    reliefRoughness: 0.44,
    applicationZones: "Seamless floors, wet-area bathrooms, retail galleries & minimal walls",
    summary:
      "Two-component high-abrasion microtopping floor and wall overlay sealed with aliphatic PU top-coat for joint-free architectural continuity.",
  },
] as const;

const WALL_STRATA = [
  {
    step: "01",
    name: "Substrate Verification & Mechanical Preparation",
    spec: "Moisture < 4% · Level tolerance ±2 mm over 2 m straightedge",
    tools: "Digital moisture meter, diamond grinding disc, vacuum dedusting",
    detail:
      "Every Profacciata project begins with structural substrate auditing across RCC, AAC blockwork, cement plaster, or existing tile/stone—repairing hairline fissures and establishing mechanical key.",
  },
  {
    step: "02",
    name: "Penetrating Alkali-Resistant Mineral Primer",
    spec: "1–2 coats · Deep capillary consolidation · 4–6 hr cure window",
    tools: "Microfibre roller & cross-hatch brush application",
    detail:
      "Equalizes substrate porosity and blocks efflorescence or alkaline migration from fresh masonry before base-coat troweling.",
  },
  {
    step: "03",
    name: "Crack-Bridging Base Coat & Groove Tape Detailing",
    spec: "1.5–2.5 mm build · Alkali-resistant fiberglass mesh & architectural groove layout",
    tools: "Stainless steel inox trowel & precision laser datum lines",
    detail:
      "Establishes the true architectural plane and sets clean shadow-gap grooves or rustication joints as specified in Luxstone and Culture Concrete systems.",
  },
  {
    step: "04",
    name: "Textured Mineral, Stone Spray or Microtopping Coat",
    spec: "1.5–4.0 mm finish coat (or 12–55 mm 3D panel / 4–6 mm LCC cladding)",
    tools: "Venetian inox trowel, acrylic float,hopper spray gun, or calibrated notched trowel",
    detail:
      "Executed by trained applicators to achieve uniform pit density, travertine vein direction, granite flake distribution, or seamless microcement movement.",
  },
  {
    step: "05",
    name: "Protective Aliphatic PU / Hydrophobic Siloxane Sealer",
    spec: "2 cross-rolled coats · UV-stable, anti-fungal & monsoon-grade breathable shield",
    tools: "Short-nap velour roller & low-pressure misting",
    detail:
      "Locks in pigment fidelity against Indian monsoon humidity, coastal salinity, and high-traffic floor abrasion while preserving natural mineral tactility.",
  },
] as const;

const FINISH_PORTFOLIO = [
  {
    index: "01",
    title: "Lime, Clay & Heritage Mineral Plasters",
    supplier: "Luxture — Master Catalogue & Lime-N-Clay Heritage Plaster",
    codes: "Calce · Argilla · Travertino · Smooth, Pitted, Fine, Straw & Coarse",
    zone: "Interior & Sheltered Exterior",
    image: "/assets/macro-plaster.jpg",
    alt: "Macro grazing-light study of hand-troweled travertine and lime plaster",
    summary:
      "100% natural, zero-VOC slaked lime and earthen clay plasters infused with marble dust, silica sand, and natural fibres for breathable, timeless walls.",
    className: "pf-finish-card--wide",
    serviceValue: "Lime & Heritage Plaster (Calce / Lime-N-Clay)",
  },
  {
    index: "02",
    title: "Architectural Concrete & Linear Cladding",
    supplier: "Luxture Culture Concrete & LCC (Linear Concrete Cladding)",
    codes: "CC01–CC12 · Board-Formed, Corten, Wabi-Sabi & 4–6 mm LCC Fluted Panels",
    zone: "Interior & Exterior Facades",
    image: "/assets/texture-study-heritage.jpg",
    alt: "Architectural concrete and mineral surface study under directional light",
    summary:
      "Handcrafted troweled concrete finishes and lightweight 4–6 mm precast concrete panels with authentic tie-holes, formwork grain, and oxide patina.",
    className: "pf-finish-card--standard",
    serviceValue: "Architectural Concrete & LCC Cladding",
  },
  {
    index: "03",
    title: "Cemento 2K Flooring & DecorCem Microcement",
    supplier: "Luxture — Cemento Floor 2K & DecorCem Wall",
    codes: "LCF-101 to LCF-116 (Floor 2K) · LDC-201 to LDC-216 (DecorCem Wall)",
    zone: "Seamless Floors, Wet Areas & Walls",
    image: "/assets/microcement-bath.jpg",
    alt: "Monolithic microcement bathroom and seamless floor study",
    summary:
      "Joint-free two-component cementitious microtopping for high-traffic floors, staircases, luxury bathrooms, and minimalist architectural volumes.",
    className: "pf-finish-card--standard",
    serviceValue: "Cemento 2K Flooring & DecorCem Microcement",
  },
  {
    index: "04",
    title: "Sculpted 3D Sandstone & Architectural Reliefs",
    supplier: "Iconic Walls & Signature 3D New Arrivals",
    codes: "Parallel Harmony · Wave Crest · Fluted Elegance · SG-31..33 (12–55 mm depth)",
    zone: "Feature Walls, Lobbies & Double-Height Voids",
    image: "/assets/interior-living.jpg",
    alt: "Double-height interior showcasing fluted 3D wall relief and seamless flooring",
    summary:
      "Precision-carved sandstone and mineral composite 3D panels in 8 natural stone tones that transform flat walls into sculptural light-catchers.",
    className: "pf-finish-card--wide",
    serviceValue: "Sculpted 3D Relief Panels (Iconic Walls / Signature 3D)",
  },
  {
    index: "05",
    title: "Exterior Granite Spray, Luxstone & Flexi Clad",
    supplier: "Luxture Luxrock, Luxstone, Abstract & Flexi Clad MCM",
    codes: "LSS/LMS-101..222 · LS-1101..1138 · ABS 2601..2624 · 2–4 mm MCM Veneer",
    zone: "High-Rise Towers, Villas & Monsoon Facades",
    image: "/assets/hero-indian-residence.jpg",
    alt: "Contemporary Indian residence with warm mineral plaster and stone facade systems",
    summary:
      "Weather-shielded natural stone granule coatings and flexible modified-clay stone veneers engineered for extreme UV, rain, and thermal cycling.",
    className: "pf-finish-card--standard",
    serviceValue: "Exterior Stone Coating (Luxrock / Luxstone / Abstract)",
  },
  {
    index: "06",
    title: "Silk-Cotton Acoustic Plasters & Stamped Hardscapes",
    supplier: "Luxture Dekor Plast & Stamp Concrete Systems",
    codes: "DP-101 to DP-128 (Cellulose/Silk Fiber) · Ashlar Slate, Cobble & Wood Plank",
    zone: "Hospitality Suites, Auditoriums & Podium Hardscapes",
    image: "/assets/hero-facade.jpg",
    alt: "Dusk architectural study with warm illuminated plaster and hardscape court",
    summary:
      "Tactile cotton-and-silk fiber interior plasters for acoustic comfort alongside monolithic stamped concrete hardscapes for driveways and plazas.",
    className: "pf-finish-card--standard",
    serviceValue: "Dekor Plast / Stamped Concrete Hardscape",
  },
] as const;

type SystemCategory = "all" | "plaster" | "concrete" | "exterior" | "relief";

interface SupplierCatalogueItem {
  id: string;
  code: string;
  title: string;
  supplier: string;
  category: Exclude<SystemCategory, "all">;
  categoryLabel: string;
  shadeSeries: string;
  applicationMethod: string;
  substrates: string;
  highlights: string;
}

const SUPPLIER_CATALOGUES: readonly SupplierCatalogueItem[] = [
  {
    id: "master-catalogue",
    code: "CAT-01",
    title: "Luxture Master Architectural Catalogue (56 pp)",
    supplier: "Luxture Surface Coatings Pvt. Ltd. (ISO 9001:2015 · French Technology)",
    category: "plaster",
    categoryLabel: "Mineral & Lime Plasters",
    shadeSeries: "Dholpur, Travertino, Calce, Argilla, Finesta, Mulberry, Metallica, Creativo, Lamina",
    applicationMethod: "Hand-troweled inox float, sponge float & specialty texture rollers",
    substrates: "Internal & external cement plaster, putty, gypsum board, concrete",
    highlights:
      "Comprehensive 19-system architectural finish library spanning Italian-inspired travertine, burnished lime, metallic washes, and natural stone textures.",
  },
  {
    id: "lime-n-clay",
    code: "CAT-02",
    title: "Lime-N-Clay Heritage Plaster",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    category: "plaster",
    categoryLabel: "Mineral & Lime Plasters",
    shadeSeries: "Smooth, Pitted, Fine, Straw & Coarse natural earth palettes",
    applicationMethod: "Multi-coat artisan steel & wooden trowel application",
    substrates: "Lime mortar, cement plaster, brick masonry, breathable boards",
    highlights:
      "100% eco-friendly zero-VOC heritage plaster formulated from hydraulic lime, earthen clay, marble aggregates, rice husk, and natural plant fibres.",
  },
  {
    id: "cemento-2k",
    code: "CAT-03",
    title: "Cemento Floor 2K Microtopping System",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    category: "concrete",
    categoryLabel: "Concrete & Microtopping",
    shadeSeries: "16 Curated Shades: LCF-101 to LCF-116",
    applicationMethod: "5-Step System: Primer → Base Coat → Top Coat → Sanding → PU Sealer",
    substrates: "RCC slabs, cement screed, existing ceramic/vitrified tiles, marble",
    highlights:
      "High-strength 2-component polymer-modified cementitious floor overlay delivering seamless, joint-free architectural floors at 2–3 mm thickness.",
  },
  {
    id: "decorcem-wall",
    code: "CAT-04",
    title: "DecorCem Wall Overlay System",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    category: "concrete",
    categoryLabel: "Concrete & Microtopping",
    shadeSeries: "16 Mineral Shades: LDC-201 to LDC-216",
    applicationMethod: "Ready-to-use mineral paste applied via flexible steel trowel",
    substrates: "Interior & exterior walls, bathrooms, feature partitions, MDF/plywood",
    highlights:
      "Water-resistant micro-cement wall finish with subtle clouding and trowel movement for contemporary residences and commercial interiors.",
  },
  {
    id: "culture-concrete",
    code: "CAT-05",
    title: "Culture Concrete — Architectural Concrete Finishes",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    category: "concrete",
    categoryLabel: "Concrete & Microtopping",
    shadeSeries: "CC01 to CC12 · Concrete Block, Formwork, Bubble Wrap, Corten Steel, Classic, Stencil",
    applicationMethod: "Troweled mineral base with formwork stamping, tie-hole detailing & patina washes",
    substrates: "Exterior facades, double-height lobbies, RCC columns, feature walls",
    highlights:
      "Replicates raw cast-in-situ shuttering concrete and weathered Corten steel without formwork carpentry constraints.",
  },
  {
    id: "lcc-cladding",
    code: "CAT-06",
    title: "LCC — Linear Concrete Cladding (40 pp)",
    supplier: "LCC Linear Concrete Cladding",
    category: "concrete",
    categoryLabel: "Concrete & Microtopping",
    shadeSeries: "Fluted Concrete, Brick Cladding, Concrete Slat, Wabi-Sabi, Travertine, Frammento",
    applicationMethod: "Adhesive-bonded 4–6 mm handcrafted lightweight mineral oxide panels",
    substrates: "Plastered masonry, structural steel framing, marine ply backer",
    highlights:
      "Ultra-slim 4–6 mm handcrafted concrete panels colored throughout with natural mineral oxides for rapid, clean dry-cladding installation.",
  },
  {
    id: "iconic-walls",
    code: "CAT-07",
    title: "Iconic Walls — Sculpted 3D Wall Reliefs (25 pp)",
    supplier: "Iconic Walls / Luxture Romano",
    category: "relief",
    categoryLabel: "3D Relief & Cladding",
    shadeSeries: "Parallel Harmony, Desert Whisper, Wave Crest, Dune Harmony, Fluted Elegance, Ripple Grid",
    applicationMethod: "Precision-aligned modular panel bonding with seamless joint finishing",
    substrates: "Interior reception walls, headboard walls, double-height atriums, corridors",
    highlights:
      "Architectural sandstone and Venetian relief surfaces engineered to turn grazing architectural lighting into rhythmic shadow compositions.",
  },
  {
    id: "signature-3d",
    code: "CAT-08",
    title: "Signature 3D Architectural Panels",
    supplier: "Signature 3D by Luxture",
    category: "relief",
    categoryLabel: "3D Relief & Cladding",
    shadeSeries: "SG-31..33 · Agra Red, Mint White, Teak Wood, Beige, Charcoal Black, Grey, Terracotta, White",
    applicationMethod: "2×2 ft, 8×2 ft & 9.5×2 ft panels (12–55 mm relief depth) mechanically & adhesively fixed",
    substrates: "Interior & exterior feature walls, hotel ballrooms, commercial lounges",
    highlights:
      "Deep-relief sculptural panels up to 55 mm depth available across 8 natural stone and timber-inspired mineral palettes.",
  },
  {
    id: "luxrock",
    code: "CAT-09",
    title: "LUXROCK — Sprayable Multi-Color Granite Finish",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    category: "exterior",
    categoryLabel: "Exterior Stone & Spray",
    shadeSeries: "Satin Stone (LSS-101..114) & Mid Stone (LMS-201..222)",
    applicationMethod: "6-Step Groove Taping, Primer, Base Coat, Pneumatic Granite Spray & Silicone Top Coat",
    substrates: "High-rise residential towers, institutional facades, curved columns, cornices",
    highlights:
      "Authentic multi-colored quarried granite appearance at a fraction of stone cladding weight, eliminating falling-stone hazards on high-rises.",
  },
  {
    id: "luxstone",
    code: "CAT-10",
    title: "Luxstone — Heavy-Duty Natural Stone Coating",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    category: "exterior",
    categoryLabel: "Exterior Stone & Spray",
    shadeSeries: "38 Natural Stone Shades: LS-1101 to LS-1138",
    applicationMethod: "Spray or stainless-steel trowel over taped ashlar stone joint grid",
    substrates: "Exterior compound walls, podium facades, commercial towers, bungalows",
    highlights:
      "Crushed natural stone aggregate coating with exceptional weather, alkali, and UV resistance for long-cycle building envelopes.",
  },
  {
    id: "abstract-granules",
    code: "CAT-11",
    title: "Abstract — Natural Stone Granule & Marble Finishes",
    supplier: "Abstract by Luxture",
    category: "exterior",
    categoryLabel: "Exterior Stone & Spray",
    shadeSeries: "ABS 2601 to ABS 2624 (Granulati, Marbles & Granito with mica flakes)",
    applicationMethod: "Single-pass trowel application over alkali primer",
    substrates: "Exterior & interior masonry, villas, hospitality facades",
    highlights:
      "Breathable, anti-fungal natural marble and quartz granule finish enriched with subtle shell and mica reflections.",
  },
  {
    id: "flexi-clad",
    code: "CAT-12",
    title: "Flexi Clad — Flexible Modified-Clay Stone Veneer",
    supplier: "Flexi Clad Architectural Surfaces",
    category: "relief",
    categoryLabel: "3D Relief & Cladding",
    shadeSeries: "Travertine, Split Brick, Slate, Rammed Earth & Wood Grain (2–4 mm bendable sheets)",
    applicationMethod: "Tile-adhesive bonding directly onto flat or curved architectural substrates",
    substrates: "Curved columns, arches, exterior facades, rapid renovation walls",
    highlights:
      "Ultra-lightweight 2–4 mm flexible modified-clay sheets that wrap effortlessly around curved pillars and complex facade geometry.",
  },
  {
    id: "dekor-plast",
    code: "CAT-13",
    title: "Dekor Plast — Silk, Cotton & Cellulose Fiber Plaster",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    category: "plaster",
    categoryLabel: "Mineral & Lime Plasters",
    shadeSeries: "28 Tactile Shades: DP-101 to DP-128",
    applicationMethod: "Seamless acrylic float application (zero joints, spot-repairable)",
    substrates: "Bedrooms, executive lounges, home theatres, boutique hotels",
    highlights:
      "Provides natural thermal insulation and acoustic sound absorption with a warm, fabric-like tactile surface.",
  },
  {
    id: "stamp-concrete",
    code: "CAT-14",
    title: "Stamp Concrete — Monolithic Architectural Hardscapes",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    category: "concrete",
    categoryLabel: "Concrete & Microtopping",
    shadeSeries: "Ashlar Slate, Cobble Stone, Random Stone, European Fan, Wood Plank",
    applicationMethod: "Colour hardener broadcasting, release agent, polyurethane mat stamping & acrylic sealer",
    substrates: "Driveways, resort pathways, mall plazas, podium decks, pool surrounds",
    highlights:
      "Transforms poured-in-place concrete slabs into high-load architectural stone and timber paving.",
  },
  {
    id: "master-shade-card",
    code: "CAT-15",
    title: "Master Shade Card & Stone/Granite Physical Chip Index",
    supplier: "Luxture Surface Coatings Pvt. Ltd.",
    category: "exterior",
    categoryLabel: "Exterior Stone & Spray",
    shadeSeries: "LMSC-301..364 · Stone Finish SFA-1..27 · Granite Finish GFN-1..21 · Granitone GTN-1..8",
    applicationMethod: "Physical sample board & mock-up verification prior to site execution",
    substrates: "All interior & exterior architectural specifications",
    highlights:
      "64 architectural pigment tones and 56 physical crushed-stone/granite chip standards used by Profacciata for on-site sample sign-off.",
  },
] as const;

type ProjectRegionFilter = "all" | "west" | "north" | "hospitality" | "commercial";

interface ProjectReference {
  index: string;
  verbatimName: string;
  typology: string;
  region: Exclude<ProjectRegionFilter, "all">;
  secondaryCategory?: Exclude<ProjectRegionFilter, "all">;
  architecturalContext: string;
  surfaceScope: string;
  publicImage?: string;
  publicImageCaption?: string;
}

/**
 * Exact 14 client-supplied project names preserved verbatim, enriched with
 * publicly verified architectural context.
 */
const CLIENT_PROJECTS: readonly ProjectReference[] = [
  {
    index: "01",
    verbatimName: "Vogue Paradigm Builder — Santa Cruz West",
    typology: "Luxury Residential Tower",
    region: "west",
    architecturalContext:
      "Contemporary western-suburb residential development in Santa Cruz West, Mumbai, engineered for heavy coastal monsoon exposure.",
    surfaceScope: "Exterior weather-resilient mineral texture systems & podium lobby surfaces",
  },
  {
    index: "02",
    verbatimName: "GR One — G R Infra Projects, Gurugram",
    typology: "Corporate Headquarters Tower",
    region: "north",
    secondaryCategory: "commercial",
    architecturalContext:
      "Institutional corporate office landmark for G R Infraprojects in Gurugram featuring large-span commercial floorplates and daylight-oriented facades.",
    surfaceScope: "Architectural concrete finishes & executive core mineral wall systems",
  },
  {
    index: "03",
    verbatimName: "Plasser India — Karjan, Gujarat",
    typology: "Industrial & Manufacturing Campus",
    region: "west",
    secondaryCategory: "commercial",
    architecturalContext:
      "State-of-the-art green industrial facility and administrative complex for Plasser (India) Pvt. Ltd. in Karjan, Vadodara.",
    surfaceScope: "Heavy-duty exterior stone & protective mineral facade coatings",
    publicImage: "/assets/projects/plasser-india-karjan.jpg",
    publicImageCaption: "Plasser India manufacturing & administrative campus, Karjan, Gujarat (Public facility view)",
  },
  {
    index: "04",
    verbatimName: "Poonawala Hospital — Magarpatta/Hadapsar, Pune",
    typology: "Tertiary Healthcare Institution",
    region: "west",
    secondaryCategory: "hospitality",
    architecturalContext:
      "Multi-specialty healthcare campus in Hadapsar, Pune designed around hygienic, high-traffic public concourses and calm healing environments.",
    surfaceScope: "Low-VOC breathable mineral wall finishes & durable public-zone coatings",
  },
  {
    index: "05",
    verbatimName: "Ujjwal Bungalow — Model Town, Pune",
    typology: "Private Architectural Residence",
    region: "west",
    architecturalContext:
      "Bespoke independent residential bungalow in Pune featuring warm elevation massing and shaded garden verandahs.",
    surfaceScope: "Custom exterior travertine/stone finish & interior decorative plasters",
  },
  {
    index: "06",
    verbatimName: "Sikka Mall of Noida — Noida",
    typology: "Mixed-Use Retail & Commercial Landmark",
    region: "north",
    secondaryCategory: "commercial",
    architecturalContext:
      "High-visibility commercial, retail, and atrium development along the Noida Expressway corridor.",
    surfaceScope: "Public plaza, atrium feature walls & commercial facade coating package",
    publicImage: "/assets/projects/sikka-mall-noida.webp",
    publicImageCaption: "Sikka commercial & mixed-use development context, Noida (Public architectural view)",
  },
  {
    index: "07",
    verbatimName: "Worx Design — Dwarka Sector 6",
    typology: "Design Studio & Commercial Interior",
    region: "north",
    secondaryCategory: "commercial",
    architecturalContext:
      "Contemporary commercial studio space in Dwarka Sector 6, New Delhi showcasing tactile material surfaces under gallery lighting.",
    surfaceScope: "Interior microcement, architectural concrete & sculpted feature surfaces",
  },
  {
    index: "08",
    verbatimName: "Mayfair Breeze — Andheri West, Mumbai",
    typology: "Twin-Wing Residential Development",
    region: "west",
    architecturalContext:
      "14-storey twin-wing residential development by Mayfair Housing on Prashant Dawood Baug Road, Andheri West, Mumbai.",
    surfaceScope: "Monsoon-grade exterior facade textures & grand entrance lobby finishes",
  },
  {
    index: "09",
    verbatimName: "TCI Headquarters — Gurugram",
    typology: "Institutional Corporate Campus",
    region: "north",
    secondaryCategory: "commercial",
    architecturalContext:
      "Transport Corporation of India (TCI House) courtyard-oriented corporate headquarters in Sector 32 Institutional Area, Gurugram.",
    surfaceScope: "Courtyard facade mineral coatings & institutional interior wall systems",
  },
  {
    index: "10",
    verbatimName: "Desai's Residence — Camp, Dr Coyte Road, Pune",
    typology: "Private Heritage-District Residence",
    region: "west",
    architecturalContext:
      "Private residential commission on Dr Coyte Road in Camp, Pune combining heritage proportions with refined contemporary interiors.",
    surfaceScope: "Hand-troweled lime plaster, microtopping & bespoke interior textures",
  },
  {
    index: "11",
    verbatimName: "Lemonade Farm — Alibaug, Maharashtra",
    typology: "Coastal Luxury Villa Estate",
    region: "west",
    secondaryCategory: "hospitality",
    architecturalContext:
      "5-bedroom coastal retreat and pool villa near Kihim/Kamath Beach in Alibaug, exposed to saline sea breezes and tropical monsoons.",
    surfaceScope: "Breathable coastal lime plasters, pool-deck textures & seamless interior finishes",
  },
  {
    index: "12",
    verbatimName: "Marriott — Port Blair",
    typology: "Island Hospitality & Resort",
    region: "hospitality",
    architecturalContext:
      "Hospitality destination in Port Blair, Andaman & Nicobar Islands requiring marine-grade durability and warm tropical materiality.",
    surfaceScope: "Marine-grade exterior surface coatings & luxury guest-zone decorative finishes",
  },
  {
    index: "13",
    verbatimName: "Hotel Ramada — Jammu",
    typology: "Upscale Hospitality & Convention Retreat",
    region: "north",
    secondaryCategory: "hospitality",
    architecturalContext:
      "Ramada Plaza hospitality landmark set against the Himalayan foothills in Jammu/Vijaypur featuring 28-foot pillar-less ballrooms and sculpted facade lines.",
    surfaceScope: "Hospitality facade coating systems, ballroom & public concourse finishes",
    publicImage: "/assets/projects/hotel-ramada-jammu.jpg",
    publicImageCaption: "Hotel Ramada Plaza exterior facade architecture, Jammu (Public hospitality view)",
  },
  {
    index: "14",
    verbatimName: "Antalya Paradigm Builder — Oshiwara",
    typology: "High-Rise Mixed-Use & Residential Tower",
    region: "west",
    architecturalContext:
      "High-rise urban residential and podium development at 102 Downtown, Oshiwara, Mumbai.",
    surfaceScope: "High-rise exterior stone/mineral coatings & podium elevation finishes",
  },
] as const;

const STRUCTURED_DATA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "PROFACCIATA",
  slogan: "Your concept is our project, Concreting Relationship",
  description:
    "Specialist contractor and applicator of decorative interior and exterior surface coatings including mineral plasters, architectural concrete, microtopping floors, and 3D stone reliefs across India.",
  email: "profacciata@gmail.com",
  telephone: "+91-95094-45969",
  address: {
    "@type": "PostalAddress",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    addressCountry: "IN",
  },
  areaServed: [
    "New Delhi",
    "Gurugram",
    "Noida",
    "Mumbai",
    "Pune",
    "Alibaug",
    "Vadodara",
    "Jammu",
    "Port Blair",
  ],
});

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive 5-layer wall cutaway state
  const [activeLayerIdx, setActiveLayerIdx] = useState(3);

  // Interactive 3D Surface & Grazing Light Workbench state
  const [activePresetId, setActivePresetId] = useState<string>("travertino");
  const [lightAngle, setLightAngle] = useState<number>(35);
  const [cameraView, setCameraView] = useState<string>("22deg 76deg 22m");
  const [modelReady, setModelReady] = useState(false);

  // Interactive Supplier Systems filter & accordion state
  const [systemFilter, setSystemFilter] = useState<SystemCategory>("all");
  const [expandedSystemId, setExpandedSystemId] = useState<string>("master-catalogue");

  // Executed Project Register filter state
  const [projectFilter, setProjectFilter] = useState<ProjectRegionFilter>("all");

  // Interactive Specification Enquiry Desk state
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientRole, setClientRole] = useState("Architect / Interior Designer");
  const [selectedService, setSelectedService] = useState(
    "Lime & Heritage Plaster (Calce / Lime-N-Clay)",
  );
  const [selectedCatalogue, setSelectedCatalogue] = useState(
    "Luxture Master Catalogue / Lime-N-Clay",
  );
  const [projectLocation, setProjectLocation] = useState("");
  const [projectArea, setProjectArea] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [copiedBrief, setCopiedBrief] = useState(false);

  const activePreset =
    FINISH_PRESETS.find((preset) => preset.id === activePresetId) ?? FINISH_PRESETS[0];

  // Dynamically load @google/model-viewer on client
  useEffect(() => {
    void import("@google/model-viewer").catch((error: unknown) => {
      console.error("Interactive 3D surface monolith viewer failed to load:", error);
    });
  }, []);

  // Attach load listener to <model-viewer>
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const handleLoad = () => setModelReady(true);
    el.addEventListener("load", handleLoad);
    if (el.model?.materials?.length) {
      setModelReady(true);
    }
    return () => el.removeEventListener("load", handleLoad);
  }, []);

  // Synchronize 3D material PBR factors and grazing light angle with <model-viewer>
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const materials = el.model?.materials;
    if (materials && materials.length >= 2) {
      const primaryMat = materials.find((m) => m.name === "Material_Primary") ?? materials[0];
      const reliefMat = materials.find((m) => m.name === "Material_Relief") ?? materials[1];

      primaryMat?.pbrMetallicRoughness?.setBaseColorFactor(activePreset.primaryRgba);
      primaryMat?.pbrMetallicRoughness?.setRoughnessFactor(activePreset.primaryRoughness);
      reliefMat?.pbrMetallicRoughness?.setBaseColorFactor(activePreset.reliefRgba);
      reliefMat?.pbrMetallicRoughness?.setRoughnessFactor(activePreset.reliefRoughness);
    }

    // Map grazing light angle (15° raking dusk -> 75° high noon) to shadow intensity, softness & exposure
    const normalized = (lightAngle - 15) / 60; // 0.0 at 15°, 1.0 at 75°
    const shadowInt = Number((1.45 - normalized * 0.65).toFixed(2));
    const shadowSoft = Number((0.25 + normalized * 0.65).toFixed(2));
    const exp = Number((0.88 + normalized * 0.28).toFixed(2));

    el.setAttribute("shadow-intensity", String(shadowInt));
    el.setAttribute("shadow-softness", String(shadowSoft));
    el.setAttribute("exposure", String(exp));
  }, [activePreset, lightAngle, modelReady]);

  // Apply camera view bookmark
  function handleCameraPreset(orbit: string) {
    setCameraView(orbit);
    const el = viewerRef.current;
    if (el) {
      el.setAttribute("camera-orbit", orbit);
    }
  }

  // Pre-fill enquiry form from any Finish Card, 3D Preset, Supplier System, or Project Row
  function prefillSpecification(opts: {
    service?: string;
    catalogue?: string;
    note?: string;
  }) {
    if (opts.service) setSelectedService(opts.service);
    if (opts.catalogue) setSelectedCatalogue(opts.catalogue);
    if (opts.note) {
      setProjectDetails((prev) =>
        prev.includes(opts.note ?? "")
          ? prev
          : (prev ? prev + "\n" : "") + opts.note,
      );
    }
    const contactEl = document.getElementById("contact");
    contactEl?.scrollIntoView({ behavior: "smooth" });
  }

  function buildStructuredBriefText() {
    return [
      "PROFACCIATA — ARCHITECTURAL SURFACE SPECIFICATION BRIEF",
      "--------------------------------------------------------",
      `Client / Specifier: ${clientName || "Not specified"} (${clientRole})`,
      `Contact (Email / Phone): ${clientContact || "Not specified"}`,
      `Primary Finish Scope: ${selectedService}`,
      `Supplier Catalogue System: ${selectedCatalogue}`,
      `Project City / Location: ${projectLocation || "To be confirmed"}`,
      `Approximate Surface Area: ${projectArea || "To be measured"}`,
      "",
      "Project & Substrate Notes:",
      projectDetails || "Requesting technical consultation and physical sample board review.",
    ].join("\n");
  }

  function handleEnquirySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `Profacciata Surface Specification Enquiry — ${projectLocation || clientName || "New Project"}`;
    const body = buildStructuredBriefText();
    window.location.href =
      "mailto:profacciata@gmail.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  }

  function handleWhatsAppEnquiry() {
    const text = buildStructuredBriefText();
    window.open(
      "https://wa.me/919509445969?text=" + encodeURIComponent(text),
      "_blank",
      "noopener,noreferrer",
    );
  }

  function handleCopyBrief() {
    const text = buildStructuredBriefText();
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text).then(() => {
        setCopiedBrief(true);
        window.setTimeout(() => setCopiedBrief(false), 3000);
      });
    }
  }

  const filteredCatalogues =
    systemFilter === "all"
      ? SUPPLIER_CATALOGUES
      : SUPPLIER_CATALOGUES.filter((item) => item.category === systemFilter);

  const filteredProjects =
    projectFilter === "all"
      ? CLIENT_PROJECTS
      : CLIENT_PROJECTS.filter(
          (proj) =>
            proj.region === projectFilter || proj.secondaryCategory === projectFilter,
        );

  const activeStratum = WALL_STRATA[activeLayerIdx] ?? WALL_STRATA[3];

  return (
    <main className="pf-site" id="top">
      <StructuredData json={STRUCTURED_DATA_JSON} />

      {/* 00. ARCHITECTURAL DATUM HEADER WITH ORIGINAL SUPPLIED LOGO */}
      <header className="pf-header">
        <a
          className="pf-brand-link"
          href="#top"
          aria-label="PROFACCIATA — Your concept is our project, Concreting Relationship"
        >
          <img
            src="/assets/brand/Profacciata_Logo_Clean_White.jpg"
            alt="PROFACCIATA — Your concept is our project, Concreting Relationship"
            width={2056}
            height={658}
            className="pf-brand-logo"
          />
        </a>

        <nav className="pf-nav" aria-label="Primary architectural navigation">
          <a href="#approach">
            <span className="pf-nav-idx">01</span> Discipline
          </a>
          <a href="#surface-model">
            <span className="pf-nav-idx">02</span> 3D Relief Study
          </a>
          <a href="#finishes">
            <span className="pf-nav-idx">03</span> Finishes
          </a>
          <a href="#systems">
            <span className="pf-nav-idx">04</span> 15 Catalogues
          </a>
          <a href="#projects">
            <span className="pf-nav-idx">05</span> 14 Projects
          </a>
        </nav>

        <div className="pf-header-right">
          <a className="pf-header-cta" href="#contact">
            Specify a Surface <span aria-hidden="true">→</span>
          </a>
          <button
            type="button"
            className="pf-mobile-menu-btn"
            aria-expanded={mobileMenuOpen}
            aria-controls="pf-mobile-drawer"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? "Close ×" : "Index ☰"}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <nav
          id="pf-mobile-drawer"
          className="pf-mobile-drawer"
          aria-label="Mobile section navigation"
        >
          <a href="#approach" onClick={() => setMobileMenuOpen(false)}>
            <span>01</span> Applicator Discipline & 5-Layer Wall System
          </a>
          <a href="#surface-model" onClick={() => setMobileMenuOpen(false)}>
            <span>02</span> Interactive 3D Surface & Grazing-Light Workbench
          </a>
          <a href="#finishes" onClick={() => setMobileMenuOpen(false)}>
            <span>03</span> Curated Finish Portfolio & Master Shade Card
          </a>
          <a href="#systems" onClick={() => setMobileMenuOpen(false)}>
            <span>04</span> Supplier & Material Catalogue Schedule (15)
          </a>
          <a href="#projects" onClick={() => setMobileMenuOpen(false)}>
            <span>05</span> Executed Project Reference Register (14)
          </a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
            <span>06</span> Project Enquiry & Sample Board Desk
          </a>
        </nav>
      )}

      {/* 01. CINEMATIC MULTI-SCENE SCROLL-SCRUB FILM */}
      <section className="pf-hero" aria-label="Architectural surface film">
        <ScrollScrub
          className="pf-scroll-scrub"
          scenes={scrollScrubScenes}
          theme={scrollScrubTheme}
        />
        <div className="pf-hero-bottom-bar">
          <div className="pf-hero-meta">
            <span>SPECIALIST CONTRACTOR & APPLICATOR</span>
            <span className="pf-hero-sep">·</span>
            <span>INTERIOR & EXTERIOR MINERAL FINISHES</span>
          </div>
          <a className="pf-hero-skip" href="#approach">
            Skip Film to Technical Dossier ↓
          </a>
        </div>
      </section>

      {/* 02. CONTRACTOR DISCIPLINE & 5-LAYER WALL SYSTEM CUTAWAY */}
      <section className="pf-approach" id="approach" aria-labelledby="pf-approach-title">
        <div className="pf-approach-top">
          <div className="pf-approach-meta">
            <p className="pf-section-label">01 / Execution Authority & Role Clarity</p>
            <div className="pf-role-pill-group">
              <span className="pf-role-pill pf-role-pill--primary">
                PROFACCIATA: Specialist Contractor & Site Applicator
              </span>
              <span className="pf-role-pill">
                MATERIAL PROVIDERS: Luxture · LCC · Iconic Walls · Signature 3D · Flexi Clad
              </span>
            </div>
          </div>

          <div className="pf-approach-headline">
            <h2 id="pf-approach-title">
              A luxury finish is only as permanent as the five layers beneath it.
            </h2>
          </div>

          <div className="pf-approach-lead">
            <p>
              Profacciata is a specialist surface-coatings contracting and application
              practice. We partner with architects, interior designers, developers, and
              project engineers across India to translate decorative mineral specifications
              into enduring built architecture.
            </p>
            <p>
              Rather than acting as a single-factory manufacturer, we source certified
              mineral plasters, microtoppings, architectural concrete, and 3D stone reliefs
              from premier material providers—including{" "}
              <strong>Luxture Surface Coatings Pvt. Ltd.</strong>,{" "}
              <strong>LCC Linear Concrete Cladding</strong>, <strong>Iconic Walls</strong>,{" "}
              <strong>Signature 3D</strong>, and <strong>Flexi Clad</strong>—and execute
              the complete multi-coat system on site.
            </p>
          </div>
        </div>

        <div className="pf-strata-workbench">
          <div className="pf-strata-visual">
            <div className="pf-strata-image-frame">
              <img
                src="/assets/wall-cross-section.jpg"
                alt="Five-layer architectural wall coating build-up from substrate to protective sealer"
                loading="lazy"
              />
              <div className="pf-strata-badge">
                <span>ARCHITECTURAL STRATA CUTAWAY</span>
                <strong>Active Layer {activeStratum.step} / 05</strong>
              </div>
            </div>

            <div className="pf-strata-active-card" aria-live="polite">
              <div className="pf-strata-active-header">
                <span className="pf-mono-tag">STRATUM {activeStratum.step}</span>
                <span className="pf-mono-spec">{activeStratum.spec}</span>
              </div>
              <h3>{activeStratum.name}</h3>
              <p>{activeStratum.detail}</p>
              <div className="pf-strata-tools">
                <strong>Site Instrumentation & Tooling:</strong> {activeStratum.tools}
              </div>
            </div>
          </div>

          <div className="pf-strata-selector" role="tablist" aria-label="Wall coating layers">
            <p className="pf-strata-selector-title">
              Select a stratum to inspect Profacciata&apos;s on-site execution protocol:
            </p>
            {WALL_STRATA.map((layer, idx) => {
              const isSelected = idx === activeLayerIdx;
              return (
                <button
                  key={layer.step}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={
                    "pf-strata-btn" + (isSelected ? " pf-strata-btn--active" : "")
                  }
                  onClick={() => setActiveLayerIdx(idx)}
                >
                  <span className="pf-strata-btn-num">{layer.step}</span>
                  <span className="pf-strata-btn-body">
                    <strong>{layer.name}</strong>
                    <small>{layer.spec}</small>
                  </span>
                  <span className="pf-strata-btn-ind" aria-hidden="true">
                    {isSelected ? "●" : "○"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 03. INTERACTIVE 3D SURFACE & GRAZING-LIGHT WORKBENCH */}
      <section
        className="pf-3d-explorer"
        id="surface-model"
        aria-labelledby="pf-3d-title"
      >
        <div className="pf-3d-header">
          <div>
            <p className="pf-section-label pf-section-label--light">
              02 / Interactive 3D Material & Raking-Light Workbench
            </p>
            <h2 id="pf-3d-title">Inspect relief, finish & grazing shadow in real time.</h2>
          </div>
          <p className="pf-3d-header-lead">
            Switch between four catalogue-backed surface families and sweep the grazing
            light angle from <strong>15° raking dusk</strong> to{" "}
            <strong>75° gallery daylight</strong> to observe how fluted 3D reliefs and
            stepped mineral courses hold shadow.
          </p>
        </div>

        <div className="pf-3d-grid">
          <div className="pf-model-stage">
            <model-viewer
              ref={viewerRef}
              className="pf-model-viewer"
              src="/assets/world/facade-study.glb"
              alt="Interactive 3D architectural surface monolith combining stepped mineral plaster courses, 24-flute sculpted sandstone relief bay, dark basalt plinth, and anodized bronze reveals"
              poster="/assets/world/monolith-poster.png"
              camera-controls
              auto-rotate
              auto-rotate-delay="3500"
              rotation-per-second="4deg"
              camera-orbit={cameraView}
              camera-target="0.4m 0.4m 0.2m"
              field-of-view="32deg"
              min-camera-orbit="auto 25deg 8m"
              max-camera-orbit="auto 88deg 26m"
              shadow-intensity="1.22"
              shadow-softness="0.46"
              exposure="0.98"
              environment-image="neutral"
              touch-action="pan-y"
            />

            <div className="pf-model-top-hud">
              <span className="pf-hud-chip">
                ACTIVE SYSTEM: <strong>{activePreset.code}</strong>
              </span>
              <span className="pf-hud-chip">
                GRAZING ANGLE: <strong>{lightAngle}°</strong>
              </span>
            </div>

            <div className="pf-model-camera-bar" role="group" aria-label="Camera angle presets">
              <button
                type="button"
                className={
                  "pf-cam-btn" +
                  (cameraView === "22deg 76deg 22m" ? " pf-cam-btn--active" : "")
                }
                onClick={() => handleCameraPreset("22deg 76deg 22m")}
              >
                Oblique Monolith
              </button>
              <button
                type="button"
                className={
                  "pf-cam-btn" +
                  (cameraView === "4deg 80deg 14.5m" ? " pf-cam-btn--active" : "")
                }
                onClick={() => handleCameraPreset("4deg 80deg 14.5m")}
              >
                Macro 3D Fluted Relief
              </button>
              <button
                type="button"
                className={
                  "pf-cam-btn" +
                  (cameraView === "-28deg 74deg 20m" ? " pf-cam-btn--active" : "")
                }
                onClick={() => handleCameraPreset("-28deg 74deg 20m")}
              >
                Coursing & Bronze Louvers
              </button>
            </div>

            <span className="pf-model-hint">
              Drag to orbit 3D monolith · Scroll or pinch to inspect surface relief
            </span>
          </div>

          <div className="pf-3d-console">
            <div className="pf-console-block">
              <span className="pf-console-label">
                STEP A · SELECT CATALOGUE FINISH PRESET
              </span>
              <div className="pf-preset-list" role="radiogroup" aria-label="3D Finish System">
                {FINISH_PRESETS.map((preset) => {
                  const active = preset.id === activePreset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={"pf-preset-btn" + (active ? " pf-preset-btn--active" : "")}
                      onClick={() => setActivePresetId(preset.id)}
                    >
                      <span className={"pf-swatch " + preset.swatchClass} aria-hidden="true" />
                      <span className="pf-preset-btn-copy">
                        <small>{preset.code}</small>
                        <strong>{preset.name}</strong>
                        <span>Supplier: {preset.supplier}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pf-console-block">
              <div className="pf-slider-header">
                <label htmlFor="pf-light-slider" className="pf-console-label">
                  STEP B · GRAZING LIGHT INCIDENCE ANGLE
                </label>
                <span className="pf-slider-readout">{lightAngle}° Incidence</span>
              </div>
              <input
                id="pf-light-slider"
                type="range"
                min={15}
                max={75}
                step={5}
                value={lightAngle}
                onChange={(e) => setLightAngle(Number(e.target.value))}
                className="pf-light-range"
              />
              <div className="pf-light-quick-row">
                {[
                  { deg: 15, label: "15° Raking Dusk" },
                  { deg: 35, label: "35° Oblique Relief" },
                  { deg: 55, label: "55° Gallery" },
                  { deg: 75, label: "75° High Noon" },
                ].map((item) => (
                  <button
                    key={item.deg}
                    type="button"
                    className={
                      "pf-light-chip" +
                      (lightAngle === item.deg ? " pf-light-chip--active" : "")
                    }
                    onClick={() => setLightAngle(item.deg)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pf-console-spec-card">
              <div className="pf-console-spec-row">
                <span>Catalogue Source</span>
                <strong>{activePreset.catalogueRef}</strong>
              </div>
              <div className="pf-console-spec-row">
                <span>Recommended Zones</span>
                <strong>{activePreset.applicationZones}</strong>
              </div>
              <p className="pf-console-spec-summary">{activePreset.summary}</p>
              <button
                type="button"
                className="pf-console-cta"
                onClick={() =>
                  prefillSpecification({
                    service: activePreset.name,
                    catalogue: `${activePreset.catalogueRef} (${activePreset.code})`,
                    note: `Selected from 3D Surface Workbench: ${activePreset.name} (${activePreset.code}) tested at ${lightAngle}° grazing light.`,
                  })
                }
              >
                Specify {activePreset.code} for My Project →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 04. CURATED FINISH PORTFOLIO & PHYSICAL MASTER SHADE CARD */}
      <section className="pf-finishes" id="finishes" aria-labelledby="pf-finishes-title">
        <div className="pf-section-heading">
          <p className="pf-section-label">03 / Curated Finish Families</p>
          <h2 id="pf-finishes-title">Tactile surfaces engineered for Indian architecture.</h2>
          <p className="pf-section-intro">
            Explore the six core interior and exterior finish disciplines executed by
            Profacciata. Every finish family is backed by physical manufacturer shade
            cards and on-site mock-up sampling prior to full-scale execution.
          </p>
        </div>

        <div className="pf-finish-grid">
          {FINISH_PORTFOLIO.map((finish) => (
            <article
              className={"pf-finish-card " + finish.className}
              key={finish.index}
            >
              <div className="pf-finish-image">
                <img src={finish.image} alt={finish.alt} loading="lazy" />
                <span className="pf-finish-badge">{finish.index}</span>
                <span className="pf-finish-zone-tag">{finish.zone}</span>
              </div>
              <div className="pf-finish-copy">
                <div className="pf-finish-meta">
                  <span className="pf-finish-supplier">{finish.supplier}</span>
                  <span className="pf-finish-codes">{finish.codes}</span>
                </div>
                <h3>{finish.title}</h3>
                <p>{finish.summary}</p>
                <button
                  type="button"
                  className="pf-finish-select-btn"
                  onClick={() =>
                    prefillSpecification({
                      service: finish.serviceValue,
                      catalogue: finish.supplier,
                      note: `Requesting sample boards and quotation for ${finish.title} (${finish.codes}).`,
                    })
                  }
                >
                  Specify Finish & Request Sample Board →
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* PHYSICAL CATALOGUE & SHADE CARD EVIDENCE STRIP */}
        <div className="pf-shade-evidence">
          <div className="pf-shade-evidence-copy">
            <p className="pf-section-label">Physical Shade Card & Panel Standards</p>
            <h3>Verified against physical mineral chips before site application.</h3>
            <p>
              Screen renders never replace physical aggregate inspection. Profacciata
              presents official manufacturer shade cards—including the{" "}
              <strong>64-shade Luxture Master Shade Card (LMSC-301..364)</strong>,{" "}
              <strong>Crushed Stone & Granite Finish Cards (SFA-1..27 / GFN-1..21)</strong>,
              and <strong>Signature 3D Relief Panels (SG-31..33)</strong>—and prepares
              site-specific sample boards for architect sign-off.
            </p>
            <button
              type="button"
              className="pf-button pf-button-primary"
              onClick={() =>
                prefillSpecification({
                  service: "Physical Shade Card & On-Site Sample Mock-Up",
                  catalogue: "Luxture Master Shade Card (LMSC / SFA / GFN) & Signature 3D",
                  note: "Please arrange physical shade card presentation and sample boards for review.",
                })
              }
            >
              Request Physical Shade Card Presentation →
            </button>
          </div>

          <div className="pf-shade-evidence-cards">
            <figure className="pf-evidence-figure">
              <img
                src="/assets/texture-luxture-card.png"
                alt="Physical Master Shade Card showing Stone Finish SFA-4 to SFA-22, Granite Finish GFN-2 to GFN-21, and Granules 21-001 to 21-017"
                loading="lazy"
              />
              <figcaption>
                <strong>Physical Stone & Granite Shade Card</strong>
                <span>SFA-1..27 · GFN-1..21 · Granules 21-001..017</span>
              </figcaption>
            </figure>

            <figure className="pf-evidence-figure">
              <img
                src="/assets/texture-signature-3d.png"
                alt="Signature 3D New Arrivals catalogue sheet showing sculpted relief panels SG 31, SG 32, and SG 33"
                loading="lazy"
              />
              <figcaption>
                <strong>Signature 3D Architectural Reliefs</strong>
                <span>500 × 500 mm / 25 mm Relief Depth · SG-31 to SG-33</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 05. SUPPLIER & MATERIAL SYSTEMS SCHEDULE (15 CATALOGUES) */}
      <section
        className="pf-material-reference"
        id="systems"
        aria-labelledby="pf-material-reference-title"
      >
        <div className="pf-material-reference-header">
          <div>
            <p className="pf-section-label">04 / Supplier & Material Systems Matrix</p>
            <h2 id="pf-material-reference-title">
              15 verified manufacturer catalogues. Executed under one roof.
            </h2>
          </div>
          <p className="pf-material-reference-intro">
            All product trademarks—including <strong>Luxture</strong> (
            <em>Luxture Surface Coatings Pvt. Ltd.</em>), <strong>LCC</strong>,{" "}
            <strong>Iconic Walls</strong>, <strong>Signature 3D</strong>, and{" "}
            <strong>Flexi Clad</strong>—belong to their respective material manufacturers.
            Profacciata sources these systems and executes the complete substrate-to-sealer
            application on site.
          </p>
        </div>

        <div className="pf-filter-bar" role="tablist" aria-label="Filter supplier catalogues">
          {(
            [
              ["all", "All 15 Catalogues"],
              ["plaster", "Mineral & Lime Plasters (4)"],
              ["concrete", "Concrete & Microtopping (5)"],
              ["exterior", "Exterior Stone & Spray (4)"],
              ["relief", "3D Relief & Cladding (3)"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={systemFilter === key}
              className={
                "pf-filter-pill" + (systemFilter === key ? " pf-filter-pill--active" : "")
              }
              onClick={() => setSystemFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pf-catalogue-accordion">
          {filteredCatalogues.map((item) => {
            const isExpanded = expandedSystemId === item.id;
            return (
              <div
                key={item.id}
                className={
                  "pf-catalogue-row" + (isExpanded ? " pf-catalogue-row--open" : "")
                }
              >
                <button
                  type="button"
                  className="pf-catalogue-trigger"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedSystemId(isExpanded ? "" : item.id)
                  }
                >
                  <span className="pf-catalogue-code">{item.code}</span>
                  <span className="pf-catalogue-main">
                    <strong>{item.title}</strong>
                    <small>{item.supplier}</small>
                  </span>
                  <span className="pf-catalogue-cat">{item.categoryLabel}</span>
                  <span className="pf-catalogue-toggle" aria-hidden="true">
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pf-catalogue-details">
                    <div className="pf-catalogue-spec-grid">
                      <div>
                        <span>Shade Codes & Variants</span>
                        <strong>{item.shadeSeries}</strong>
                      </div>
                      <div>
                        <span>Profacciata Application Method</span>
                        <strong>{item.applicationMethod}</strong>
                      </div>
                      <div>
                        <span>Compatible Substrates</span>
                        <strong>{item.substrates}</strong>
                      </div>
                    </div>
                    <p className="pf-catalogue-summary">{item.highlights}</p>
                    <button
                      type="button"
                      className="pf-catalogue-action"
                      onClick={() =>
                        prefillSpecification({
                          service: item.title,
                          catalogue: `${item.title} — ${item.supplier}`,
                          note: `Enquiring about ${item.title} (${item.shadeSeries}).`,
                        })
                      }
                    >
                      Pre-fill Project Enquiry with {item.title} →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 06. EXECUTED PROJECT REFERENCE REGISTER (14 VERBATIM REFERENCES) */}
      <section className="pf-projects" id="projects" aria-labelledby="pf-projects-title">
        <div className="pf-projects-heading">
          <div>
            <p className="pf-section-label pf-section-label--light">
              05 / Executed Project Reference Register
            </p>
            <h2 id="pf-projects-title">14 architectural landmarks & private commissions.</h2>
          </div>
          <p className="pf-projects-lead">
            Selected client-supplied project references across Mumbai, Gurugram, Noida,
            Pune, Alibaug, Gujarat, Jammu, and Port Blair—spanning high-rise residential
            towers, corporate headquarters, tertiary hospitals, industrial plants, luxury
            villas, and hotels.
          </p>
        </div>

        {/* PUBLIC ARCHITECTURAL CONTEXT SPOTLIGHT */}
        <div className="pf-project-spotlight-grid">
          {CLIENT_PROJECTS.filter((p) => Boolean(p.publicImage)).map((proj) => (
            <article className="pf-spotlight-card" key={proj.index}>
              <div className="pf-spotlight-img-wrap">
                <img
                  src={proj.publicImage}
                  alt={proj.publicImageCaption ?? proj.verbatimName}
                  loading="lazy"
                />
                <span className="pf-spotlight-idx">REF {proj.index}</span>
              </div>
              <div className="pf-spotlight-body">
                <span className="pf-spotlight-type">{proj.typology}</span>
                <h3>{proj.verbatimName}</h3>
                <p>{proj.architecturalContext}</p>
                <small className="pf-spotlight-scope">
                  <strong>Surface Discipline:</strong> {proj.surfaceScope}
                </small>
              </div>
            </article>
          ))}
        </div>

        <div
          className="pf-filter-bar pf-filter-bar--dark"
          role="tablist"
          aria-label="Filter project references by region or sector"
        >
          {(
            [
              ["all", "All 14 References"],
              ["west", "Mumbai, Pune, Alibaug & Gujarat (8)"],
              ["north", "Gurugram, Noida, Delhi & Jammu (5)"],
              ["hospitality", "Hospitality, Villas & Healthcare (4)"],
              ["commercial", "Corporate HQ, Retail & Industrial (5)"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={projectFilter === key}
              className={
                "pf-filter-pill pf-filter-pill--dark" +
                (projectFilter === key ? " pf-filter-pill--dark-active" : "")
              }
              onClick={() => setProjectFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pf-project-list">
          {filteredProjects.map((proj) => (
            <article className="pf-project-row" key={proj.index}>
              <div className="pf-project-row-top">
                <span className="pf-project-no">{proj.index}</span>
                <span className="pf-project-tag">{proj.typology}</span>
              </div>
              <h3>{proj.verbatimName}</h3>
              <p className="pf-project-context">{proj.architecturalContext}</p>
              <div className="pf-project-footer">
                <span className="pf-project-scope">{proj.surfaceScope}</span>
                <button
                  type="button"
                  className="pf-project-enquire-btn"
                  onClick={() =>
                    prefillSpecification({
                      note: `Referencing comparable project scope to ${proj.verbatimName} (${proj.typology}).`,
                    })
                  }
                >
                  Enquire Similar Scope →
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="pf-projects-disclaimer">
          Project names are presented verbatim from Profacciata&apos;s client reference
          register. Public architectural context photographs above illustrate the
          referenced developments and do not claim exclusive copyright over third-party
          building photography.
        </p>
      </section>

      {/* 07. ARCHITECTURAL SPECIFICATION & SITE CONSULTATION DESK */}
      <section className="pf-contact" id="contact" aria-labelledby="pf-contact-title">
        <div className="pf-contact-heading">
          <p className="pf-section-label">06 / Specification & Consultation Desk</p>
          <h2 id="pf-contact-title">Discuss your surface, substrate & sample boards.</h2>
          <p>
            Share your project drawings, elevation schedule, or approximate wall/floor
            area. Prepare a structured specification brief below to open directly in your
            email client, send via WhatsApp, or copy to clipboard.
          </p>

          <div className="pf-contact-cards">
            <a className="pf-contact-card" href="mailto:profacciata@gmail.com">
              <span className="pf-contact-card-label">DIRECT SPECIFICATION EMAIL</span>
              <strong>profacciata@gmail.com</strong>
              <span className="pf-contact-card-action">Compose Email ↗</span>
            </a>

            <a className="pf-contact-card" href="tel:+919509445969">
              <span className="pf-contact-card-label">DIRECT PHONE & SITE CONSULTATION</span>
              <strong>+91 95094 45969</strong>
              <span className="pf-contact-card-action">Call Principal Desk ↗</span>
            </a>

            <div className="pf-contact-card pf-contact-card--static">
              <span className="pf-contact-card-label">PRACTICE & REGISTRATION</span>
              <strong>New Delhi Principal Office · Pan-India Execution</strong>
              <span className="pf-contact-card-sub">
                GST Registered Specialist Surface-Coatings Contractor (Proprietor: Harsh
                Singhal)
              </span>
            </div>
          </div>
        </div>

        <form className="pf-enquiry-form" onSubmit={handleEnquirySubmit}>
          <div className="pf-form-header">
            <span className="pf-mono-tag">ARCHITECTURAL BRIEF BUILDER</span>
            <span>No server tracking · Direct to Profacciata</span>
          </div>

          <label>
            Your Name / Studio Name *
            <input
              name="name"
              autoComplete="name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., Ar. Rohan Mehta / Studio Axis"
              required
            />
          </label>

          <label>
            Email or Mobile Number *
            <input
              name="contact"
              autoComplete="email"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              placeholder="name@studio.com or +91 98..."
              required
            />
          </label>

          <label>
            Your Role
            <select
              name="role"
              value={clientRole}
              onChange={(e) => setClientRole(e.target.value)}
            >
              <option>Architect / Interior Designer</option>
              <option>Developer / Builder</option>
              <option>Private Residence / Villa Owner</option>
              <option>Hospitality / Corporate Project Manager</option>
              <option>Turnkey General Contractor</option>
            </select>
          </label>

          <label>
            Primary Surface Scope
            <select
              name="service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option>Lime & Heritage Plaster (Calce / Lime-N-Clay)</option>
              <option>Architectural Concrete & LCC Cladding</option>
              <option>Cemento 2K Flooring & DecorCem Microcement</option>
              <option>Sculpted 3D Relief Panels (Iconic Walls / Signature 3D)</option>
              <option>Exterior Stone Coating (Luxrock / Luxstone / Abstract)</option>
              <option>Dekor Plast / Stamped Concrete Hardscape</option>
              <option>Physical Shade Card & On-Site Sample Mock-Up</option>
              <option>Complete Interior + Exterior Package</option>
            </select>
          </label>

          <label>
            Preferred Supplier System / Catalogue
            <input
              name="catalogue"
              value={selectedCatalogue}
              onChange={(e) => setSelectedCatalogue(e.target.value)}
              placeholder="e.g., Luxture Master / Cemento 2K / Iconic Walls"
            />
          </label>

          <label>
            Project City & Location
            <input
              name="location"
              autoComplete="address-level2"
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
              placeholder="e.g., Gurugram / Mumbai / Pune / New Delhi"
            />
          </label>

          <label className="pf-form-wide">
            Approximate Surface Area (sq. ft.) & Timeline
            <input
              name="area"
              value={projectArea}
              onChange={(e) => setProjectArea(e.target.value)}
              placeholder="e.g., 4,500 sq. ft. exterior facade · Mock-up needed next month"
            />
          </label>

          <label className="pf-form-wide">
            Project & Substrate Details *
            <textarea
              name="details"
              rows={4}
              value={projectDetails}
              onChange={(e) => setProjectDetails(e.target.value)}
              placeholder="Describe the building type, substrate condition (fresh plaster, RCC, existing tile), shade preferences, or sample board requirements..."
              required
            />
          </label>

          <div className="pf-form-actions pf-form-wide">
            <button className="pf-submit" type="submit">
              Prepare Email Brief <span aria-hidden="true">↗</span>
            </button>
            <button
              className="pf-submit pf-submit--whatsapp"
              type="button"
              onClick={handleWhatsAppEnquiry}
            >
              Send via WhatsApp <span aria-hidden="true">↗</span>
            </button>
            <button
              className="pf-submit pf-submit--copy"
              type="button"
              onClick={handleCopyBrief}
            >
              {copiedBrief ? "Brief Copied to Clipboard ✓" : "Copy Brief Text"}
            </button>
          </div>

          <p className="pf-form-note">
            Submitting opens your default email app or WhatsApp with your structured
            specification pre-filled. No personal data is stored on this website.
          </p>
        </form>
      </section>

      {/* 08. ARCHITECTURAL BRAND FOOTER WITH EXACT ORIGINAL SUPPLIED LOGO */}
      <footer className="pf-footer">
        <div className="pf-footer-brand-card">
          <img
            src="/assets/brand/Profacciata_Logo_Clean_White.jpg"
            alt="PROFACCIATA — Your concept is our project, Concreting Relationship"
            width={2056}
            height={658}
            className="pf-footer-logo"
          />
        </div>

        <div className="pf-footer-info">
          <p className="pf-footer-title">
            PROFACCIATA — Specialist Interior & Exterior Surface-Coatings Contractor
          </p>
          <p className="pf-footer-disclaimer">
            Material catalogues and product names referenced on this site—including
            Luxture Surface Coatings Pvt. Ltd., LCC Linear Concrete Cladding, Iconic Walls,
            Signature 3D, and Flexi Clad—are trademarks of their respective manufacturers.
            Profacciata operates as an independent specialist applicator and contracting
            partner.
          </p>
        </div>

        <div className="pf-footer-links">
          <a href="#surface-model">3D Workbench</a>
          <a href="#finishes">Finishes</a>
          <a href="#systems">15 Catalogues</a>
          <a href="#projects">14 Projects</a>
          <a href="#top" className="pf-back-top">
            Back to top ↑
          </a>
        </div>
      </footer>
    </main>
  );
}

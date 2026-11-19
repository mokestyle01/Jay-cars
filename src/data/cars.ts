import type { StaticImageData } from "next/image";
import sedan from "@/assets/car-sedan.jpg";
import suv from "@/assets/car-suv.jpg";
import sports from "@/assets/car-sports.jpg";
import electric from "@/assets/car-electric.jpg";
import luxury from "@/assets/car-luxury.jpg";
import flagship from "@/assets/flagship.jpg";

export type Car = {
  id: string;
  name: string;
  year: number;
  price: string;
  fuel: string;
  transmission: string;
  category: string;
  power: string;
  acceleration: string;
  topSpeed: string;
  image: StaticImageData;
};

export const cars: Car[] = [
  {
    id: "aurora-gt",
    name: "JAY Aurora GT",
    year: 2026,
    price: "$128,900",
    fuel: "Petrol",
    transmission: "8-speed automatic",
    category: "Sports",
    power: "612 hp",
    acceleration: "3.2s 0-60",
    topSpeed: "196 mph",
    image: sports,
  },
  {
    id: "meridian-ev",
    name: "JAY Meridian EV",
    year: 2026,
    price: "$94,500",
    fuel: "Electric",
    transmission: "Single-speed",
    category: "Sedan",
    power: "480 hp",
    acceleration: "3.9s 0-60",
    topSpeed: "155 mph",
    image: sedan,
  },
  {
    id: "terra-x",
    name: "JAY Terra X",
    year: 2025,
    price: "$81,200",
    fuel: "Hybrid",
    transmission: "9-speed automatic",
    category: "SUV",
    power: "395 hp",
    acceleration: "5.4s 0-60",
    topSpeed: "144 mph",
    image: suv,
  },
  {
    id: "pulse-e",
    name: "JAY Pulse E",
    year: 2026,
    price: "$56,400",
    fuel: "Electric",
    transmission: "Single-speed",
    category: "Electric",
    power: "340 hp",
    acceleration: "4.8s 0-60",
    topSpeed: "137 mph",
    image: electric,
  },
  {
    id: "regent-l",
    name: "JAY Regent L",
    year: 2026,
    price: "$212,000",
    fuel: "Petrol",
    transmission: "9-speed automatic",
    category: "Luxury",
    power: "621 hp",
    acceleration: "4.4s 0-60",
    topSpeed: "155 mph",
    image: luxury,
  },
];

export const flagshipCar = {
  name: "JAY Sovereign Coupé",
  tagline: "The flagship grand tourer",
  price: "$264,500",
  image: flagship,
  specs: [
    { label: "Power", value: "745 hp" },
    { label: "0–60 mph", value: "2.9 s" },
    { label: "Top speed", value: "211 mph" },
    { label: "Drivetrain", value: "All-wheel drive" },
    { label: "Torque", value: "664 lb-ft" },
    { label: "Range", value: "412 mi" },
  ],
};

export function getLocalCarImage(name: string): string | undefined {
  const car = cars.find((item) => item.name === name);
  if (car) return car.image.src;
  if (name === flagshipCar.name) return flagshipCar.image.src;
  return undefined;
}

export const requestableVehicles = [
  ...cars.map(({ id, name }) => ({ id, name })),
  { id: "sovereign-coupe", name: flagshipCar.name },
];

export const categories = [
  { name: "Sports", count: 18, blurb: "Track-bred performance" },
  { name: "SUV", count: 24, blurb: "Space without compromise" },
  { name: "Sedan", count: 31, blurb: "Everyday refinement" },
  { name: "Electric", count: 16, blurb: "Silent, instant torque" },
  { name: "Luxury", count: 12, blurb: "Chauffeur-grade comfort" },
];

export const whyJay = [
  {
    title: "Premium selection",
    body: "Every model is hand-picked from marques we would drive ourselves.",
  },
  {
    title: "Certified vehicles",
    body: "A 210-point inspection and full history report on every listing.",
  },
  {
    title: "Flexible financing",
    body: "Lease, finance or subscribe with terms built around your plans.",
  },
  {
    title: "Professional support",
    body: "A dedicated specialist from first enquiry to handover day.",
  },
];

export const testimonials = [
  {
    name: "Amara Okafor",
    role: "Aurora GT owner",
    quote:
      "The whole handover felt like a private viewing. No pressure, no paperwork theatre — just the car I wanted.",
  },
  {
    name: "Daniel Reyes",
    role: "Terra X owner",
    quote: "They found a spec I had been chasing for eight months and had it delivered in a week.",
  },
  {
    name: "Sofia Lindqvist",
    role: "Meridian EV owner",
    quote:
      "Financing was explained in plain language. I knew exactly what I was signing before I signed it.",
  },
];

export const performanceHighlights = [
  { label: "Models in stock", value: "101" },
  { label: "Average delivery", value: "9 days" },
  { label: "Owner rating", value: "4.9/5" },
  { label: "Cities served", value: "27" },
];

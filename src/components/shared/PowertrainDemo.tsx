"use client";

import { useEffect, useState, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  CarFront,
  Cog,
  Fuel,
  Pause,
  Play,
  RotateCcw,
  Zap,
  type LucideProps,
} from "lucide-react";
import { cars, type Car } from "@/data/cars";

type Version = "v1" | "v2";
type FlowMode = "power" | "recovery";
type FlowStep = {
  label: string;
  detail: string;
  Icon: ComponentType<LucideProps>;
};

const cinematicCars = ["aurora-gt", "meridian-ev", "terra-x"];

function getFlowSteps(car: Car, mode: FlowMode): FlowStep[] {
  if (mode === "recovery") {
    return [
      { label: "Wheels", detail: "Motion turns the wheels as the car slows.", Icon: CarFront },
      {
        label: "Electric motor",
        detail: "The motor acts as a generator during deceleration.",
        Icon: RotateCcw,
      },
      {
        label: "Battery",
        detail: "Recovered electrical energy is sent back to the battery.",
        Icon: BatteryCharging,
      },
    ];
  }

  if (car.fuel === "Electric") {
    return [
      {
        label: "Battery",
        detail: "Stored electrical energy leaves the battery.",
        Icon: BatteryCharging,
      },
      {
        label: "Electric motor",
        detail: "The motor turns electrical energy into motion.",
        Icon: Zap,
      },
      {
        label: car.transmission,
        detail: "A single-speed drive delivers power smoothly.",
        Icon: Cog,
      },
      { label: "Wheels", detail: "Power reaches the road through the wheels.", Icon: CarFront },
    ];
  }

  if (car.fuel === "Hybrid") {
    return [
      {
        label: "Fuel + battery",
        detail: "Fuel and stored electrical energy can both supply the system.",
        Icon: BatteryCharging,
      },
      {
        label: "Hybrid drive",
        detail: "The electric motor and combustion engine contribute drive power.",
        Icon: Zap,
      },
      {
        label: car.transmission,
        detail: "The transmission adapts power delivery to the drive.",
        Icon: Cog,
      },
      { label: "Wheels", detail: "Combined drive power reaches the road.", Icon: CarFront },
    ];
  }

  return [
    { label: "Fuel", detail: "Fuel supplies energy to the combustion engine.", Icon: Fuel },
    {
      label: "Engine",
      detail: "Combustion creates the mechanical power that moves the car.",
      Icon: Cog,
    },
    {
      label: car.transmission,
      detail: "The transmission transfers engine power to the drive wheels.",
      Icon: Cog,
    },
    { label: "Wheels", detail: "Power reaches the road through the wheels.", Icon: CarFront },
  ];
}

export function PowertrainDemo({ version }: { version: Version }) {
  const [selectedId, setSelectedId] = useState(cars[0]!.id);
  const [mode, setMode] = useState<FlowMode>("power");
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const car = cars.find((item) => item.id === selectedId) ?? cars[0]!;
  const supportsRecovery = car.fuel === "Electric" || car.fuel === "Hybrid";
  const steps = getFlowSteps(car, mode);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setActiveStep((current) => {
        if (current + 1 >= steps.length) {
          setMode("power");
          setSelectedId((currentId) => {
            const currentIndex = cinematicCars.indexOf(currentId);
            const nextIndex = currentIndex >= 0
              ? (currentIndex + 1) % cinematicCars.length
              : 0;
            return cinematicCars[nextIndex]!;
          });
          return 0;
        }
        return current + 1;
      });
    }, 1800);

    return () => window.clearInterval(timer);
  }, [playing, steps.length]);

  function selectVehicle(vehicleId: string) {
    setSelectedId(vehicleId);
    setMode("power");
    setActiveStep(0);
    setPlaying(false);
  }

  function selectMode(nextMode: FlowMode) {
    setMode(nextMode);
    setActiveStep(0);
    setPlaying(false);
  }

  function changeStep(direction: -1 | 1) {
    setActiveStep((current) => (current + direction + steps.length) % steps.length);
    setPlaying(false);
  }

  const ActiveIcon = steps[activeStep]!.Icon;

  return (
    <section
      id="demo"
      aria-labelledby={`powertrain-heading-${version}`}
      className="border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-brand">
            Interactive vehicle demo
          </p>
          <h2
            id={`powertrain-heading-${version}`}
            className="mt-4 text-4xl leading-tight text-foreground sm:text-5xl"
          >
            See how the power gets to the road
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Select a JAY model and step through a simple explanation of its powertrain.
          </p>
        </div>

        <div className="mt-10 grid gap-8 rounded-2xl border border-border bg-background p-5 shadow-elevate sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] lg:gap-12">
          <div>
            <label
              htmlFor={`demo-vehicle-${version}`}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Choose a vehicle
            </label>
            <select
              id={`demo-vehicle-${version}`}
              value={selectedId}
              onChange={(event) => selectVehicle(event.target.value)}
              className="mt-2 h-12 w-full border border-input bg-surface px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-sm"
            >
              {cars.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <div className="mt-5 grid grid-cols-3 gap-2" aria-label="Cinematic three-car showcase">
              {cinematicCars.map((carId, index) => {
                const showcaseCar = cars.find((item) => item.id === carId)!;
                return (
                  <button
                    key={showcaseCar.id}
                    type="button"
                    aria-label={`Show ${showcaseCar.name}`}
                    aria-pressed={selectedId === showcaseCar.id}
                    onClick={() => selectVehicle(showcaseCar.id)}
                    className={`group relative h-20 overflow-hidden border text-left transition-all duration-500 sm:h-24 ${
                      selectedId === showcaseCar.id
                        ? "border-brand ring-1 ring-brand"
                        : "border-border hover:border-brand/60"
                    }`}
                  >
                    <Image
                      src={showcaseCar.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 30vw, 180px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-5 text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
                      {index + 1}. {showcaseCar.name.replace("JAY ", "")}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="cinematic-stage mt-5 overflow-hidden border border-border bg-[#080909]">
              <div className="relative h-52 sm:h-64">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(181,155,98,.18),transparent_22%),linear-gradient(145deg,#171a19_0%,#090a0a_55%,#121413_100%)]" />
                <div className="absolute left-[8%] top-[18%] h-px w-[84%] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <div className="absolute left-[8%] right-[8%] top-[29%] h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
                <div className="speed-lines absolute inset-x-0 bottom-[27%] h-12 opacity-70" />
                <Image
                  key={car.id}
                  src={car.image}
                  alt={`${car.name} in motion`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className={`cinematic-car object-cover ${playing ? "cinematic-car-playing" : ""}`}
                />
                <div className="absolute inset-x-0 bottom-0 h-[28%] bg-[linear-gradient(175deg,transparent_28%,#151716_29%,#151716_100%)]" />
                <div className="road-lines absolute bottom-[14%] left-0 h-1 w-full" />
                <div className="absolute bottom-3 left-4 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_12px_rgba(181,155,98,.9)]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/80">
                    JAY Motion {String(cinematicCars.indexOf(car.id) + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            {supportsRecovery && (
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Powertrain demonstration mode">
                <button
                  type="button"
                  aria-pressed={mode === "power"}
                  onClick={() => selectMode("power")}
                  className={`border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    mode === "power"
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-outline text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Power delivery
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "recovery"}
                  onClick={() => selectMode("recovery")}
                  className={`border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    mode === "recovery"
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-outline text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Energy recovery
                </button>
              </div>
            )}

            <div className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-7">
              <div
                className={`flex min-h-40 flex-col items-center justify-center gap-4 sm:min-h-48 sm:flex-row sm:gap-2 ${
                  mode === "recovery" ? "sm:flex-row-reverse" : ""
                }`}
                aria-label={`${mode === "recovery" ? "Energy recovery" : "Power delivery"} steps for ${car.name}`}
              >
                {steps.map(({ label, Icon }, index) => (
                  <div key={`${label}-${index}`} className="contents">
                    <div
                      aria-current={activeStep === index ? "step" : undefined}
                      className={`flex w-full max-w-40 flex-col items-center gap-3 rounded-xl border p-4 text-center transition-colors duration-500 sm:min-h-32 sm:flex-1 ${
                        activeStep === index
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        className={`h-8 w-8 motion-safe:transition-transform motion-safe:duration-500 ${
                          activeStep === index ? "motion-safe:scale-110" : ""
                        }`}
                        strokeWidth={1.6}
                      />
                      <span className="text-xs font-semibold leading-tight">{label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight
                        aria-hidden="true"
                        className={`h-5 w-5 shrink-0 text-brand ${
                          mode === "recovery" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-5 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div
                  className="flex items-start gap-3"
                  role="status"
                  aria-live={playing ? "off" : "polite"}
                >
                  <ActiveIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Step {activeStep + 1} of {steps.length}: {steps[activeStep]!.label}.
                    </span>{" "}
                    {steps[activeStep]!.detail}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous demonstration step"
                    onClick={() => changeStep(-1)}
                    className="inline-flex h-10 w-10 items-center justify-center border border-outline text-foreground transition-colors hover:border-brand hover:text-brand"
                  >
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-pressed={playing}
                    onClick={() => setPlaying((current) => !current)}
                    className="inline-flex h-10 min-w-28 items-center justify-center gap-2 bg-brand px-3 text-xs font-semibold uppercase tracking-wider text-brand-foreground transition-opacity hover:opacity-90"
                  >
                    {playing ? (
                      <Pause aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Play aria-hidden="true" className="h-4 w-4" />
                    )}
                    {playing ? "Pause" : "Play demo"}
                  </button>
                  <button
                    type="button"
                    aria-label="Next demonstration step"
                    onClick={() => changeStep(1)}
                    className="inline-flex h-10 w-10 items-center justify-center border border-outline text-foreground transition-colors hover:border-brand hover:text-brand"
                  >
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Illustrative explanation based on the listed fuel type and transmission. This is not
              filmed test footage or a measurement of real-world performance.
            </p>
          </div>

          <aside className="flex flex-col justify-center border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-[11px] uppercase tracking-[0.3em] text-brand">{car.category}</p>
            <h3 className="mt-3 text-3xl text-foreground">{car.name}</h3>
            <dl className="mt-6 grid grid-cols-2 gap-4">
              <div className="border-t border-border pt-3">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Power</dt>
                <dd className="mt-1 font-display text-xl text-foreground">{car.power}</dd>
              </div>
              <div className="border-t border-border pt-3">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Fuel</dt>
                <dd className="mt-1 font-display text-xl text-foreground">{car.fuel}</dd>
              </div>
              <div className="border-t border-border pt-3">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Transmission
                </dt>
                <dd className="mt-1 text-sm text-foreground">{car.transmission}</dd>
              </div>
              <div className="border-t border-border pt-3">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">0–60 mph</dt>
                <dd className="mt-1 font-display text-xl text-foreground">{car.acceleration}</dd>
              </div>
            </dl>
            <Link
              href={`/request?type=consultation&vehicle=${encodeURIComponent(car.id)}&version=${version}`}
              className="mt-7 inline-flex w-fit items-center justify-center border border-outline px-5 py-3 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              Ask about this model
            </Link>
          </aside>
        </div>
      </div>
      <style jsx>{`
        .cinematic-stage {
          border-radius: 0.75rem;
        }
        .cinematic-car {
          object-position: center 52%;
          transform: translateX(0) scale(1);
          transition:
            transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
            filter 1.2s ease;
          filter: saturate(0.9) contrast(1.08);
          mask-image: linear-gradient(to bottom, transparent 2%, black 18%, black 82%, transparent 96%);
        }
        .cinematic-car-playing {
          animation: cinematic-drive 1.8s ease-in-out infinite;
        }
        .road-lines {
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.48) 0,
              rgba(255, 255, 255, 0.48) 48px,
              transparent 48px,
              transparent 110px
            );
          transform: perspective(180px) rotateX(62deg);
          transform-origin: bottom;
        }
        .speed-lines {
          background:
            linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.12) 18%, transparent 19%),
            linear-gradient(90deg, transparent 44%, rgba(255, 255, 255, 0.1) 62%, transparent 63%),
            linear-gradient(90deg, transparent 72%, rgba(255, 255, 255, 0.14) 88%, transparent 89%);
        }
        @keyframes cinematic-drive {
          0% {
            transform: translateX(-3%) scale(1.04);
            filter: saturate(0.9) contrast(1.08) brightness(0.82);
          }
          45% {
            transform: translateX(1.5%) scale(1);
            filter: saturate(1.12) contrast(1.12) brightness(1);
          }
          100% {
            transform: translateX(4%) scale(1.08);
            filter: saturate(1) contrast(1.08) brightness(0.9);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cinematic-car-playing {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

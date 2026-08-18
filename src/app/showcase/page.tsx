import type { Metadata } from "next";
import { Cpu, Gauge, MoonStar, ScanLine } from "lucide-react";
import { CyberpunkViewer } from "@/components/showcase/cyberpunk-viewer";

export const metadata: Metadata = {
  title: "3D Showcase",
  description:
    "A real-time 3D cyberpunk character and neon city built with React Three Fiber.",
};

const highlights = [
  {
    icon: Cpu,
    title: "Cyberpunk character",
    description:
      "A stylised futuristic woman built from layered geometry — bodysuit, jacket with neon trim, visor, boots and a swept ponytail.",
  },
  {
    icon: ScanLine,
    title: "Neon city",
    description:
      "A procedurally generated district of lit towers, glowing signs, lamp posts, holograms and a wet reflective street.",
  },
  {
    icon: Gauge,
    title: "Real-time lighting",
    description:
      "Coloured point lights, a cool moon key, magenta rim light, fog, PBR reflections and post-processed bloom + depth of field.",
  },
  {
    icon: MoonStar,
    title: "Fully interactive",
    description:
      "Drag to orbit the scene, scroll to zoom, or just let the slow cinematic camera drift.",
  },
];

export default function ShowcasePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <MoonStar className="size-3.5 text-cyan-500" aria-hidden="true" />
          React Three Fiber
        </span>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          The Neon District
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A stylised young woman in a cyberpunk outfit, rendered in real-time inside a
          futuristic neon city. Real WebGL, no pre-rendered images.
        </p>
      </div>

      <div className="mt-10">
        <CyberpunkViewer />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-2xl border bg-card p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <item.icon className="size-4" aria-hidden="true" />
            </span>
            <h3 className="mt-3 font-heading text-base font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

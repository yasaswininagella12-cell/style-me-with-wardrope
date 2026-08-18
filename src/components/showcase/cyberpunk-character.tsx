"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  MeshReflectorMaterial,
  OrbitControls,
  Sparkles,
  Stars,
} from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const SKIN = "#f2c4a2";
const SKIN_SHADOW = "#dfa884";
const HAIR = "#0d0e16";
const SUIT = "#14151d";
const JACKET = "#23263a";
const PANT = "#1b1e2b";
const BOOT = "#12131a";
const NEON_CYAN = "#22e6ff";
const NEON_MAGENTA = "#ff2fd6";
const NEON_YELLOW = "#ffe14d";
const NEON_PURPLE = "#a54dff";

type Point = [number, number, number];

type HairSpec = { pts: Point[]; radius: number };

function buildHairSpecs(): HairSpec[] {
  const specs: HairSpec[] = [];

  for (let i = 0; i < 9; i++) {
    const f = (i / 8) * 2 - 1;
    const length = 0.34 + (i % 3) * 0.04;
    specs.push({
      pts: [
        [f * 0.07, 1.91, -0.02 - Math.abs(f) * 0.04],
        [f * 0.085, 1.86 - Math.abs(f) * 0.03, -0.09],
        [f * 0.105, 1.9 - length * 1.1, -0.17 - Math.abs(f) * 0.05],
        [f * 0.11, 1.92 - length * 1.55, -0.19 - Math.abs(f) * 0.05],
      ],
      radius: 0.009 + (i % 2) * 0.002,
    });
  }

  for (let i = 0; i < 4; i++) {
    const side = i < 2 ? -1 : 1;
    const j = i % 2;
    const x0 = side * (0.09 + j * 0.02);
    specs.push({
      pts: [
        [x0, 1.89, -0.04],
        [side * (0.115 + j * 0.02), 1.84, -0.02],
        [side * (0.125 + j * 0.02), 1.72, 0.005],
        [side * (0.115 + j * 0.02), 1.56, 0.015],
      ],
      radius: 0.008,
    });
  }

  for (let i = 0; i < 6; i++) {
    const f = (i / 5) * 2 - 1;
    specs.push({
      pts: [
        [f * 0.06, 1.9, -0.02],
        [f * 0.078, 1.88, 0.035],
        [f * 0.084, 1.83, 0.07],
        [f * 0.078, 1.77 + Math.abs(f) * 0.012, 0.085],
      ],
      radius: 0.009,
    });
  }

  specs.push(
    {
      pts: [
        [0, 1.91, -0.03],
        [0.06, 1.74, -0.13],
        [0.13, 1.5, -0.17],
        [0.17, 1.22, -0.16],
        [0.15, 0.95, -0.13],
      ],
      radius: 0.03,
    },
    {
      pts: [
        [0.02, 1.9, -0.04],
        [0.1, 1.7, -0.16],
        [0.18, 1.45, -0.2],
        [0.22, 1.16, -0.16],
        [0.21, 0.9, -0.1],
      ],
      radius: 0.013,
    },
    {
      pts: [
        [-0.03, 1.91, -0.05],
        [0.03, 1.72, -0.18],
        [0.09, 1.5, -0.24],
        [0.13, 1.24, -0.23],
        [0.12, 1.0, -0.18],
      ],
      radius: 0.01,
    },
  );

  return specs;
}

const HAIR_SPECS = buildHairSpecs();

function makeWindowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#04060f";
  ctx.fillRect(0, 0, 256, 256);
  const cols = 8;
  const rows = 12;
  const cw = 256 / cols;
  const ch = 256 / rows;
  const colors = [NEON_CYAN, NEON_MAGENTA, NEON_YELLOW, "#9d7bff", "#3effb0"];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.3) continue;
      ctx.globalAlpha = 0.35 + Math.random() * 0.65;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      const inset = 6;
      ctx.fillRect(c * cw + inset, r * ch + inset, cw - inset * 2, ch - inset * 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeSkyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#080a1a");
  gradient.addColorStop(0.45, "#10122b");
  gradient.addColorStop(0.72, "#1a1233");
  gradient.addColorStop(0.9, "#301445");
  gradient.addColorStop(1, "#3f1449");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Studio({
  onReady,
}: {
  onReady?: (state: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) => void;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    onReady?.({ gl, scene });
  }, [gl, onReady, scene]);

  return null;
}

function Strand({ spec }: { spec: HairSpec }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(spec.pts.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 14, spec.radius, 6, false);
  }, [spec]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={HAIR} roughness={0.32} metalness={0.18} />
    </mesh>
  );
}

function RigidFigure() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.position.y = Math.sin(t * 1.4) * 0.006;
    group.current.rotation.z = -0.02 + Math.sin(t * 0.7) * 0.005;
    group.current.rotation.x = Math.sin(t * 0.5) * 0.008;
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <group rotation={[0, 0, 0]}>
        {/* Feet */}
        {([-1, 1] as const).map((side) => (
          <group key={`foot-${side}`} position={[side * 0.095, 0, 0.03]}>
            <mesh position={[0, 0.055, 0]}>
              <boxGeometry args={[0.11, 0.07, 0.25]} />
              <meshStandardMaterial color={BOOT} roughness={0.4} metalness={0.55} />
            </mesh>
            <mesh position={[0, 0.02, 0.005]}>
              <boxGeometry args={[0.13, 0.02, 0.28]} />
              <meshStandardMaterial color={NEON_CYAN} emissive={NEON_CYAN} emissiveIntensity={2.4} />
            </mesh>
            <mesh position={[0, 0.055, 0.145]}>
              <boxGeometry args={[0.09, 0.022, 0.03]} />
              <meshStandardMaterial
                color={NEON_MAGENTA}
                emissive={NEON_MAGENTA}
                emissiveIntensity={2.2}
              />
            </mesh>
          </group>
        ))}

        {/* Boot shafts */}
        {([-1, 1] as const).map((side) => (
          <group key={`shaft-${side}`}>
            <mesh position={[side * 0.095, 0.19, 0]}>
              <cylinderGeometry args={[0.056, 0.052, 0.26, 24]} />
              <meshStandardMaterial color={BOOT} roughness={0.4} metalness={0.55} />
            </mesh>
            <mesh position={[side * 0.095, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.061, 0.009, 8, 32]} />
              <meshStandardMaterial
                color={NEON_CYAN}
                emissive={NEON_CYAN}
                emissiveIntensity={2.2}
              />
            </mesh>
          </group>
        ))}

        {/* Shins */}
        <mesh position={[-0.09, 0.31, 0]}>
          <capsuleGeometry args={[0.056, 0.2, 8, 16]} />
          <meshStandardMaterial color={PANT} roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0.09, 0.31, 0]}>
          <capsuleGeometry args={[0.056, 0.2, 8, 16]} />
          <meshStandardMaterial color={PANT} roughness={0.55} metalness={0.2} />
        </mesh>

        {/* Knee pads */}
        {([-1, 1] as const).map((side) => (
          <group key={`knee-${side}`} position={[side * 0.09, 0.53, 0.06]} rotation={[0.35, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.085, 0.05, 0.03]} />
              <meshStandardMaterial color={JACKET} roughness={0.45} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.018]}>
              <boxGeometry args={[0.075, 0.035, 0.012]} />
              <meshStandardMaterial
                color={NEON_CYAN}
                emissive={NEON_CYAN}
                emissiveIntensity={2.2}
              />
            </mesh>
          </group>
        ))}

        {/* Thighs */}
        <mesh position={[-0.09, 0.64, 0]}>
          <capsuleGeometry args={[0.07, 0.24, 8, 16]} />
          <meshStandardMaterial color={PANT} roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0.09, 0.64, 0]}>
          <capsuleGeometry args={[0.07, 0.24, 8, 16]} />
          <meshStandardMaterial color={PANT} roughness={0.55} metalness={0.2} />
        </mesh>

        {/* Hip straps */}
        {([-1, 1] as const).map((side) => (
          <mesh key={`strap-${side}`} position={[side * 0.09, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.075, 0.012, 8, 32]} />
            <meshStandardMaterial
              color={NEON_MAGENTA}
              emissive={NEON_MAGENTA}
              emissiveIntensity={2.2}
            />
          </mesh>
        ))}

        {/* Hips */}
        <mesh position={[0, 0.88, 0]} scale={[1, 0.62, 0.88]}>
          <sphereGeometry args={[0.145, 24, 16]} />
          <meshStandardMaterial color={SUIT} roughness={0.6} metalness={0.25} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 1.26, 0]}>
          <capsuleGeometry args={[0.15, 0.4, 8, 24]} />
          <meshStandardMaterial color={SUIT} roughness={0.6} metalness={0.25} />
        </mesh>
        <mesh position={[0, 1.44, 0]} scale={[1, 0.82, 0.8]}>
          <sphereGeometry args={[0.16, 24, 16]} />
          <meshStandardMaterial color={SUIT} roughness={0.6} metalness={0.25} />
        </mesh>

        {/* Jacket */}
        <mesh position={[0, 1.26, 0]}>
          <capsuleGeometry args={[0.165, 0.38, 8, 24]} />
          <meshStandardMaterial color={JACKET} roughness={0.42} metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.63, 0]}>
          <cylinderGeometry args={[0.098, 0.122, 0.06, 24]} />
          <meshStandardMaterial color={JACKET} roughness={0.42} metalness={0.4} />
        </mesh>

        {/* Shoulder pads */}
        {([-1, 1] as const).map((side) => (
          <mesh key={`pad-${side}`} position={[side * 0.235, 1.53, 0]} scale={[1, 0.78, 1.1]}>
            <sphereGeometry args={[0.075, 24, 16]} />
            <meshStandardMaterial color={JACKET} roughness={0.42} metalness={0.4} />
          </mesh>
        ))}

        {/* Jacket neon trim */}
        {([-1, 1] as const).map((side) => (
          <mesh key={`trim-${side}`} position={[side * 0.045, 1.3, 0.166]}>
            <boxGeometry args={[0.014, 0.5, 0.012]} />
            <meshStandardMaterial
              color={NEON_CYAN}
              emissive={NEON_CYAN}
              emissiveIntensity={2.4}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.94, 0.112]}>
          <boxGeometry args={[0.3, 0.012, 0.012]} />
          <meshStandardMaterial
            color={NEON_CYAN}
            emissive={NEON_CYAN}
            emissiveIntensity={2.4}
          />
        </mesh>

        {/* Belt */}
        <mesh position={[0, 1.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.168, 0.02, 12, 48]} />
          <meshStandardMaterial color={BOOT} roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 1.06, 0.172]}>
          <boxGeometry args={[0.05, 0.045, 0.02]} />
          <meshStandardMaterial
            color={NEON_YELLOW}
            emissive={NEON_YELLOW}
            emissiveIntensity={2.6}
          />
        </mesh>

        {/* Upper arms */}
        <mesh position={[-0.245, 1.41, 0]}>
          <capsuleGeometry args={[0.047, 0.17, 8, 16]} />
          <meshStandardMaterial color={JACKET} roughness={0.45} metalness={0.35} />
        </mesh>
        <mesh position={[0.245, 1.41, 0]}>
          <capsuleGeometry args={[0.047, 0.17, 8, 16]} />
          <meshStandardMaterial color={JACKET} roughness={0.45} metalness={0.35} />
        </mesh>

        {/* Forearms */}
        <mesh position={[-0.275, 1.08, 0]} rotation={[0, 0, 0.16]}>
          <capsuleGeometry args={[0.041, 0.19, 8, 16]} />
          <meshStandardMaterial color={SUIT} roughness={0.6} metalness={0.25} />
        </mesh>
        <mesh position={[0.275, 1.08, 0]} rotation={[0, 0, -0.16]}>
          <capsuleGeometry args={[0.041, 0.19, 8, 16]} />
          <meshStandardMaterial color={SUIT} roughness={0.6} metalness={0.25} />
        </mesh>

        {/* Hands */}
        {([-1, 1] as const).map((side) => (
          <group key={`hand-${side}`}>
            <mesh position={[side * 0.295, 0.9, 0]}>
              <sphereGeometry args={[0.052, 20, 14]} />
              <meshStandardMaterial color={BOOT} roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh position={[side * 0.295, 0.955, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.054, 0.008, 8, 32]} />
              <meshStandardMaterial
                color={NEON_CYAN}
                emissive={NEON_CYAN}
                emissiveIntensity={2.2}
              />
            </mesh>
          </group>
        ))}

        {/* Neck */}
        <mesh position={[0, 1.68, 0]}>
          <cylinderGeometry args={[0.04, 0.046, 0.1, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} metalness={0.05} />
        </mesh>

        {/* Choker */}
        <mesh position={[0, 1.665, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.05, 0.008, 8, 32]} />
          <meshStandardMaterial
            color={NEON_MAGENTA}
            emissive={NEON_MAGENTA}
            emissiveIntensity={2.4}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.79, 0]} scale={[0.92, 1.08, 0.95]}>
          <sphereGeometry args={[0.11, 32, 24]} />
          <meshStandardMaterial color={SKIN} roughness={0.42} metalness={0.04} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.105, 1.79, 0.02]}>
          <sphereGeometry args={[0.022, 16, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.42} metalness={0.04} />
        </mesh>
        <mesh position={[0.105, 1.79, 0.02]}>
          <sphereGeometry args={[0.022, 16, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.42} metalness={0.04} />
        </mesh>

        {/* Earpiece */}
        <mesh position={[0.108, 1.8, 0.012]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.018, 0.03, 0.02]} />
          <meshStandardMaterial
            color={NEON_MAGENTA}
            emissive={NEON_MAGENTA}
            emissiveIntensity={2.6}
          />
        </mesh>

        {/* Face */}
        <mesh position={[0, 1.765, 0.108]}>
          <boxGeometry args={[0.016, 0.03, 0.014]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.45} metalness={0.04} />
        </mesh>
        <mesh position={[0, 1.72, 0.106]}>
          <boxGeometry args={[0.046, 0.013, 0.01]} />
          <meshStandardMaterial color="#c96a7d" roughness={0.3} metalness={0.05} />
        </mesh>
        <mesh position={[0, 1.705, 0.11]}>
          <boxGeometry args={[0.022, 0.012, 0.01]} />
          <meshStandardMaterial color="#b05a6c" roughness={0.3} metalness={0.05} />
        </mesh>

        {/* Visor */}
        <mesh position={[0, 1.82, 0.082]}>
          <boxGeometry args={[0.18, 0.032, 0.045]} />
          <meshStandardMaterial
            color={NEON_CYAN}
            emissive={NEON_CYAN}
            emissiveIntensity={2.2}
            roughness={0.15}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[0, 1.82, 0.104]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.18, 0.012, 0.018]} />
          <meshStandardMaterial
            color={NEON_PURPLE}
            emissive={NEON_PURPLE}
            emissiveIntensity={2}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>

        {/* Chest emblem */}
        <mesh position={[0, 1.45, 0.168]}>
          <octahedronGeometry args={[0.018, 0]} />
          <meshStandardMaterial
            color={NEON_YELLOW}
            emissive={NEON_YELLOW}
            emissiveIntensity={2.8}
            roughness={0.25}
            metalness={0.4}
          />
        </mesh>

        {/* Hair base */}
        <mesh position={[0, 1.9, -0.015]} scale={[1.05, 0.5, 1.12]}>
          <sphereGeometry args={[0.115, 24, 16]} />
          <meshStandardMaterial color={HAIR} roughness={0.35} metalness={0.15} />
        </mesh>

        {HAIR_SPECS.map((spec, i) => (
          <Strand key={i} spec={spec} />
        ))}
      </group>
    </group>
  );
}

type BuildingConfig = {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  lean: number;
};

const ROOF_COLORS = [NEON_CYAN, NEON_MAGENTA, NEON_YELLOW, NEON_PURPLE];

function City({ windowTexture }: { windowTexture: THREE.Texture }) {
  const buildings = useMemo(() => {
    const list: BuildingConfig[] = [];
    for (let i = 0; i < 16; i++) {
      list.push({
        x: -15 + i * 2 + (i % 3) * 0.5,
        z: -6 - ((i * 5) % 4) * 1.1,
        w: 1.4 + ((i * 3) % 3) * 0.6,
        h: 6 + ((i * 7) % 9),
        d: 1.8 + ((i * 11) % 3),
        lean: ((i * 13) % 7) - 3,
      });
    }
    for (let i = 0; i < 6; i++) {
      list.push({ x: -9.5, z: 4 - i * 2, w: 2.2, h: 5 + ((i * 5) % 8), d: 2, lean: ((i * 9) % 5) - 2 });
    }
    for (let i = 0; i < 6; i++) {
      list.push({ x: 9.5, z: 4 - i * 2, w: 2.2, h: 5 + ((i * 7) % 9), d: 2, lean: ((i * 7) % 5) - 2 });
    }
    return list;
  }, []);

  const material = useMemo(() => {
    const tex = windowTexture.clone();
    tex.needsUpdate = true;
    tex.repeat.set(3, 2);
    return new THREE.MeshStandardMaterial({
      color: "#0c1020",
      roughness: 0.85,
      metalness: 0.25,
      emissive: "#ffffff",
      emissiveIntensity: 1.1,
      emissiveMap: tex,
    });
  }, [windowTexture]);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2, b.z]} rotation={[0, b.lean * 0.015, 0]}>
          <mesh material={material}>
            <boxGeometry args={[b.w, b.h, b.d]} />
          </mesh>
          <mesh position={[0, b.h / 2 + 0.03, 0]}>
            <boxGeometry args={[b.w, 0.05, b.d]} />
            <meshStandardMaterial
              color={ROOF_COLORS[i % ROOF_COLORS.length]}
              emissive={ROOF_COLORS[i % ROOF_COLORS.length]}
              emissiveIntensity={2.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Sign({
  position,
  rotation,
  color,
  accent,
  width,
  height,
  bars,
}: {
  position: Point;
  rotation: Point;
  color: string;
  accent: string;
  width: number;
  height: number;
  bars: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial
          color="#101222"
          roughness={0.35}
          metalness={0.6}
          emissive={color}
          emissiveIntensity={0.7}
        />
      </mesh>
      {Array.from({ length: bars }).map((_, i) => (
        <mesh key={i} position={[(-(bars - 1) / 2 + i) * (width / bars), 0, 0.06]}>
          <boxGeometry args={[width / (bars * 2.4), height * 0.55, 0.03]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={3.2}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
      ))}
      <mesh position={[0, -height / 2 - 0.55, -0.2]}>
        <cylinderGeometry args={[0.028, 0.034, height + 1.1, 10]} />
        <meshStandardMaterial color="#1a1d29" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
}

function HoloRing({ position, radius, color, speed }: { position: Point; radius: number; color: string; speed: number }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.z = t * speed;
    mesh.current.position.y = position[1] + Math.sin(t * speed * 1.5) * 0.08;
  });

  return (
    <mesh ref={mesh} position={position} rotation={[0.4, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 8, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.6}
        roughness={0.2}
        metalness={0.5}
      />
    </mesh>
  );
}

function Road() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0.4]}>
        <planeGeometry args={[34, 12]} />
        <MeshReflectorMaterial
          resolution={512}
          mixBlur={1}
          blur={[300, 80]}
          mirror={0.55}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#0a0a12"
          metalness={0.5}
          roughness={0.55}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 1.95]}>
        <planeGeometry args={[36, 2.4]} />
        <meshStandardMaterial color="#0d0f16" roughness={0.6} metalness={0.3} />
      </mesh>
      {[0.4, 1.8, 3.2, -1.0].map((z, i) => (
        <mesh key={z} position={[0, 0.04, 0.4 + z]}>
          <boxGeometry args={[0.06, 0.02, 1.4]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? NEON_YELLOW : NEON_CYAN}
            emissive={i % 2 === 0 ? NEON_YELLOW : NEON_CYAN}
            emissiveIntensity={2.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function Lamppost({ x, color }: { x: number; color: string }) {
  return (
    <group position={[x, 0, -0.6]}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.032, 0.05, 4.4, 10]} />
        <meshStandardMaterial color="#171a26" roughness={0.35} metalness={0.8} />
      </mesh>
      <mesh position={[0.5, 4.08, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.024, 1, 10]} />
        <meshStandardMaterial color="#171a26" roughness={0.35} metalness={0.8} />
      </mesh>
      <mesh position={[0.95, 3.95, 0]}>
        <boxGeometry args={[0.55, 0.09, 0.09]} />
        <meshStandardMaterial
          color="#0f1220"
          emissive={color}
          emissiveIntensity={1.8}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      <pointLight position={[0.95, 3.7, 0]} intensity={7} distance={9} decay={2} color={color} />
    </group>
  );
}

export function CyberpunkScene() {
  const windowTexture = useMemo(() => makeWindowTexture(), []);
  const skyTexture = useMemo(() => makeSkyTexture(), []);
  const envRef = useRef<THREE.WebGLRenderTarget | null>(null);

  const handleEnvironment = useCallback(
    ({ gl, scene }: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) => {
      const pmrem = new THREE.PMREMGenerator(gl);
      const room = new RoomEnvironment();
      const rt = pmrem.fromScene(room, 0.04);
      scene.environment = rt.texture;
      envRef.current?.dispose();
      envRef.current = rt;
      pmrem.dispose();
      room.dispose();
    },
    [],
  );

  useEffect(() => {
    return () => {
      envRef.current?.dispose();
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 40, position: [0.8, 1.55, 4.4], near: 0.1, far: 140 }}
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#070810"]} />
      <fog attach="fog" args={["#070810", 7, 28]} />

      <Studio onReady={handleEnvironment} />

      <mesh scale={[1, 1, 1]}>
        <sphereGeometry args={[90, 32, 16]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} fog={false} depthWrite={false} />
      </mesh>

      <ambientLight intensity={0.28} color="#2a2f4a" />
      <directionalLight position={[6, 9, -6]} intensity={1.4} color="#aec6ff" />
      <directionalLight position={[-6, 4, 5]} intensity={0.7} color="#ff5ad8" />
      <directionalLight position={[0, 1, -3]} intensity={0.4} color="#22e6ff" />
      <pointLight position={[-3.5, 1.4, 2.2]} intensity={9} distance={11} decay={2} color="#ff2fd6" />
      <pointLight position={[3.5, 1.5, 2]} intensity={9} distance={11} decay={2} color="#22e6ff" />
      <pointLight position={[0, 2.4, -2.5]} intensity={7} distance={10} decay={2} color="#ffe14d" />

      <City windowTexture={windowTexture} />
      <Road />

      <Sign
        position={[-3.5, 4.5, -7.8]}
        rotation={[0, 0.35, 0]}
        color={NEON_MAGENTA}
        accent={NEON_CYAN}
        width={2.4}
        height={1.4}
        bars={3}
      />
      <Sign
        position={[8.4, 3.2, -1.2]}
        rotation={[0, -0.5, 0]}
        color={NEON_CYAN}
        accent={NEON_YELLOW}
        width={1.8}
        height={1.0}
        bars={2}
      />
      <Sign
        position={[2.8, 2.7, -5.4]}
        rotation={[0, 0.2, 0]}
        color={NEON_YELLOW}
        accent={NEON_MAGENTA}
        width={1.2}
        height={0.7}
        bars={2}
      />
      <mesh position={[0, 6.6, -6.4]}>
        <boxGeometry args={[9, 0.55, 0.12]} />
        <meshStandardMaterial
          color="#101222"
          emissive={NEON_CYAN}
          emissiveIntensity={1.2}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      <HoloRing position={[3.4, 1.6, -3.2]} radius={0.55} color={NEON_CYAN} speed={0.7} />
      <HoloRing position={[-3.8, 2.2, -2.6]} radius={0.4} color={NEON_MAGENTA} speed={-0.9} />

      <Lamppost x={-3.4} color={NEON_MAGENTA} />
      <Lamppost x={0} color={NEON_CYAN} />
      <Lamppost x={3.4} color={NEON_YELLOW} />

      <group position={[0, 0, 0]}>
        <RigidFigure />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.6}
          scale={3.2}
          blur={2.4}
          far={1.2}
          color="#000000"
        />
        <mesh position={[0, 0.012, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.6, 0.64, 64]} />
          <meshBasicMaterial color={NEON_CYAN} transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, 0.011, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.82, 0.826, 64]} />
          <meshBasicMaterial color={NEON_MAGENTA} transparent opacity={0.35} />
        </mesh>
      </group>

      <Stars radius={90} depth={40} count={2200} factor={4} saturation={0} fade speed={0.6} />
      <Sparkles
        count={80}
        scale={[16, 6, 16]}
        size={2}
        speed={0.25}
        opacity={0.5}
        color="#8ef0ff"
        position={[0, 3, -2]}
      />

      <OrbitControls
        makeDefault
        target={[0, 1.05, 0]}
        enablePan={false}
        minDistance={2.8}
        maxDistance={13}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        autoRotate
        autoRotateSpeed={0.8}
      />

      <EffectComposer>
        <Bloom intensity={1.05} luminanceThreshold={0.18} luminanceSmoothing={0.4} mipmapBlur radius={0.7} />
        <DepthOfField target={[0, 1.45, 0]} worldFocusRange={0.8} bokehScale={2} />
        <Vignette eskil={false} offset={0.25} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";

type TryOnItem = {
  id: string;
  name: string;
  category?: string | null;
  imageUrl?: string | null;
};

type BodyPart = "torso" | "arms" | "legs" | "feet" | "head";

const NEUTRAL = "#e7e1d6";
const PEDESTAL = "#cfc5b4";

// Which body parts a garment photo should be mapped onto.
function partsFor(category?: string | null): BodyPart[] {
  const c = (category ?? "").toLowerCase();
  if (/hat|cap|beanie|turban|headband|headwrap/i.test(c)) return ["head"];
  if (/dress|saree|lehenga|kurti|kurt|gown|anarkali|jumpsuit|frock|caftan|kurta/i.test(c)) {
    return ["torso", "legs"];
  }
  if (/skirt/i.test(c)) return ["legs"];
  if (/top|shirt|tshirt|t-shirt|blouse|camisole|tank|bustier|jacket|blazer|coat|cardigan|hoodie|sweater|sweatshirt|waistcoat/i.test(c)) {
    return ["torso", "arms"];
  }
  if (/pant|jean|trouser|short|legging|palazzo|jogger|chino|dhoti|churidar|sharara|salwar/i.test(c)) {
    return ["legs"];
  }
  if (/shoe|sneaker|heel|boot|sandal|flat|jutti|kolhapuri|mule|loafer|wedge/i.test(c)) {
    return ["feet"];
  }
  return [];
}

// Load each garment photo as a WebGL texture. Later items in the look win if
// several garments share a body part, so outer layers cover inner ones.
function useGarmentTextures(items: TryOnItem[]): Record<string, THREE.Texture | null> {
  const [textures, setTextures] = useState<Record<string, THREE.Texture | null>>({});
  const key = items.map((item) => item.id).join("|");

  // Reset the texture map synchronously whenever the set of garments changes
  // (render-time adjustment, the recommended alternative to setState in effects).
  const [prevKey, setPrevKey] = useState<string | null>(null);
  if (prevKey !== key) {
    setPrevKey(key);
    setTextures({});
  }

  useEffect(() => {
    let cancelled = false;
    const withImages = items.filter((item) => item.imageUrl);
    if (withImages.length === 0) return;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const loaded: Record<string, THREE.Texture | null> = {};

    withImages.forEach((item) => {
      const url = item.imageUrl!;
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 8;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          loaded[item.id] = texture;
          if (!cancelled) setTextures({ ...loaded });
        },
        undefined,
        () => {
          // Cross-origin or broken image — leave that part in neutral material.
          loaded[item.id] = null;
          if (!cancelled) setTextures({ ...loaded });
        },
      );
    });

    return () => {
      cancelled = true;
      Object.values(loaded).forEach((texture) => {
        if (texture) texture.dispose();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return textures;
}

function usePartTextures(
  items: TryOnItem[],
  textures: Record<string, THREE.Texture | null>,
): Record<BodyPart, THREE.Texture | null> {
  return useMemo(() => {
    const result: Record<BodyPart, THREE.Texture | null> = {
      torso: null,
      arms: null,
      legs: null,
      feet: null,
      head: null,
    };
    for (const item of items) {
      const texture = textures[item.id];
      if (!texture) continue;
      for (const part of partsFor(item.category)) {
        result[part] = texture;
      }
    }
    return result;
  }, [items, textures]);
}

function Cloth({
  texture,
  radius,
  length,
  position,
  rotation,
}: {
  texture: THREE.Texture | null;
  radius: number;
  length: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <capsuleGeometry args={[radius, length, 8, 20]} />
      <meshStandardMaterial
        map={texture ?? undefined}
        color={texture ? "#ffffff" : NEUTRAL}
        roughness={0.8}
        metalness={0.05}
      />
    </mesh>
  );
}

function Sphere({
  texture,
  radius,
  position,
}: {
  texture: THREE.Texture | null;
  radius: number;
  position: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 24, 16]} />
      <meshStandardMaterial
        map={texture ?? undefined}
        color={texture ? "#ffffff" : NEUTRAL}
        roughness={0.8}
        metalness={0.05}
      />
    </mesh>
  );
}

function Mannequin({ partTex }: { partTex: Record<BodyPart, THREE.Texture | null> }) {
  const hasHat = Boolean(partTex.head);
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.8, 0.95, 0.1, 48]} />
        <meshStandardMaterial color={PEDESTAL} roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.08, 32]} />
        <meshStandardMaterial color={PEDESTAL} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Feet */}
      {[1, -1].map((side) => (
        <mesh key={`foot-${side}`} position={[side * 0.115, 0.05, 0.04]}>
          <boxGeometry args={[0.1, 0.06, 0.26]} />
          <meshStandardMaterial
            map={partTex.feet ?? undefined}
            color={partTex.feet ? "#ffffff" : NEUTRAL}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Calves */}
      <Cloth texture={partTex.legs} radius={0.075} length={0.36} position={[-0.115, 0.32, 0]} />
      <Cloth texture={partTex.legs} radius={0.075} length={0.36} position={[0.115, 0.32, 0]} />

      {/* Thighs */}
      <Cloth texture={partTex.legs} radius={0.1} length={0.3} position={[-0.115, 0.72, 0]} />
      <Cloth texture={partTex.legs} radius={0.1} length={0.3} position={[0.115, 0.72, 0]} />

      {/* Torso */}
      <Cloth texture={partTex.torso} radius={0.19} length={0.52} position={[0, 1.34, 0]} />
      <Sphere texture={partTex.torso} radius={0.21} position={[0, 1.68, 0]} />

      {/* Upper arms */}
      <Cloth
        texture={partTex.arms}
        radius={0.06}
        length={0.26}
        position={[-0.26, 1.42, 0]}
        rotation={[0, 0, 0.16]}
      />
      <Cloth
        texture={partTex.arms}
        radius={0.06}
        length={0.26}
        position={[0.26, 1.42, 0]}
        rotation={[0, 0, -0.16]}
      />

      {/* Forearms */}
      <Cloth
        texture={partTex.arms}
        radius={0.05}
        length={0.24}
        position={[-0.29, 1.08, 0]}
        rotation={[0, 0, 0.3]}
      />
      <Cloth
        texture={partTex.arms}
        radius={0.05}
        length={0.24}
        position={[0.29, 1.08, 0]}
        rotation={[0, 0, -0.3]}
      />

      {/* Hands */}
      <Sphere texture={null} radius={0.055} position={[-0.3, 0.9, 0]} />
      <Sphere texture={null} radius={0.055} position={[0.3, 0.9, 0]} />

      {/* Neck (always neutral) */}
      <mesh position={[0, 1.82, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.12, 16]} />
        <meshStandardMaterial color={NEUTRAL} roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Head */}
      <Sphere texture={null} radius={0.135} position={[0, 1.92, 0]} />

      {/* Hat */}
      {hasHat && (
        <group position={[0, 2.03, 0]}>
          <mesh>
            <cylinderGeometry args={[0.13, 0.15, 0.14, 32]} />
            <meshStandardMaterial
              map={partTex.head ?? undefined}
              color="#ffffff"
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[0, -0.09, 0]}>
            <cylinderGeometry args={[0.21, 0.23, 0.03, 32]} />
            <meshStandardMaterial color={PEDESTAL} roughness={0.7} metalness={0.05} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function Mannequin3D({ items }: { items: TryOnItem[] }) {
  const textures = useGarmentTextures(items);
  const partTex = usePartTextures(items, textures);
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 30, position: [0, 1.3, 4.7] }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} />
      <directionalLight position={[-4, 2, -3]} intensity={0.45} color="#b7a583" />
      <pointLight position={[0, 2.4, 2.4]} intensity={0.35} />

      <Mannequin partTex={partTex} />

      <ContactShadows
        position={[0, 0.1, 0]}
        opacity={0.4}
        scale={3.4}
        blur={2.2}
        far={1.4}
        color="#2b2118"
      />

      <OrbitControls
        makeDefault
        target={[0, 1.05, 0]}
        enablePan={false}
        minDistance={2.6}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        enableDamping
        autoRotate={autoRotate}
        autoRotateSpeed={1.6}
        onStart={() => setAutoRotate(false)}
        onEnd={() => setAutoRotate(true)}
      />
    </Canvas>
  );
}

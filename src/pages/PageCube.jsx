import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

const PRIZES = [
  { emoji: "🍩", label: "Donitas" },
  { emoji: "🎉", label: "Confeti" },
  { emoji: "✨", label: "Estrella brillante" },
  { emoji: "🧑‍🎤", label: "Giorgi" },
  { emoji: "🔫", label: "Pistola" },
  { emoji: "🌌", label: "Galaxia" },
  { emoji: "🐋", label: "Ballena" },
  { emoji: "🦁🐱", label: "Gatito león" },
  { emoji: "⬜", label: "Blanco" },
  { emoji: "🎧", label: "Audífonos" },
  { emoji: "💎", label: "Diamante" },
  { emoji: "🚀", label: "Cohete" },
  { emoji: "🔥", label: "Fuego" },
  { emoji: "🍫", label: "Chocolate" },
  { emoji: "🧸", label: "Oso sorpresa" },
];

const BOX_COLORS = [
  "#ff4d6d",
  "#ff8fab",
  "#7b2cbf",
  "#5a189a",
  "#4361ee",
  "#4895ef",
  "#4cc9f0",
  "#06d6a0",
  "#38b000",
  "#70e000",
  "#ffbe0b",
  "#fb5607",
  "#8338ec",
  "#3a86ff",
  "#f15bb5",
  "#00bbf9",
  "#00f5d4",
  "#9b5de5",
  "#f3722c",
  "#90be6d",
];

const RIBBON_COLORS = ["#ffffff", "#ffe066", "#d9ed92", "#ffd6ff", "#caf0f8"];

const lerp = (a, b, t) => a + (b - a) * t;

function pickRandomPrize(excludedPrizeIndex = -1) {
  if (PRIZES.length === 1) {
    return { prize: PRIZES[0], prizeIndex: 0 };
  }

  const availableIndexes = PRIZES.map((_, index) => index).filter(
    (index) => index !== excludedPrizeIndex
  );

  const randomIndex =
    availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

  return {
    prize: PRIZES[randomIndex],
    prizeIndex: randomIndex,
  };
}

const AnimatedBackground = ({ dimmed }) => {
  const dotsRef = useRef([]);

  const dots = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 26,
      y: (Math.random() - 0.5) * 16,
      z: -4 - Math.random() * 3,
      r: 0.12 + Math.random() * 0.1,
      speed: 0.3 + Math.random() * 0.5,
      drift: 0.12 + Math.random() * 0.25,
      color: BOX_COLORS[i % BOX_COLORS.length],
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    for (let i = 0; i < dotsRef.current.length; i++) {
      const mesh = dotsRef.current[i];
      const item = dots[i];
      if (!mesh || !item) continue;

      mesh.position.y = item.y + Math.sin(t * item.speed + i) * item.drift;
      mesh.position.x = item.x + Math.cos(t * item.speed * 0.7 + i) * item.drift;
    }
  });

  return (
    <group>
      {dots.map((item, i) => (
        <mesh
          key={item.id}
          ref={(el) => (dotsRef.current[i] = el)}
          position={[item.x, item.y, item.z]}
        >
          <sphereGeometry args={[item.r, 12, 12]} />
          <meshBasicMaterial
            color={item.color}
            transparent
            opacity={dimmed ? 0.08 : 0.18}
          />
        </mesh>
      ))}
    </group>
  );
};

const BackdropPlane = ({ visible }) => {
  const materialRef = useRef();

  useFrame(() => {
    if (!materialRef.current) return;
    materialRef.current.opacity = lerp(
      materialRef.current.opacity,
      visible ? 0.72 : 0,
      0.08
    );
  });

  return (
    <mesh position={[0, 0, -0.6]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#060816"
        transparent
        opacity={0}
      />
    </mesh>
  );
};

const ExplodedGift = ({ color, ribbonColor, progress }) => {
  const pieces = [
    { pos: [-0.9, 0.65, 0], rot: [1.3, -1.1, 0.8], size: [0.58, 0.22, 0.58], c: color },
    { pos: [0.9, 0.45, 0], rot: [-1.2, 1.2, -0.7], size: [0.58, 0.22, 0.58], c: color },
    { pos: [0, 1.2, 0], rot: [0.6, 1.8, 1.3], size: [0.76, 0.18, 0.76], c: color },
    { pos: [-1.05, -0.35, 0.15], rot: [1.2, 0.5, -1.0], size: [0.38, 0.38, 0.38], c: color },
    { pos: [1.05, -0.2, -0.15], rot: [-1.0, -0.6, 1.1], size: [0.38, 0.38, 0.38], c: color },
    { pos: [0, -1.0, 0], rot: [0.8, -1.2, 0.8], size: [0.42, 0.42, 0.42], c: ribbonColor },
  ];

  return (
    <group>
      {pieces.map((piece, idx) => (
        <mesh
          key={idx}
          position={[
            piece.pos[0] * progress,
            piece.pos[1] * progress,
            piece.pos[2] * progress,
          ]}
          rotation={[
            piece.rot[0] * progress,
            piece.rot[1] * progress,
            piece.rot[2] * progress,
          ]}
        >
          <boxGeometry args={piece.size} />
          <meshStandardMaterial
            color={piece.c}
            flatShading
            transparent
            opacity={Math.max(0, 1 - progress * 0.7)}
          />
        </mesh>
      ))}
    </group>
  );
};

const GiftBox = ({
  gift,
  selected,
  revealed,
  dimmed,
  onSelect,
  onReveal,
}) => {
  const groupRef = useRef();
  const glowMaterialRef = useRef();
  const explosionRef = useRef(0);
  const hoverRef = useRef(false);

  const basePosition = gift.position;
  const centerPosition = [0, 0.2, 3];
  const targetPosition = selected || revealed ? centerPosition : basePosition;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const scaleTarget = selected || revealed ? 1.95 : hoverRef.current ? 1.05 : 1;

    groupRef.current.position.x = lerp(
      groupRef.current.position.x,
      targetPosition[0],
      selected || revealed ? 0.12 : 0.18
    );
    groupRef.current.position.y = lerp(
      groupRef.current.position.y,
      targetPosition[1],
      selected || revealed ? 0.12 : 0.18
    );
    groupRef.current.position.z = lerp(
      groupRef.current.position.z,
      targetPosition[2],
      selected || revealed ? 0.12 : 0.18
    );

    groupRef.current.scale.x = lerp(groupRef.current.scale.x, scaleTarget, 0.14);
    groupRef.current.scale.y = lerp(groupRef.current.scale.y, scaleTarget, 0.14);
    groupRef.current.scale.z = lerp(groupRef.current.scale.z, scaleTarget, 0.14);

    if (selected && !revealed) {
      groupRef.current.rotation.y += delta * 1.9;
    } else {
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, 0, 0.12);
    }

    if (glowMaterialRef.current) {
      const glowTarget = selected ? 0.3 : hoverRef.current ? 0.15 : 0.06;
      glowMaterialRef.current.opacity = lerp(
        glowMaterialRef.current.opacity,
        glowTarget,
        0.12
      );
    }

    explosionRef.current = lerp(explosionRef.current, revealed ? 1 : 0, 0.12);
  });

  const handleClick = (e) => {
    e.stopPropagation();

    if (!selected && !revealed) {
      onSelect(gift);
      return;
    }

    if (selected && !revealed) {
      onReveal(gift);
    }
  };

  const boxOpacity = dimmed && !selected && !revealed ? 0.16 : 1;
  const showClosedBox = !revealed || explosionRef.current < 0.1;
  const size = 0.72;

  return (
    <group
      ref={groupRef}
      position={basePosition}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoverRef.current = true;
      }}
      onPointerOut={() => {
        hoverRef.current = false;
      }}
    >
      <mesh position={[0, 0, -0.08]} onClick={handleClick}>
        <planeGeometry args={[1.25, 1.25]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color={gift.color}
          transparent
          opacity={0.06}
        />
      </mesh>

      {showClosedBox && (
        <>
          <mesh castShadow receiveShadow onClick={handleClick}>
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial
              color={gift.color}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0, 0, 0.001]} castShadow receiveShadow onClick={handleClick}>
            <boxGeometry args={[0.14, size + 0.01, size + 0.01]} />
            <meshStandardMaterial
              color={gift.ribbonColor}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0.001, 0, 0]} castShadow receiveShadow onClick={handleClick}>
            <boxGeometry args={[size + 0.01, size + 0.01, 0.14]} />
            <meshStandardMaterial
              color="#ffe066"
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0, 0.42, 0]} castShadow receiveShadow onClick={handleClick}>
            <boxGeometry args={[0.8, 0.16, 0.8]} />
            <meshStandardMaterial
              color={gift.color}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[-0.12, 0.55, 0]} castShadow onClick={handleClick}>
            <boxGeometry args={[0.18, 0.07, 0.2]} />
            <meshStandardMaterial
              color={gift.ribbonColor}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0.12, 0.55, 0]} castShadow onClick={handleClick}>
            <boxGeometry args={[0.18, 0.07, 0.2]} />
            <meshStandardMaterial
              color={gift.ribbonColor}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0, 0.55, 0]} castShadow onClick={handleClick}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial
              color="#ffe066"
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>
        </>
      )}

      {revealed && (
        <ExplodedGift
          color={gift.color}
          ribbonColor={gift.ribbonColor}
          progress={explosionRef.current}
        />
      )}

      <Text
        position={[0, 0, size / 2 + 0.03]}
        fontSize={0.14}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="black"
        onClick={handleClick}
      >
        {gift.number}
      </Text>
    </group>
  );
};

const Scene = ({
  gifts,
  selectedId,
  revealedId,
  onSelect,
  onReveal,
}) => {
  const dimmed = Boolean(selectedId || revealedId);

  return (
    <>
      <BackdropPlane visible={dimmed} />
      <AnimatedBackground dimmed={dimmed} />

      {gifts.map((gift) => (
        <GiftBox
          key={gift.id}
          gift={gift}
          selected={selectedId === gift.id}
          revealed={revealedId === gift.id}
          dimmed={dimmed}
          onSelect={onSelect}
          onReveal={onReveal}
        />
      ))}

      <ambientLight intensity={1.05} />
      <directionalLight position={[4, 6, 8]} intensity={1.25} />
      <directionalLight position={[-4, -3, 6]} intensity={0.38} />
      <pointLight position={[0, 0, 6]} intensity={0.25} />
    </>
  );
};

const PageCube = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [revealedId, setRevealedId] = useState(null);
  const [revealedPrize, setRevealedPrize] = useState(null);
  const [giftPrizeHistory, setGiftPrizeHistory] = useState({});
  const [boardKey, setBoardKey] = useState(0);

  const gifts = useMemo(() => {
    const items = [];
    const rows = 10;
    const cols = 10;
    const spacing = 1.72;
    const totalWidth = (cols - 1) * spacing;
    const totalHeight = (rows - 1) * spacing;

    let count = 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        items.push({
          id: `${row}-${col}`,
          number: count,
          position: [
            col * spacing - totalWidth / 2,
            -(row * spacing) + totalHeight / 2,
            0,
          ],
          color: BOX_COLORS[(count - 1) % BOX_COLORS.length],
          ribbonColor: RIBBON_COLORS[(count - 1) % RIBBON_COLORS.length],
        });
        count++;
      }
    }

    return items;
  }, [boardKey]);

  const selectedGift = gifts.find((g) => g.id === selectedId) || null;

  const handleSelect = (gift) => {
    if (revealedId) return;
    setSelectedId(gift.id);
    setRevealedPrize(null);
  };

  const handleReveal = (gift) => {
    if (selectedId !== gift.id || revealedId) return;

    const previousPrizeIndex = giftPrizeHistory[gift.id] ?? -1;
    const { prize, prizeIndex } = pickRandomPrize(previousPrizeIndex);

    setRevealedPrize(prize);
    setRevealedId(gift.id);

    setGiftPrizeHistory((prev) => ({
      ...prev,
      [gift.id]: prizeIndex,
    }));
  };

  const handleClose = () => {
    setSelectedId(null);
    setRevealedId(null);
    setRevealedPrize(null);
  };

  const handleReset = () => {
    setSelectedId(null);
    setRevealedId(null);
    setRevealedPrize(null);
    setGiftPrizeHistory({});
    setBoardKey((prev) => prev + 1);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,#1d315d_0%,#0c1327_42%,#050816_100%)]">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[-10%] top-[-15%] h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse" />
        <div className="absolute right-[-8%] top-[10%] h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-15%] left-[20%] h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
      </div>

      <Canvas
        orthographic
        camera={{
          zoom: 42,
          position: [0, 0, 10],
          near: 0.1,
          far: 1000,
        }}
        shadows={false}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene
          gifts={gifts}
          selectedId={selectedId}
          revealedId={revealedId}
          onSelect={handleSelect}
          onReveal={handleReveal}
        />
      </Canvas>

      <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-center text-white shadow-2xl backdrop-blur-md">
        <div className="text-sm font-extrabold tracking-[0.2em] text-yellow-300">
          GIFT GRID
        </div>
        <div className="mt-1 text-xs text-white/80">
          1 click: llevar al centro · 2 click: abrir regalo
        </div>
      </div>

      {selectedGift && !revealedId && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
          <div className="rounded-2xl border border-white/15 bg-black/70 px-5 py-3 text-center text-white shadow-2xl backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Caja #{selectedGift.number}
            </div>
            <div className="mt-2 text-sm font-bold text-yellow-300">
              Dale click otra vez para abrir
            </div>
          </div>
        </div>
      )}

      {revealedId && revealedPrize && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="rounded-[28px] border border-white/15 bg-black/72 px-8 py-7 text-center text-white shadow-2xl backdrop-blur-md">
            <div className="text-6xl">{revealedPrize.emoji}</div>
            <div className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Ganaste
            </div>
            <div className="mt-2 text-2xl font-extrabold text-yellow-300">
              {revealedPrize.label}
            </div>

            <button
              onClick={handleClose}
              className="mt-6 rounded-2xl border border-white/15 bg-white/10 px-5 py-2 text-sm font-bold text-white transition hover:scale-105 hover:bg-white/15"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        <button
          onClick={handleReset}
          className="rounded-2xl border border-white/15 bg-white/10 px-5 py-2 text-sm font-bold text-white shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-white/15"
        >
          Reiniciar tablero
        </button>
      </div>
    </div>
  );
};

export default PageCube;
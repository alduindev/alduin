import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, MapControls } from "@react-three/drei";

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
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

function useViewportSize() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1440,
    height: typeof window !== "undefined" ? window.innerHeight : 900,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}

const AnimatedBackground = ({ dimmed, isMobile }) => {
  const dotsRef = useRef([]);

  const dots = useMemo(() => {
    const total = isMobile ? 10 : 16;

    return Array.from({ length: total }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * (isMobile ? 20 : 28),
      y: (Math.random() - 0.5) * (isMobile ? 26 : 18),
      z: -4 - Math.random() * 3,
      r: (isMobile ? 0.09 : 0.12) + Math.random() * 0.08,
      speed: 0.25 + Math.random() * 0.45,
      drift: 0.08 + Math.random() * 0.22,
      color: BOX_COLORS[i % BOX_COLORS.length],
    }));
  }, [isMobile]);

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
            opacity={dimmed ? 0.07 : isMobile ? 0.14 : 0.18}
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

const ExplodedGift = ({ color, ribbonColor, progress, sizeMultiplier = 1 }) => {
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
            piece.pos[0] * progress * sizeMultiplier,
            piece.pos[1] * progress * sizeMultiplier,
            piece.pos[2] * progress * sizeMultiplier,
          ]}
          rotation={[
            piece.rot[0] * progress,
            piece.rot[1] * progress,
            piece.rot[2] * progress,
          ]}
        >
          <boxGeometry
            args={[
              piece.size[0] * sizeMultiplier,
              piece.size[1] * sizeMultiplier,
              piece.size[2] * sizeMultiplier,
            ]}
          />
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
  isMobile,
}) => {
  const groupRef = useRef();
  const glowMaterialRef = useRef();
  const explosionRef = useRef(0);
  const hoverRef = useRef(false);

  const boxSize = isMobile ? 0.66 : 0.72;
  const centerPosition = isMobile ? [0, 0.2, 3] : [0, 0.15, 3];
  const targetPosition = selected || revealed ? centerPosition : gift.position;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const scaleTarget = selected || revealed ? (isMobile ? 2.1 : 1.95) : hoverRef.current ? 1.08 : 1;

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
      groupRef.current.rotation.y += delta * (isMobile ? 1.65 : 1.9);
    } else {
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, 0, 0.12);
    }

    if (glowMaterialRef.current) {
      const glowTarget = selected ? 0.34 : hoverRef.current ? 0.18 : 0.06;
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

  const boxOpacity = dimmed && !selected && !revealed ? 0.14 : 1;
  const showClosedBox = !revealed || explosionRef.current < 0.1;

  return (
    <group
      ref={groupRef}
      position={gift.position}
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
        <planeGeometry args={[boxSize * 1.9, boxSize * 1.9]} />
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
            <boxGeometry args={[boxSize, boxSize, boxSize]} />
            <meshStandardMaterial
              color={gift.color}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0, 0, 0.001]} castShadow receiveShadow onClick={handleClick}>
            <boxGeometry args={[0.14, boxSize + 0.01, boxSize + 0.01]} />
            <meshStandardMaterial
              color={gift.ribbonColor}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0.001, 0, 0]} castShadow receiveShadow onClick={handleClick}>
            <boxGeometry args={[boxSize + 0.01, boxSize + 0.01, 0.14]} />
            <meshStandardMaterial
              color="#ffe066"
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0, boxSize * 0.58, 0]} castShadow receiveShadow onClick={handleClick}>
            <boxGeometry args={[boxSize * 1.1, 0.16, boxSize * 1.1]} />
            <meshStandardMaterial
              color={gift.color}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[-0.12, boxSize * 0.76, 0]} castShadow onClick={handleClick}>
            <boxGeometry args={[0.18, 0.07, 0.2]} />
            <meshStandardMaterial
              color={gift.ribbonColor}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0.12, boxSize * 0.76, 0]} castShadow onClick={handleClick}>
            <boxGeometry args={[0.18, 0.07, 0.2]} />
            <meshStandardMaterial
              color={gift.ribbonColor}
              flatShading
              transparent
              opacity={boxOpacity}
            />
          </mesh>

          <mesh position={[0, boxSize * 0.76, 0]} castShadow onClick={handleClick}>
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
          sizeMultiplier={isMobile ? 1.06 : 1}
        />
      )}

      <Text
        position={[0, 0, boxSize / 2 + 0.04]}
        fontSize={isMobile ? 0.32 : 0.28}
        font="https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmEU9fAKk.woff2"
        fontWeight={700}
        color="#fef3c7"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.028}
        outlineColor="#1f2937"
        outlineBlur={0.012}
        letterSpacing={0.02}
        onClick={handleClick}
        renderOrder={10}
        depthTest={false}
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
  isMobile,
  cameraZoom,
  controlsRef,
}) => {
  const dimmed = Boolean(selectedId || revealedId);

  return (
    <>
      <MapControls
        ref={controlsRef}
        enableRotate={false}
        enableDamping
        dampingFactor={0.08}
        screenSpacePanning
        zoomSpeed={0.9}
        panSpeed={0.9}
        minZoom={cameraZoom * (isMobile ? 0.7 : 0.8)}
        maxZoom={cameraZoom * (isMobile ? 2.2 : 1.9)}
      />

      <BackdropPlane visible={dimmed} />
      <AnimatedBackground dimmed={dimmed} isMobile={isMobile} />

      {gifts.map((gift) => (
        <GiftBox
          key={gift.id}
          gift={gift}
          selected={selectedId === gift.id}
          revealed={revealedId === gift.id}
          dimmed={dimmed}
          onSelect={onSelect}
          onReveal={onReveal}
          isMobile={isMobile}
        />
      ))}

      <ambientLight intensity={1.05} />
      <directionalLight position={[4, 6, 8]} intensity={1.2} />
      <directionalLight position={[-4, -3, 6]} intensity={0.34} />
      <pointLight position={[0, 0, 6]} intensity={0.24} />
    </>
  );
};

const PageCube = () => {
  const { width, height } = useViewportSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;

  const [selectedId, setSelectedId] = useState(null);
  const [revealedId, setRevealedId] = useState(null);
  const [revealedPrize, setRevealedPrize] = useState(null);
  const [giftPrizeHistory, setGiftPrizeHistory] = useState({});
  const [boardKey, setBoardKey] = useState(0);

  const controlsRef = useRef(null);

  const boardConfig = useMemo(() => {
    const rows = 10;
    const cols = 10;
    const spacing = isMobile ? 1.34 : isTablet ? 1.52 : 1.72;
    const totalWidth = (cols - 1) * spacing;
    const totalHeight = (rows - 1) * spacing;

    const computedZoom = clamp(
      Math.min(width / (totalWidth + 7), height / (totalHeight + (isMobile ? 10 : 8))) * 0.95,
      isMobile ? 16 : 20,
      isMobile ? 28 : 46
    );

    return {
      rows,
      cols,
      spacing,
      totalWidth,
      totalHeight,
      zoom: computedZoom,
    };
  }, [width, height, isMobile, isTablet]);

  const gifts = useMemo(() => {
    const items = [];
    const { rows, cols, spacing, totalWidth, totalHeight } = boardConfig;

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
  }, [boardConfig, boardKey]);

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

    requestAnimationFrame(() => {
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    });
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[radial-gradient(circle_at_top,#1d315d_0%,#0c1327_42%,#050816_100%)]">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[-10%] top-[-15%] h-52 w-52 rounded-full bg-fuchsia-500/15 blur-3xl md:h-72 md:w-72 animate-pulse" />
        <div className="absolute right-[-8%] top-[10%] h-60 w-60 rounded-full bg-cyan-400/15 blur-3xl md:h-80 md:w-80 animate-pulse" />
        <div className="absolute bottom-[-15%] left-[20%] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl md:h-96 md:w-96 animate-pulse" />
      </div>

      <Canvas
        orthographic
        camera={{
          zoom: boardConfig.zoom,
          position: [0, 0, 10],
          near: 0.1,
          far: 1000,
        }}
        shadows={false}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene
          gifts={gifts}
          selectedId={selectedId}
          revealedId={revealedId}
          onSelect={handleSelect}
          onReveal={handleReveal}
          isMobile={isMobile}
          cameraZoom={boardConfig.zoom}
          controlsRef={controlsRef}
        />
      </Canvas>

      <div className="pointer-events-none absolute left-1/2 top-3 z-20 w-[calc(100%-20px)] max-w-[680px] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-center text-white shadow-2xl backdrop-blur-md md:top-4 md:px-5">
        <div className="text-[11px] font-extrabold tracking-[0.26em] text-yellow-300 sm:text-xs md:text-sm">
          GIFT GRID
        </div>
        <div className="mt-1 text-[11px] leading-relaxed text-white/80 sm:text-xs md:text-sm">
          1 toque: llevar al centro · 2 toques: abrir regalo
          <span className="hidden md:inline"> · arrastra para mover · zoom con rueda o gesto</span>
        </div>
        <div className="mt-1 text-[10px] text-white/55 md:hidden">
          Arrastra para mover · pellizca para zoom
        </div>
      </div>

      <div className="absolute right-3 top-[90px] z-20 flex flex-col gap-2 md:right-5 md:top-[108px]">
        <button
          onClick={handleResetView}
          className="rounded-xl border border-white/15 bg-black/45 px-3 py-2 text-[11px] font-bold text-white shadow-xl backdrop-blur-md transition hover:scale-[1.02] hover:bg-white/15 md:px-4 md:text-sm"
        >
          Centrar vista
        </button>

        <button
          onClick={handleReset}
          className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold text-white shadow-xl backdrop-blur-md transition hover:scale-[1.02] hover:bg-white/15 md:px-4 md:text-sm"
        >
          Reiniciar
        </button>
      </div>

      {selectedGift && !revealedId && (
        <div className="absolute bottom-4 left-1/2 z-20 w-[calc(100%-20px)] max-w-md -translate-x-1/2 md:bottom-6">
          <div className="rounded-3xl border border-white/15 bg-black/70 px-4 py-4 text-center text-white shadow-2xl backdrop-blur-md md:px-5 md:py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60 md:text-xs">
              Caja #{selectedGift.number}
            </div>
            <div className="mt-2 text-sm font-bold text-yellow-300 md:text-base">
              Dale click otra vez para abrir
            </div>
            <div className="mt-2 text-xs text-white/65 md:hidden">
              También puedes mover y hacer zoom al tablero
            </div>
          </div>
        </div>
      )}

      {revealedId && revealedPrize && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/15 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-black/72 px-6 py-6 text-center text-white shadow-2xl backdrop-blur-md md:px-8 md:py-7">
            <div className="text-5xl md:text-6xl">{revealedPrize.emoji}</div>

            <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60 md:text-xs">
              Ganaste
            </div>

            <div className="mt-2 text-xl font-extrabold text-yellow-300 md:text-2xl">
              {revealedPrize.label}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                onClick={handleClose}
                className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-white/15"
              >
                Cerrar
              </button>

              <button
                onClick={handleReset}
                className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-5 py-3 text-sm font-bold text-yellow-200 transition hover:scale-[1.02] hover:bg-yellow-300/15"
              >
                Reiniciar tablero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageCube;
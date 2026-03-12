import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const DEFAULT_PRIZES = [
  { id: 1, text: "🍩 Donitas", weight: 35, color: "#ff6b6b" },
  { id: 2, text: "🎊 Confeti", weight: 25, color: "#f59e0b" },
  { id: 3, text: "✨ Estrella brillante", weight: 15, color: "#22c55e" },
  { id: 4, text: "🧍 Giorgi", weight: 10, color: "#3b82f6" },
  { id: 5, text: "🔫 Pistola", weight: 7, color: "#ef4444" },
  { id: 6, text: "🌌 Galaxia", weight: 3, color: "#7c3aed" },
  { id: 7, text: "🐋 Ballena", weight: 2, color: "#06b6d4" },
  { id: 8, text: "🦁 Gatito león", weight: 1, color: "#f97316" },
  { id: 9, text: "⚪ Blanco", weight: 1, color: "#e5e7eb" },
  { id: 10, text: "🟡 Dorado", weight: 1, color: "#eab308" },
  { id: 11, text: "🔵 Azul", weight: 1, color: "#2563eb" },
];

const TAU = Math.PI * 2;

function cryptoRandomFloat() {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0] / 4294967296;
}

function normalizePrizes(prizes) {
  const safe = prizes
    .filter((p) => p.text.trim())
    .map((p) => ({
      ...p,
      weight: Number.isFinite(Number(p.weight)) ? Math.max(0, Number(p.weight)) : 0,
      color: p.color || "#64748b",
    }));

  const totalWeight = safe.reduce((sum, item) => sum + item.weight, 0);

  return safe.map((item, index) => ({
    ...item,
    index,
    normalizedPercent: totalWeight > 0 ? (item.weight / totalWeight) * 100 : 0,
  }));
}

function pickWeightedPrize(prizes) {
  const totalWeight = prizes.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight <= 0) {
    return Math.floor(cryptoRandomFloat() * prizes.length);
  }

  const target = cryptoRandomFloat() * totalWeight;

  let acc = 0;
  for (let i = 0; i < prizes.length; i += 1) {
    acc += prizes[i].weight;
    if (target < acc) return i;
  }

  return prizes.length - 1;
}

function drawWheelTexture(prizes, size = 2048) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.47;
  const innerRadius = size * 0.16;
  const segmentAngle = TAU / prizes.length;

  ctx.clearRect(0, 0, size, size);

  // fondo general
  const bgGrad = ctx.createRadialGradient(cx, cy, innerRadius * 0.2, cx, cy, outerRadius);
  bgGrad.addColorStop(0, "#0f172a");
  bgGrad.addColorStop(1, "#020617");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < prizes.length; i += 1) {
    const prize = prizes[i];
    const start = -Math.PI / 2 + i * segmentAngle;
    const end = start + segmentAngle;
    const mid = start + segmentAngle / 2;

    // sector completo sin huecos
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(start) * innerRadius,
      cy + Math.sin(start) * innerRadius
    );
    ctx.arc(cx, cy, outerRadius, start, end, false);
    ctx.lineTo(
      cx + Math.cos(end) * innerRadius,
      cy + Math.sin(end) * innerRadius
    );
    ctx.arc(cx, cy, innerRadius, end, start, true);
    ctx.closePath();

    const grad = ctx.createLinearGradient(
      cx + Math.cos(start) * innerRadius,
      cy + Math.sin(start) * innerRadius,
      cx + Math.cos(mid) * outerRadius,
      cy + Math.sin(mid) * outerRadius
    );
    grad.addColorStop(0, prize.color);
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.fill();

    // borde fino
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = Math.max(2, size * 0.0022);
    ctx.stroke();

    // etiqueta dinámica
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid);

    const textRadius = (innerRadius + outerRadius) / 2;
    ctx.translate(textRadius, 0);
    ctx.rotate(Math.PI / 2);

    const availableArc = segmentAngle * textRadius;
    const maxWidth = Math.max(110, availableArc * 0.82);
    let fontSize = Math.min(54, Math.max(20, availableArc * 0.09));

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    let label = prize.text;
    do {
      ctx.font = `bold ${fontSize}px Arial`;
      if (ctx.measureText(label).width <= maxWidth || fontSize <= 18) break;
      fontSize -= 2;
    } while (fontSize > 18);

    while (ctx.measureText(label).width > maxWidth && label.length > 4) {
      label = `${label.slice(0, -2)}…`;
    }

    // caja suave para legibilidad
    const paddingX = 18;
    const paddingY = 10;
    const textMetrics = ctx.measureText(label);
    const boxWidth = Math.min(maxWidth + paddingX * 2, Math.max(130, textMetrics.width + paddingX * 2));
    const boxHeight = fontSize + paddingY * 2;

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    roundRect(ctx, -boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 18);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }

  // anillo dorado exterior
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, TAU);
  ctx.lineWidth = size * 0.02;
  ctx.strokeStyle = "#facc15";
  ctx.stroke();

  // anillo interior
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, TAU);
  ctx.lineWidth = size * 0.014;
  ctx.strokeStyle = "#facc15";
  ctx.stroke();

  // centro dorado
  const centerGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, innerRadius * 0.9);
  centerGrad.addColorStop(0, "#fde68a");
  centerGrad.addColorStop(1, "#eab308");
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius * 0.78, 0, TAU);
  ctx.fillStyle = centerGrad;
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const PageRuleta3D = () => {
  const [prizesState, setPrizesState] = useState(DEFAULT_PRIZES);
  const [newPrizeText, setNewPrizeText] = useState("");
  const [newPrizeWeight, setNewPrizeWeight] = useState(1);
  const [newPrizeColor, setNewPrizeColor] = useState("#8b5cf6");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);

  const prizes = useMemo(() => normalizePrizes(prizesState), [prizesState]);

  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  const wheelGroupRef = useRef(null);
  const pointerRef = useRef(null);
  const wheelTopMaterialRef = useRef(null);
  const bulbsRef = useRef([]);

  const rotationRef = useRef(0);
  const spinRef = useRef({
    active: false,
    start: 0,
    from: 0,
    to: 0,
    duration: 0,
    winnerIndex: null,
  });

  useEffect(() => {
    if (!mountRef.current || prizes.length === 0) return;

    const mount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111d);
    scene.fog = new THREE.Fog(0x07111d, 14, 30);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      38,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 9.2, 7.4);
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.18);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xffffff, 2.4, 45, Math.PI / 5, 0.38, 1);
    spot.position.set(0, 14, 5);
    spot.castShadow = true;
    spot.shadow.mapSize.width = 2048;
    spot.shadow.mapSize.height = 2048;
    scene.add(spot);

    const fill = new THREE.DirectionalLight(0x93c5fd, 0.8);
    fill.position.set(-8, 6, -4);
    scene.add(fill);

    const warm = new THREE.PointLight(0xfcd34d, 0.9, 25);
    warm.position.set(0, 3, 7);
    scene.add(warm);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(10, 96),
      new THREE.ShadowMaterial({ opacity: 0.28 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.04;
    floor.receiveShadow = true;
    scene.add(floor);

    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(5.0, 5.25, 0.58, 96),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.6,
        roughness: 0.42,
      })
    );
    stage.position.y = 0.06;
    stage.castShadow = true;
    stage.receiveShadow = true;
    scene.add(stage);

    const stageRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.12, 18, 100),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 1,
        roughness: 0.16,
      })
    );
    stageRing.rotation.x = Math.PI / 2;
    stageRing.position.y = 0.36;
    scene.add(stageRing);

    const wheelGroup = new THREE.Group();
    wheelGroup.position.y = 0.55;
    wheelGroupRef.current = wheelGroup;
    scene.add(wheelGroup);

    const outerRadius = 3.45;
    const thickness = 0.35;

    // base lateral
    const wheelBase = new THREE.Mesh(
      new THREE.CylinderGeometry(outerRadius + 0.14, outerRadius + 0.14, thickness, 120),
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        metalness: 0.82,
        roughness: 0.28,
      })
    );
    wheelBase.castShadow = true;
    wheelBase.receiveShadow = true;
    wheelGroup.add(wheelBase);

    // cara superior completa, sin huecos
    const topTexture = drawWheelTexture(prizes, 2048);
    const topMaterial = new THREE.MeshStandardMaterial({
      map: topTexture,
      metalness: 0.08,
      roughness: 0.72,
    });
    wheelTopMaterialRef.current = topMaterial;

    const topDisk = new THREE.Mesh(
      new THREE.CircleGeometry(outerRadius, 180),
      topMaterial
    );
    topDisk.rotation.x = -Math.PI / 2;
    topDisk.position.y = thickness / 2 + 0.002;
    topDisk.receiveShadow = true;
    topDisk.castShadow = false;
    wheelGroup.add(topDisk);

    // tapa inferior sutil
    const bottomDisk = new THREE.Mesh(
      new THREE.CircleGeometry(outerRadius, 180),
      new THREE.MeshStandardMaterial({
        color: 0x0b1220,
        metalness: 0.5,
        roughness: 0.45,
      })
    );
    bottomDisk.rotation.x = Math.PI / 2;
    bottomDisk.position.y = -thickness / 2 - 0.002;
    wheelGroup.add(bottomDisk);

    const pointerGroup = new THREE.Group();
    pointerGroup.position.set(0, 1.18, -(outerRadius + 0.28));
    pointerRef.current = pointerGroup;
    scene.add(pointerGroup);

    const pointer = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.78, 24),
      new THREE.MeshStandardMaterial({
        color: 0xff4d4f,
        metalness: 0.35,
        roughness: 0.3,
      })
    );
    pointer.rotation.x = Math.PI;
    pointer.castShadow = true;
    pointerGroup.add(pointer);

    const pointerBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.2, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.2,
      })
    );
    pointerBase.position.y = 0.24;
    pointerBase.castShadow = true;
    pointerGroup.add(pointerBase);

    const bulbs = [];
    const bulbRadius = 4.18;

    for (let i = 0; i < 28; i += 1) {
      const angle = (i / 28) * TAU;
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xfacc15,
          emissiveIntensity: 0.8,
          roughness: 0.3,
          metalness: 0.1,
        })
      );

      bulb.position.set(
        Math.cos(angle) * bulbRadius,
        0.58,
        Math.sin(angle) * bulbRadius
      );
      scene.add(bulb);
      bulbs.push(bulb);
    }

    bulbsRef.current = bulbs;

    const clock = new THREE.Clock();
    const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      bulbsRef.current.forEach((bulb, i) => {
        const pulse = 0.55 + Math.sin(elapsed * 4 + i * 0.42) * 0.28;
        bulb.material.emissiveIntensity = Math.max(0.25, pulse + 0.3);
      });

      if (pointerRef.current) {
        pointerRef.current.position.y = 1.18 + Math.sin(elapsed * 5) * 0.015;
      }

      if (!spinRef.current.active && wheelGroupRef.current) {
        wheelGroupRef.current.rotation.x = Math.sin(elapsed * 0.7) * 0.008;
        wheelGroupRef.current.rotation.z = Math.cos(elapsed * 0.6) * 0.008;
      }

      if (spinRef.current.active && wheelGroupRef.current) {
        const spin = spinRef.current;
        const progress = Math.min(
          (performance.now() - spin.start) / spin.duration,
          1
        );
        const eased = easeOutQuint(progress);

        rotationRef.current = spin.from + (spin.to - spin.from) * eased;

        wheelGroupRef.current.rotation.y = rotationRef.current;
        wheelGroupRef.current.rotation.x = 0;
        wheelGroupRef.current.rotation.z = 0;

        if (progress >= 1) {
          spinRef.current.active = false;
          setIsSpinning(false);
          setWinner(prizes[spin.winnerIndex]);
        }
      } else if (wheelGroupRef.current) {
        wheelGroupRef.current.rotation.y = rotationRef.current;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
      });

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mount.contains(rendererRef.current.domElement)) {
          mount.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [prizes]);

  useEffect(() => {
    if (!wheelTopMaterialRef.current || prizes.length === 0) return;

    const newTexture = drawWheelTexture(prizes, 2048);
    const oldMap = wheelTopMaterialRef.current.map;

    wheelTopMaterialRef.current.map = newTexture;
    wheelTopMaterialRef.current.needsUpdate = true;

    if (oldMap) oldMap.dispose();
  }, [prizes]);

  const handleSpin = () => {
    if (spinRef.current.active || prizes.length === 0) return;

    setWinner(null);
    setIsSpinning(true);

    const winnerIndex = pickWeightedPrize(prizes);

    const segmentAngle = TAU / prizes.length;
    const centerAngle =
      winnerIndex * segmentAngle - Math.PI / 2 + segmentAngle / 2;

    const extraTurns = 6 + Math.floor(cryptoRandomFloat() * 4);
    const safeOffsetRange = segmentAngle / 2 - 0.03;
    const microOffset =
      (cryptoRandomFloat() - 0.5) * Math.max(0.02, safeOffsetRange);

    const current = rotationRef.current;
    let target = -centerAngle + extraTurns * TAU + microOffset;

    while (target <= current + TAU * 2) {
      target += TAU;
    }

    spinRef.current = {
      active: true,
      start: performance.now(),
      from: current,
      to: target,
      duration: 5600 + cryptoRandomFloat() * 1200,
      winnerIndex,
    };
  };

  const updatePrize = (id, key, value) => {
    setPrizesState((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: key === "weight" ? Number(value) : value,
            }
          : item
      )
    );
  };

  const removePrize = (id) => {
    setPrizesState((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  const addPrize = () => {
    const text = newPrizeText.trim();
    if (!text) return;

    setPrizesState((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        weight: Math.max(0, Number(newPrizeWeight) || 1),
        color: newPrizeColor || "#8b5cf6",
      },
    ]);

    setNewPrizeText("");
    setNewPrizeWeight(1);
    setNewPrizeColor("#8b5cf6");
  };

  const resetDefaults = () => {
    setPrizesState(DEFAULT_PRIZES);
    setWinner(null);
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#0f172a_35%,_#020617_100%)] px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:px-8 md:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300">
                RULETA 3D DINÁMICA
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                🎡 Ruleta sin huecos negros
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
                Diseño visual limpio, premios y colores dinámicos, lógica de probabilidad
                separada y selección con{" "}
                <span className="font-semibold text-white/85">
                  crypto.getRandomValues()
                </span>.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white/80">
                <span className="block text-xs uppercase tracking-widest text-white/40">
                  Estado
                </span>
                <span className="text-sm font-semibold">
                  {isSpinning ? "Girando" : "Listo"}
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white/80">
                <span className="block text-xs uppercase tracking-widest text-white/40">
                  Premios
                </span>
                <span className="text-sm font-semibold">{prizes.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-3 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.4)] md:p-5">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-3 md:p-4">
              <div
                ref={mountRef}
                className="h-[430px] w-full overflow-hidden rounded-[22px] md:h-[640px]"
              />
            </div>

            <div className="mt-4 flex flex-col gap-4 md:mt-5 md:flex-row md:items-center md:justify-between">
              <div className="min-h-[72px] flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                {winner ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                      Resultado
                    </span>
                    <span className="text-lg font-extrabold text-white md:text-2xl">
                      🎉 Ganaste <span className="text-yellow-300">{winner.text}</span>
                    </span>
                    <span className="text-xs text-white/45 md:text-sm">
                      Peso: {winner.weight}% · Normalizado: {winner.normalizedPercent.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex h-full items-center text-sm text-white/55 md:text-base">
                    Edita premios, colores y pesos en el panel derecho y luego gira la ruleta.
                  </div>
                )}
              </div>

              <button
                onClick={handleSpin}
                disabled={isSpinning || prizes.length === 0}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-base font-black text-slate-950 shadow-[0_18px_40px_rgba(251,191,36,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:px-10 md:text-lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500" />
                <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_55%)]" />
                <span className="relative z-10">
                  {isSpinning ? "⏳ Girando..." : "🎯 Girar ruleta"}
                </span>
              </button>
            </div>
          </div>

          <aside className="rounded-[30px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.35)] md:p-5">
            <div className="mb-4">
              <h2 className="text-xl font-black text-white">Editor dinámico</h2>
              <p className="mt-1 text-sm text-white/55">
                Aquí puedes cambiar nombres, colores y pesos, o agregar premios nuevos.
              </p>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {prizesState.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                      Premio {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePrize(item.id)}
                      className="rounded-lg border border-red-400/20 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                    >
                      Quitar
                    </button>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updatePrize(item.id, "text", e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                      placeholder="Nombre del premio"
                    />

                    <div className="grid grid-cols-[1fr_92px] gap-2">
                      <input
                        type="number"
                        min="0"
                        value={item.weight}
                        onChange={(e) => updatePrize(item.id, "weight", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                        placeholder="Peso"
                      />
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => updatePrize(item.id, "color", e.target.value)}
                        className="h-[42px] w-full rounded-xl border border-white/10 bg-slate-950/70 p-1"
                      />
                    </div>

                    <div className="text-xs text-white/45">
                      Real: {normalizePrizes(prizesState).find((p) => p.id === item.id)?.normalizedPercent.toFixed(2) || "0.00"}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="text-sm font-bold text-white">Agregar premio</h3>

              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={newPrizeText}
                  onChange={(e) => setNewPrizeText(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                  placeholder="Nuevo premio"
                />

                <div className="grid grid-cols-[1fr_92px] gap-2">
                  <input
                    type="number"
                    min="0"
                    value={newPrizeWeight}
                    onChange={(e) => setNewPrizeWeight(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                    placeholder="Peso"
                  />
                  <input
                    type="color"
                    value={newPrizeColor}
                    onChange={(e) => setNewPrizeColor(e.target.value)}
                    className="h-[42px] w-full rounded-xl border border-white/10 bg-slate-950/70 p-1"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addPrize}
                    className="flex-1 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={resetDefaults}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white hover:bg-white/10"
                  >
                    Default
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Importante
              </span>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                El diseño visual de la ruleta es uniforme. La probabilidad real depende del peso de cada premio.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PageRuleta3D;
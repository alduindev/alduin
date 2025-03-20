import React, { useRef, useEffect, useState } from "react";

const CANVAS_SIZE = 450;
const LEVELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const SUBLEVELS = 9;
const COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-gray-500",
  "bg-teal-500",
];

const IMAGE_SOURCES = {
  A: [
    {
      type: "animal",
      url: "https://picsum.photos/450/450?random&category=animals",
    },
  ],
  B: [
    {
      type: "animal",
      url: "https://picsum.photos/450/450?random&category=animals",
    },
  ],
  C: [
    {
      type: "animal",
      url: "https://picsum.photos/450/450?random&category=animals",
    },
  ],
  D: [{ type: "album", url: "https://via.assets.so/album.png?id=" }],
  E: [{ type: "album", url: "https://via.assets.so/album.png?id=" }],
  F: [{ type: "album", url: "https://via.assets.so/album.png?id=" }],
  G: [{ type: "game", url: "https://via.assets.so/game.png?id=" }],
  H: [{ type: "game", url: "https://via.assets.so/game.png?id=" }],
  I: [{ type: "game", url: "https://via.assets.so/game.png?id=" }],
};

const UIPuzzleGame = () => {
  const canvasRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSublevel, setSelectedSublevel] = useState(null);
  const [gridSize, setGridSize] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(gridSize * gridSize - 1);
  const [gameWon, setGameWon] = useState(false);
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [progress, setProgress] = useState({});
  const [timer, setTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const savedProgress =
      JSON.parse(localStorage.getItem("puzzleProgress")) || {};
    setProgress(savedProgress);
  }, []);

  useEffect(() => {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    if ((currentHour >= 18 && currentMinute >= 30) || currentHour < 5) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const pauseGame = () => {
    setIsPaused(true);
    clearInterval(timer);
  };

  const resumeGame = () => {
    setIsPaused(false);
    startTimer();
  };

  useEffect(() => {
    if (selectedSublevel) {
      fetchRandomImage();
    }
  }, [selectedSublevel]);

  const fetchRandomImage = () => {
    setIsLoading(true);

    if (!selectedLevel || !selectedSublevel) {
      console.error("Error: Nivel o subnivel no seleccionados");
      setIsLoading(false);
      return;
    }

    const baseImage = IMAGE_SOURCES[selectedLevel]?.[0]; // Tomamos la única URL base del nivel
    if (!baseImage) {
      console.error(
        `Error: No hay imagen definida para el nivel ${selectedLevel}`
      );
      setIsLoading(false);
      return;
    }

    // Generar URL aleatoria para cada subnivel
    const randomUrl = `${baseImage.url}&random=${selectedSublevel}`;

    const img = new Image();
    img.src = randomUrl;
    img.onload = () => {
      setImageURL(img.src);
      setImage(img);
      drawOriginalImage(img);
      setIsLoading(false);
    };

    img.onerror = () => {
      console.error("Error: No se pudo cargar la imagen", randomUrl);
      setIsLoading(false);
    };
  };

  const drawOriginalImage = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  };

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);

    if (["A", "B", "C"].includes(level)) {
      setGridSize(3);
    } else if (["D", "E", "F"].includes(level)) {
      setGridSize(4);
    } else if (["G", "H", "I"].includes(level)) {
      setGridSize(5);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setElapsedTime(0);
    initializePuzzle(image);
    startTimer();
  };

  const startTimer = () => {
    const startTime = Date.now() - elapsedTime * 1000;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimer(interval);
  };

  const stopTimer = () => {
    clearInterval(timer);
  };

  const initializePuzzle = (img) => {
    const pieceSize = CANVAS_SIZE / gridSize;
    let tiles = Array.from({ length: gridSize * gridSize }, (_, i) => i);

    do {
      tiles = shuffleArray([...tiles]);
    } while (!isSolvable(tiles));

    setPieces(tiles);
    setEmptyIndex(tiles.indexOf(gridSize * gridSize - 1));
    drawPuzzle(img, tiles, pieceSize);
  };

  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const isSolvable = (numbers) => {
    let inversions = 0;
    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        if (
          numbers[i] !== gridSize * gridSize - 1 &&
          numbers[j] !== gridSize * gridSize - 1 &&
          numbers[i] > numbers[j]
        ) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const drawPuzzle = (img, tiles, pieceSize) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    tiles.forEach((tile, index) => {
      if (tile === gridSize * gridSize - 1) return;

      const sx = (tile % gridSize) * (img.width / gridSize);
      const sy = Math.floor(tile / gridSize) * (img.height / gridSize);

      const dx = (index % gridSize) * pieceSize;
      const dy = Math.floor(index / gridSize) * pieceSize;

      ctx.drawImage(
        img,
        sx,
        sy,
        img.width / gridSize,
        img.height / gridSize,
        dx,
        dy,
        pieceSize,
        pieceSize
      );
      ctx.strokeStyle = "black";
      ctx.strokeRect(dx, dy, pieceSize, pieceSize);
    });
  };

  const moveTile = (index) => {
    if (!gameStarted || isPaused) return;

    const neighbors = getMovableTiles(index);
    if (!neighbors.includes(emptyIndex)) return;

    const newTiles = [...pieces];
    [newTiles[index], newTiles[emptyIndex]] = [
      newTiles[emptyIndex],
      newTiles[index],
    ];
    setPieces(newTiles);
    setEmptyIndex(index);
    drawPuzzle(image, newTiles, CANVAS_SIZE / gridSize);

    if (newTiles.every((tile, i) => tile === i)) {
      stopTimer();
      setGameWon(true);

      const updatedProgress = { ...progress };

      if (!updatedProgress[selectedLevel]) {
        updatedProgress[selectedLevel] = {};
      }

      if (
        !updatedProgress[selectedLevel][selectedSublevel] ||
        elapsedTime < updatedProgress[selectedLevel][selectedSublevel].bestTime
      ) {
        updatedProgress[selectedLevel][selectedSublevel] = {
          completed: true,
          bestTime: elapsedTime,
        };
      }

      localStorage.setItem("puzzleProgress", JSON.stringify(updatedProgress));
      setProgress(updatedProgress);
    }
  };

  const [expandedLevels, setExpandedLevels] = useState({});

  const toggleLevel = (level) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const getMovableTiles = (index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const moves = [];

    if (row > 0) moves.push(index - gridSize);
    if (row < gridSize - 1) moves.push(index + gridSize);
    if (col > 0) moves.push(index - 1);
    if (col < gridSize - 1) moves.push(index + 1);

    return moves;
  };

  const goBack = () => {
    setGameStarted(false);
    setSelectedSublevel(null);
    setGameWon(false);
    setElapsedTime(0);
    clearInterval(timer);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-all duration-700 ${
        isDarkMode
          ? "bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white"
          : "bg-gradient-to-b from-white via-gray-100 to-gray-300 text-gray-900"
      }`}
      style={{ overflow: "hidden" }}
    >
      {Object.keys(progress).length > 0 && (
        <button
          onClick={() => setShowModal(true)}
          className="lg:absolute top-6 md:right-6 p-2 lg:mt-0 mt-2 bg-gray-200 text-white rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          <img
            src="assets/icon/ico_gear.svg"
            alt="Configuración"
            className="lg:w-8 w-4 lg:h-8 h-4"
          />
        </button>
      )}

      <h1 className="lg:text-[4rem] text-[3rem] max-w-full text-center">
        MAGICPUZZLE
      </h1>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center text-green-900 xl:w-auto w-[90%]">
            <h2 className="text-2xl font-bold mb-4">Puntuación</h2>
            <div className="w-full max-h-[400px] h-[400px] overflow-x-auto overflow-y-auto">
              <table className="w-full border-collapse border border-gray-300 text-center">
                <thead className="sticky top-0 bg-gray-200 z-10">
                  <tr>
                    <th className="p-2 border border-gray-300">Nivel</th>
                    <th className="p-2 border border-gray-300">Subnivel</th>
                    <th className="p-2 border border-gray-300">Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(progress).map(([level, sublevels]) => (
                    <React.Fragment key={level}>
                      <tr
                        onClick={() => toggleLevel(level)}
                        className="cursor-pointer bg-gray-100 hover:bg-gray-300 transition-colors"
                      >
                        <td
                          className="p-2 border border-gray-300 font-bold"
                          colSpan={3}
                        >
                          {expandedLevels[level] ? "▼" : "▶"} Nivel {level}
                        </td>
                      </tr>
                      {expandedLevels[level] &&
                        Object.entries(sublevels).map(([sublevel, data]) => (
                          <tr key={`${level}-${sublevel}`} className="bg-white">
                            <td className="p-2 border border-gray-300">
                              {level}
                            </td>
                            <td className="p-2 border border-gray-300">
                              {sublevel}
                            </td>
                            <td className="p-2 border border-gray-300">
                              {data.bestTime
                                ? `${data.bestTime}s`
                                : "No completado"}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg mr-2"
              onClick={() => {
                localStorage.removeItem("puzzleProgress");
                setProgress({});
              }}
            >
              Reiniciar
            </button>

            <button
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {!selectedLevel ? (
        <div className="py-4">
          <div className="grid grid-cols-3 gap-4">
            {LEVELS.map((level, i) => {
              const isUnlocked =
                i === 0 || progress[LEVELS[i - 1]]?.[SUBLEVELS];
              return (
                <button
                  key={level}
                  className={`xl:p-6 p-3 py-6 text-white font-bold text-lg ${
                    isUnlocked ? COLORS[i] : "bg-gray-400 cursor-not-allowed"
                  } rounded-lg`}
                  onClick={() => isUnlocked && handleSelectLevel(level)}
                  disabled={!isUnlocked}
                >
                  Nivel {level}
                </button>
              );
            })}
          </div>
        </div>
      ) : !selectedSublevel ? (
        <div className="py-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: SUBLEVELS }, (_, i) => {
              const isUnlocked = i === 0 || progress[selectedLevel]?.[i];
              return (
                <button
                  key={i}
                  className={`p-6 px-[2rem] text-white font-bold rounded-lg ${
                    isUnlocked
                      ? "bg-green-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => isUnlocked && setSelectedSublevel(i + 1)}
                  disabled={!isUnlocked}
                >
                  {selectedLevel}
                  {i + 1}
                </button>
              );
            })}
          </div>
          <button
            className="mt-4 px-6 py-2 bg-orange-600 text-white font-bold rounded-lg w-full"
            onClick={() => setSelectedLevel(null)}
          >
            Volver
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold">
            {selectedLevel} {selectedSublevel}
          </h2>
          <p className="md:text-[2rem] text-[1rem] font-semibold">
            ⏱{elapsedTime}s
          </p>
          {isLoading ? (
            <div className="w-[10rem] h-[10rem] flex flex-col items-center justify-center m-6">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-500 text-sm font-semibold">
                Descargando imagen...
              </p>
            </div>
          ) : (
            <img
              src={imageURL}
              alt="Referencia"
              className="xl:w-[10rem] w-[10rem] h-auto border border-black rounded mb-4"
            />
          )}

          {gameWon && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#ffffff3f] bg-opacity-90 text-center p-6 rounded-lg shadow-lg z-10">
              <h2 className="text-3xl font-bold text-green-600">
                🎉 ¡FELICIDADES! 🎉
              </h2>
              <button
                onClick={() => {
                  if (selectedSublevel < SUBLEVELS) {
                    setSelectedSublevel(selectedSublevel + 1);
                    setGameWon(false);
                    setGameStarted(false);
                  } else {
                    setSelectedLevel(null);
                    setSelectedSublevel(null);
                  }
                }}
                className="mt-4 px-6 py-3 font-bold bg-green-600 text-white rounded-lg shadow-lg hover:scale-105 transition"
              >
                {selectedSublevel < SUBLEVELS
                  ? "Siguiente Subnivel"
                  : "Volver al Menú"}
              </button>
            </div>
          )}
          {gameStarted && (
            <div className="md:w-[20%] w-[90%] ">
              <button
                onClick={isPaused ? resumeGame : pauseGame}
                className="px-6 py-2 font-bold bg-yellow-500 text-white rounded-lg w-full"
              >
                {isPaused ? "Reanudar" : "Pausar"}
              </button>
            </div>
          )}

          {!gameStarted && (
            <div className="flex items-center justify-around md:w-[20%] w-[90%] gap-4">
              <button
                onClick={() => {
                  if (progress[selectedLevel]?.[selectedSublevel]?.bestTime) {
                    const updatedProgress = { ...progress };
                    delete updatedProgress[selectedLevel][selectedSublevel];
                    localStorage.setItem(
                      "puzzleProgress",
                      JSON.stringify(updatedProgress)
                    );
                    setProgress(updatedProgress);
                    setGameStarted(false);
                    setGameWon(false);
                    setElapsedTime(0);
                  } else {
                    startGame();
                  }
                }}
                className="px-6 py-2 font-bold bg-green-600 text-white rounded-lg w-full"
              >
                {progress[selectedLevel]?.[selectedSublevel]?.bestTime
                  ? "Reiniciar"
                  : "Jugar"}
              </button>

              <button
                className="px-4 py-2 font-bold bg-orange-600 text-white rounded-lg w-full"
                onClick={goBack}
              >
                Volver
              </button>
            </div>
          )}
          <div className="relative scale-90">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75 rounded-md">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-white text-sm font-semibold">
                  Cargando puzzle...
                </p>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="border border-black bg-gray-700 w-full min-w-[300px] aspect-square"
              onClick={(e) => {
                const rect = canvasRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const pieceSize = rect.width / gridSize;
                const col = Math.floor(x / pieceSize);
                const row = Math.floor(y / pieceSize);
                moveTile(row * gridSize + col);
              }}
            />
          </div>
        </>
      )}

      <div
        className={`relative w-14 h-7 flex items-center bg-gray-400 rounded-full p-1 cursor-pointer transition-all duration-500 ${
          isDarkMode ? "bg-gray-800" : "bg-gray-300"
        }`}
        onClick={toggleDarkMode}
      >
        <div
          className={`w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-md transform transition-all duration-500 ${
            isDarkMode ? "translate-x-7" : "translate-x-0"
          }`}
        >
          {isDarkMode ? "🌙" : "☀️"}
        </div>
      </div>

      <p className="text-gray-300 mt-4 md:text-[1rem] text-[0.8rem] ">
        V.1.0.2 - Creado con amor
      </p>
    </div>
  );
};

export default UIPuzzleGame;

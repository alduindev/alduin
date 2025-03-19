import React, { useRef, useEffect, useState } from "react";

const CANVAS_WIDTH = 450;
const CANVAS_HEIGHT = 300;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 7;
const BRICK_ROWS = 5;
const BRICK_COLS = 6;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 20;
const PADDLE_SPEED = 15;

const UIBreakout = () => {
  const canvasRef = useRef(null);
  const [paddleX, setPaddleX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const [ball, setBall] = useState({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    dx: 2,
    dy: -2,
  }); 
  const [bricks, setBricks] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    initBricks();
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      const gameLoop = requestAnimationFrame(updateGame);
      return () => cancelAnimationFrame(gameLoop);
    }
  }, [ball, gameStarted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setPaddleX((prev) => Math.max(prev - PADDLE_SPEED, 0));
      } else if (e.key === "ArrowRight") {
        setPaddleX((prev) => Math.min(prev + PADDLE_SPEED, CANVAS_WIDTH - PADDLE_WIDTH));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const initBricks = () => {
    let brickArray = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        brickArray.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          status: 1,
        });
      }
    }
    setBricks(brickArray);
  };

  const updateGame = () => {
    if (gameOver || gameWon) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawBricks(ctx);
    drawPaddle(ctx);
    drawBall(ctx);

    let newBall = { ...ball };
    newBall.x += newBall.dx;
    newBall.y += newBall.dy;

    if (newBall.x + BALL_RADIUS > CANVAS_WIDTH || newBall.x - BALL_RADIUS < 0) {
      newBall.dx = -newBall.dx;
    }

    if (newBall.y - BALL_RADIUS < 0) {
      newBall.dy = -newBall.dy;
    } else if (newBall.y + BALL_RADIUS > CANVAS_HEIGHT - PADDLE_HEIGHT) {
      if (newBall.x > paddleX && newBall.x < paddleX + PADDLE_WIDTH) {
        newBall.dy = -newBall.dy;
      } else {
        setGameOver(true);
        return;
      }
    }

    let updatedBricks = bricks.map((brick) => {
      if (
        brick.status === 1 &&
        newBall.x > brick.x &&
        newBall.x < brick.x + BRICK_WIDTH &&
        newBall.y > brick.y &&
        newBall.y < brick.y + BRICK_HEIGHT
      ) {
        newBall.dy = -newBall.dy;
        setScore((prevScore) => prevScore + 10);
        return { ...brick, status: 0 };
      }
      return brick;
    });

    setBricks(updatedBricks);

    if (updatedBricks.every((brick) => brick.status === 0)) {
      setGameWon(true);
      return;
    }

    setBall(newBall);
  };

  const drawBricks = (ctx) => {
    bricks.forEach((brick) => {
      if (brick.status === 1) {
        ctx.fillStyle = "#3498db";
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
    });
  };

  const drawPaddle = (ctx) => {
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
  };

  const drawBall = (ctx) => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    ctx.closePath();
  };

  const handleTouchMove = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let touchX = e.touches[0].clientX - rect.left;
    let newPaddleX = touchX - PADDLE_WIDTH / 2;

    if (newPaddleX < 0) newPaddleX = 0;
    if (newPaddleX + PADDLE_WIDTH > CANVAS_WIDTH) newPaddleX = CANVAS_WIDTH - PADDLE_WIDTH;

    requestAnimationFrame(() => setPaddleX(newPaddleX));
};

const handleTouchStart = (e) => {
    e.preventDefault(); // Evita el comportamiento no deseado en móviles
    handleTouchMove(e); // Asegura que el primer toque ya mueva el paddle correctamente
};

  const startGame = () => {
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 2, dy: -2 });
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);
    initBricks();
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-4">

      {gameStarted ? (
        <>
          <div className="text-blue-600 font-bold text-xl">🔢 Puntuación: {score}</div>

          {gameWon && <div className="text-green-600 font-bold text-xl">🎉 ¡Ganaste! 🎉</div>}
          {gameOver && <div className="text-red-600 font-bold text-xl">💥 ¡Perdiste! 💥</div>}

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border border-black bg-gray-900 scale-75"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          ></canvas>

          {(gameOver || gameWon) && (
            <button onClick={startGame} className="px-6 py-2 font-bold text-gray-800 bg-gray-300 rounded-lg shadow-md">
              Reiniciar
            </button>
          )}
        </>
      ) : (
        <button onClick={startGame} className="px-6 py-2 font-bold text-gray-800 bg-gray-300 rounded-lg shadow-md">
          Start Game
        </button>
      )}
    </div>
  );
};

export default UIBreakout;

import { useState, useEffect } from 'react'

const EMOJI_POOL = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🥳',
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🎈', '🎉', '🎮', '🎲', '🧸', '🎁', '💎', '⚽️', '🏀', '🏈', '⚾️', '🥎', '🎯', '🚗', '🚕', '🚙', '🚓', '✈️', '🚀', '🛸'
]

const getRandomEmoji = () => {
  return EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)]
}

const generateEmoticons = (count = 8) => {
  const uniqueEmojis = new Set()
  while (uniqueEmojis.size < count) {
    uniqueEmojis.add(getRandomEmoji())
  }
  return Array.from(uniqueEmojis)
}

const EMOTICONS = generateEmoticons(8)
const GRID_SIZE = 8

const generateBoard = () => {
  const board = []
  for (let row = 0; row < GRID_SIZE; row++) {
    const newRow = []
    for (let col = 0; col < GRID_SIZE; col++) {
      newRow.push(EMOTICONS[Math.floor(Math.random() * EMOTICONS.length)])
    }
    board.push(newRow)
  }
  return board
}

const checkForMatches = (board) => {
  const matches = {}

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 2; col++) {
      if (
        board[row][col] === board[row][col + 1] &&
        board[row][col] === board[row][col + 2]
      ) {
        matches[`${row}-${col}`] = true
        matches[`${row}-${col + 1}`] = true
        matches[`${row}-${col + 2}`] = true
      }
    }
  }

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE - 2; row++) {
      if (
        board[row][col] === board[row + 1][col] &&
        board[row][col] === board[row + 2][col]
      ) {
        matches[`${row}-${col}`] = true
        matches[`${row + 1}-${col}`] = true
        matches[`${row + 2}-${col}`] = true
      }
    }
  }

  return matches
}

const clearMatches = (board, matches) => {
  const newBoard = board.map((row) => [...row])
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (matches[`${row}-${col}`]) {
        newBoard[row][col] = ''
      }
    }
  }
  return newBoard
}

const fillBoard = (board) => {
  const newBoard = board.map((row) => [...row])
  for (let col = 0; col < GRID_SIZE; col++) {
    let emptyCells = 0
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col] === '') {
        emptyCells++
      } else if (emptyCells > 0) {
        newBoard[row + emptyCells][col] = newBoard[row][col]
        newBoard[row][col] = ''
      }
    }
    for (let row = 0; row < emptyCells; row++) {
      newBoard[row][col] = EMOTICONS[Math.floor(Math.random() * EMOTICONS.length)]
    }
  }
  return newBoard
}

const ThemeToggleButton = ({ theme, toggleTheme }) => (
  <button
    className="flex items-center px-4 py-2 bg-transparent border border-gray-300 rounded hover:bg-gray-100"
    onClick={toggleTheme}
  >
    {theme === 'light' ? (
      <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    
    ) : (
      <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    )}
  </button>
)

const LevelButton = ({ level, selectedLevel, completedSublevels, handleLevelSelect }) => (
  <button
    className={`px-4 py-2 rounded hover:bg-orange-600 ${level === 'A' || Array.from({ length: 9 }).some((_, i) => completedSublevels.has(`${level}${i + 1}`))
      ? 'bg-orange-500 text-white'
      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
      }`}
    onClick={() => handleLevelSelect(level)}
    disabled={level !== 'A' && !Array.from({ length: 9 }).some((_, i) => completedSublevels.has(`${level}${i + 1}`))}
  >
    {level}
  </button>
)

const SublevelButton = ({ sublevel, completedSublevels, isSublevelUnlocked, handleSublevelSelect }) => (
  <button
    key={sublevel}
    className={`px-4 py-2 rounded hover:bg-orange-600 ${isSublevelUnlocked(sublevel)
      ? completedSublevels.has(sublevel) ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
      }`}
    onClick={() => handleSublevelSelect(sublevel)}
    disabled={!isSublevelUnlocked(sublevel)}
  >
    {sublevel}
  </button>
)

const Cell = ({ row, col, cell, selected, swapAnimation, handleCellClick, isAnimating, isMatched }) => {
  const isSwappingFrom = swapAnimation?.from.row === row && swapAnimation?.from.col === col
  const isSwappingTo = swapAnimation?.to.row === row && swapAnimation?.to.col === col

  return (
    <div
      key={`${row}-${col}`}
      className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-transform duration-300 ${isSwappingFrom ? 'transform translate-x-5' : isSwappingTo ? 'transform -translate-x-5' : ''
        } ${getEmoticonColor(cell)} ${isAnimating ? 'opacity-50' : ''}`}
      onClick={() => handleCellClick(row, col)}
    >
      {cell}
    </div>
  )
}

const getEmoticonColor = (emoticon) => {
  const colorClasses = [
    'bg-yellow-200',
    'bg-red-200',
    'bg-pink-200',
    'bg-blue-200',
    'bg-green-200',
    'bg-purple-200',
    'bg-orange-200',
    'bg-teal-200',
  ]

  const index = EMOTICONS.indexOf(emoticon)
  return index !== -1 ? colorClasses[index % colorClasses.length] : 'bg-gray-200'
}


export default function UIMatchStickPuzzle() {
  const [currentView, setCurrentView] = useState('levels')
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedSublevel, setSelectedSublevel] = useState(null)
  const [board, setBoard] = useState(generateBoard())
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [selected, setSelected] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [swapAnimation, setSwapAnimation] = useState(null)
  const [gameMode, setGameMode] = useState('normal')
  const [completedSublevels, setCompletedSublevels] = useState(new Set())
  const [isGameOver, setIsGameOver] = useState(false)
  const [isGameWon, setIsGameWon] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      const currentHour = new Date().getHours()
      const initialTheme = (currentHour >= 18.5 || currentHour < 5) ? 'dark' : 'light'
      setTheme(initialTheme)
      document.documentElement.setAttribute('data-theme', initialTheme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const savedProgress = localStorage.getItem('progressMATCH')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setCompletedSublevels(new Set(Object.keys(progress).flatMap(level => Object.keys(progress[level]).filter(sublevel => progress[level][sublevel].complete))))
    }
  }, [])

  useEffect(() => {
    if (isAnimating) return

    const matches = checkForMatches(board)
    if (Object.keys(matches).length > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        const newBoard = clearMatches(board, matches)
        setBoard(newBoard)
        setScore(score + Object.keys(matches).length)
        setTimeout(() => {
          const filledBoard = fillBoard(newBoard)
          setBoard(filledBoard)
          setIsAnimating(false)
        }, 500)
      }, 300)
    }
  }, [board, score, isAnimating])

  const handleCellClick = (row, col) => {
    if (isGameOver) return

    if (selected) {
      const { row: selectedRow, col: selectedCol } = selected
      const dx = Math.abs(row - selectedRow)
      const dy = Math.abs(col - selectedCol)

      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        const newBoard = board.map((r) => [...r])
        newBoard[selectedRow][selectedCol] = board[row][col]
        newBoard[row][col] = board[selectedRow][selectedCol]
        setBoard(newBoard)
        setSwapAnimation({ from: { row: selectedRow, col: selectedCol }, to: { row, col } })
        setSelected(null)
        setMoves(moves + 1)
      } else {
        setSelected({ row, col })
      }
    } else {
      setSelected({ row, col })
    }
  }

  useEffect(() => {
    if (swapAnimation) {
      const matches = checkForMatches(board)
      if (Object.keys(matches).length === 0) {
        setTimeout(() => {
          const newBoard = board.map((r) => [...r])
          newBoard[swapAnimation.from.row][swapAnimation.from.col] = board[swapAnimation.to.row][swapAnimation.to.col]
          newBoard[swapAnimation.to.row][swapAnimation.to.col] = board[swapAnimation.from.row][swapAnimation.from.col]
          setBoard(newBoard)
          setSwapAnimation(null)
        }, 300)
      } else {
        setSwapAnimation(null)
      }
    }
  }, [swapAnimation, board])

  const handleLevelSelect = (level) => {
    setSelectedLevel(level)
    setCurrentView('sublevels')
  }

  const handleSublevelSelect = (sublevel) => {
    setSelectedSublevel(sublevel)
    setCurrentView('game')
    setBoard(generateBoard())
    setScore(0)
    setMoves(0)
    setGameMode(getGameMode(sublevel))
    setIsGameOver(false)
    setIsGameWon(false)
  }

  const getGameMode = (sublevel) => {
    switch (sublevel) {
      case 'A1':
      case 'A2':
      case 'A3':
        return 'normal'
      case 'A4':
      case 'A5':
      case 'A6':
        return 'special'
      case 'A7':
      case 'A8':
      case 'A9':
        return 'evolution'
      default:
        return 'normal'
    }
  }

  const isSublevelUnlocked = (sublevel) => {
    const level = sublevel[0]
    const sublevelNumber = parseInt(sublevel[1], 10)

    if (sublevelNumber === 1) {
      return true
    }

    for (let i = 1; i < sublevelNumber; i++) {
      if (!completedSublevels.has(`${level}${i}`)) {
        return false
      }
    }

    return true
  }

  const handleSublevelCompletion = () => {
    if (selectedSublevel) {
      setCompletedSublevels(new Set([...completedSublevels, selectedSublevel]))
      const savedProgress = localStorage.getItem('progressMATCH')
      const progress = savedProgress ? JSON.parse(savedProgress) : {}
      if (!progress[selectedSublevel[0]]) {
        progress[selectedSublevel[0]] = {}
      }
      progress[selectedSublevel[0]][selectedSublevel] = { status: true, complete: true, moves: moves }
      localStorage.setItem('progressMATCH', JSON.stringify(progress))
    }
  }

  const scoreThresholds = {
    'A1': 50, 'A2': 100, 'A3': 150, 'A4': 200, 'A5': 250,
    'A6': 300, 'A7': 350, 'A8': 400, 'A9': 450,
  }

  const moveLimits = {
    'A1': 20, 'A2': 25, 'A3': 30, 'A4': 35, 'A5': 40,
    'A6': 45, 'A7': 50, 'A8': 55, 'A9': 60,
  }

  useEffect(() => {
    if (selectedSublevel && score >= scoreThresholds[selectedSublevel]) {
      handleSublevelCompletion()
      setIsGameOver(true)
      setIsGameWon(true)
    } else if (selectedSublevel && moves >= moveLimits[selectedSublevel]) {
      setIsGameOver(true)
      setIsGameWon(false)
    }
  }, [score, moves, selectedSublevel])

  const restartGame = () => {
    setBoard(generateBoard())
    setScore(0)
    setMoves(0)
    setIsGameOver(false)
    setIsGameWon(false)
  }

  const closeModal = () => {
    setIsGameOver(false)
    setIsGameWon(false)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-gray-800 text-white'}`}>
      <div className={`p-6 rounded-lg shadow-lg w-full max-w-2xl ${theme === 'light' ? 'bg-white' : 'bg-gray-800 text-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">MATCH-3</h1>
          <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
        </div>
        {currentView === 'levels' && (
          <div>
            <div className="grid grid-cols-3 gap-4">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((level) => (
                <LevelButton
                  key={level}
                  level={level}
                  selectedLevel={selectedLevel}
                  completedSublevels={completedSublevels}
                  handleLevelSelect={handleLevelSelect}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'sublevels' && selectedLevel && (
          <div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => {
                const sublevel = `${selectedLevel}${i + 1}`
                return (
                  <SublevelButton
                    key={sublevel}
                    sublevel={sublevel}
                    completedSublevels={completedSublevels}
                    isSublevelUnlocked={isSublevelUnlocked}
                    handleSublevelSelect={handleSublevelSelect}
                  />
                )
              })}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setCurrentView('levels')}
            >
              Volver
            </button>
          </div>
        )}

        {currentView === 'game' && selectedSublevel && (
          <div>
            <div className="flex justify-between lg:flex-row flex-col lg:items-center mb-4">
              <div className="text-lg font-bold">Puntuación: {score}</div>
              <div className="text-lg font-bold">Nivel: {selectedSublevel}</div>
              <div className="text-lg font-bold">Objetivo: {scoreThresholds[selectedSublevel]}</div>
              <div className="text-lg font-bold">Movimientos: {moves} / {moveLimits[selectedSublevel]}</div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const isMatched = checkForMatches(board)[`${rowIndex}-${colIndex}`]
                  return (
                    <Cell
                      key={`${rowIndex}-${colIndex}`}
                      row={rowIndex}
                      col={colIndex}
                      cell={cell}
                      selected={selected}
                      swapAnimation={swapAnimation}
                      handleCellClick={handleCellClick}
                      isAnimating={isAnimating}
                      isMatched={isMatched}
                    />
                  )
                })
              )}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                onClick={restartGame}
              >
                Reiniciar
                <svg
                  className="ml-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setCurrentView('sublevels')}
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-md ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}>
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">{isGameWon ? 'Level Completed!' : 'Game Over!'}</h2>
                <div className="text-lg font-bold mb-4">
                  {isGameWon ? (
                    <div>
                      <p>Felicidades! 🤞😎</p>
                      <p>Acabas de completar el Nivel {selectedSublevel} con {moves} movimiento! 🙌🙌</p>
                    </div>
                  ) : (
                    <div>
                      <p>¡Inténtalo de nuevo! 😢</p>
                      <p>Has excedido el límite de movimientos. ⛔️🎮</p>
                    </div>

                  )}
                </div>
                <div className="flex justify-between w-full">
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    onClick={restartGame}
                  >
                    Reiniciar
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={() => {
                      closeModal()
                      setCurrentView('sublevels')
                    }}
                  >
                    Volver
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className={`w-full justify-center flex items-center ${theme === 'light' ? 'bg-white' : 'bg-gray-800 text-white'}`}>MATCH-3 - Beta v0.1.2</p>
    </div>

  )
}
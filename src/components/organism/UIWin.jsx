import React, { useState, useEffect } from 'react'

const generateSudokuBoard = (difficulty) => {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0))
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  const isValid = (board, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false
    }

    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) return false
      }
    }

    return true
  }

  const fillBoard = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          numbers.sort(() => Math.random() - 0.5)
          for (const num of numbers) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num
              if (fillBoard(board)) return true
              board[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  fillBoard(board)

  // Remove some numbers to create the puzzle
  const removeNumbers = (board, count) => {
    let removed = 0
    while (removed < count) {
      const row = Math.floor(Math.random() * 9)
      const col = Math.floor(Math.random() * 9)
      if (board[row][col] !== 0) {
        board[row][col] = 0
        removed++
      }
    }
  }

  const difficultyLevels = {
    easy: 30,
    medium: 40,
    hard: 50,
  }

  removeNumbers(board, difficultyLevels[difficulty])

  return board
}

const SudokuGame = () => {
  const [board, setBoard] = useState(generateSudokuBoard('medium'))
  const [selectedCell, setSelectedCell] = useState(null)
  const [inputNumber, setInputNumber] = useState(null)
  const [showLevels, setShowLevels] = useState(false)

  useEffect(() => {
    if (selectedCell && inputNumber) {
      const newBoard = board.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === selectedCell.row && colIndex === selectedCell.col ? inputNumber : cell
        )
      )
      setBoard(newBoard)
      setSelectedCell(null)
      setInputNumber(null)
    }
  }, [selectedCell, inputNumber, board])

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col })
  }

  const handleNumberClick = (num) => {
    setInputNumber(num)
  }

  const isNumberUsed = (num) => {
    return board.some(row => row.includes(num))
  }

  const handleLevelSelect = (difficulty) => {
    setBoard(generateSudokuBoard(difficulty))
    setShowLevels(false)
  }

  return (
    <div className="bg-blue-900 min-h-screen flex flex-col items-center justify-center p-4">
      {showLevels ? (
        <div className="flex flex-col items-center justify-center">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-200 mb-4">Select Level</div>
          <div className="grid grid-cols-3 gap-4">
            <button
              className="bg-blue-700 p-2 sm:p-3 md:p-4 rounded text-white font-bold w-full aspect-square"
              onClick={() => handleLevelSelect('easy')}
            >
              Easy
            </button>
            <button
              className="bg-blue-700 p-2 sm:p-3 md:p-4 rounded text-white font-bold w-full aspect-square"
              onClick={() => handleLevelSelect('medium')}
            >
              Medium
            </button>
            <button
              className="bg-blue-700 p-2 sm:p-3 md:p-4 rounded text-white font-bold w-full aspect-square"
              onClick={() => handleLevelSelect('hard')}
            >
              Hard
            </button>
          </div>
          <button
            className="mt-4 bg-blue-700 p-2 sm:p-3 md:p-4 rounded text-white font-bold w-full aspect-square"
            onClick={() => setShowLevels(false)}
          >
            Back
          </button>
        </div>
      ) : (
        <>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-200 mb-4">Simple</div>
          <div className="grid grid-cols-3 gap-2 mb-4 w-full">
            <button className="bg-blue-700 p-2 sm:p-3 md:p-4 rounded text-white flex items-center justify-center" onClick={() => setShowLevels(true)}>
              <span className="text-2xl sm:text-3xl md:text-4xl">🏠</span>
            </button>
            <div className="col-span-1"></div>
            <button className="bg-blue-700 p-2 sm:p-3 md:p-4 rounded text-white flex items-center justify-center">
              <span className="text-2xl sm:text-3xl md:text-4xl">↻</span>
            </button>
          </div>
          <div className="grid grid-cols-9 gap-1 w-full">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const blockIndex = Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3)
                const isDarkBlock = blockIndex % 2 === 1 // Blocks 1, 3, 5 are light, 2, 4, 6 are dark
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-full aspect-square flex items-center justify-center border border-blue-200 ${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'bg-blue-500' : isDarkBlock ? 'bg-blue-700' : 'bg-blue-200'
                    } ${
                      rowIndex % 3 === 0 && rowIndex !== 0 ? 'border-t-2 border-blue-400' : ''
                    } ${
                      colIndex % 3 === 0 && colIndex !== 0 ? 'border-l-2 border-blue-400' : ''
                    } ${
                      rowIndex % 3 === 2 ? 'border-b-2 border-blue-400' : ''
                    } ${
                      colIndex % 3 === 2 ? 'border-r-2 border-blue-400' : ''
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell !== 0 && <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">{cell}</span>}
                  </div>
                )
              })
            )}
          </div>
          <div className="grid grid-cols-9 gap-2 mt-4 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                className={`w-full aspect-square p-2 sm:p-3 md:p-4 rounded text-white font-bold ${
                  isNumberUsed(num) ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-200'
                }`}
                onClick={() => !isNumberUsed(num) && handleNumberClick(num)}
                disabled={isNumberUsed(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default SudokuGame
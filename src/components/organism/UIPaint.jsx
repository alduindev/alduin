import React, { useState, useEffect } from 'react'

const UIPaint = () => {
  const [cols, setCols] = useState(0)
  const [rows, setRows] = useState(0)

  useEffect(() => {
    const updateGrid = () => {
      const size = 30
      const newCols = Math.floor(window.innerWidth / size)
      const newRows = Math.floor(window.innerHeight / size)
      setCols(newCols)
      setRows(newRows)
    }

    updateGrid()
    window.addEventListener('resize', updateGrid)
    return () => window.removeEventListener('resize', updateGrid)
  }, [])

  return (
    <div className="w-screen h-screen bg-gray-100">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          width: '100%',
          height: '100%',
        }}
      >
        {Array.from({ length: cols * rows }, (_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-300 hover:bg-gray-400 transition-all"
          />
        ))}
      </div>
    </div>
  )
}

export default UIPaint

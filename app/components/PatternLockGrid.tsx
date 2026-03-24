'use client'

import { useState, useRef, useEffect } from 'react'

interface PatternLockGridProps {
  onPatternComplete: (pattern: number[]) => void
  onPatternClear?: () => void
  size?: number
  dotSize?: number
  lineWidth?: number
  activeColor?: string
  inactiveColor?: string
}

export default function PatternLockGrid({
  onPatternComplete,
  onPatternClear,
  size = 3,
  dotSize = 20,
  lineWidth = 4,
  activeColor = '#15803d',
  inactiveColor = '#D1D5DB'
}: PatternLockGridProps) {
  const [pattern, setPattern] = useState<number[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const gridSize = size
  const totalDots = gridSize * gridSize
  const canvasSize = 300
  const spacing = canvasSize / (gridSize + 1)

  // Calculate dot positions
  const getDotPosition = (index: number) => {
    const row = Math.floor(index / gridSize)
    const col = index % gridSize
    return {
      x: spacing * (col + 1),
      y: spacing * (row + 1)
    }
  }

  // Get dot index from position
  const getDotAtPosition = (x: number, y: number): number | null => {
    for (let i = 0; i < totalDots; i++) {
      const pos = getDotPosition(i)
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2))
      if (distance < dotSize) {
        return i
      }
    }
    return null
  }

  // Draw pattern
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Draw dots
    for (let i = 0; i < totalDots; i++) {
      const pos = getDotPosition(i)
      const isActive = pattern.includes(i)

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, dotSize / 2, 0, 2 * Math.PI)
      ctx.fillStyle = isActive ? activeColor : inactiveColor
      ctx.fill()

      // Draw inner circle for active dots
      if (isActive) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, dotSize / 4, 0, 2 * Math.PI)
        ctx.fillStyle = 'white'
        ctx.fill()
      }
    }

    // Draw lines between pattern dots
    if (pattern.length > 0) {
      ctx.beginPath()
      const firstPos = getDotPosition(pattern[0])
      ctx.moveTo(firstPos.x, firstPos.y)

      for (let i = 1; i < pattern.length; i++) {
        const pos = getDotPosition(pattern[i])
        ctx.lineTo(pos.x, pos.y)
      }

      // Draw line to current position if drawing
      if (isDrawing && currentPos) {
        ctx.lineTo(currentPos.x, currentPos.y)
      }

      ctx.strokeStyle = activeColor
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    }
  }

  // Handle touch/mouse start
  const handleStart = (x: number, y: number) => {
    setIsDrawing(true)
    setPattern([])
    if (onPatternClear) onPatternClear()
    
    const dotIndex = getDotAtPosition(x, y)
    if (dotIndex !== null) {
      setPattern([dotIndex])
    }
  }

  // Handle touch/mouse move
  const handleMove = (x: number, y: number) => {
    if (!isDrawing) return

    setCurrentPos({ x, y })

    const dotIndex = getDotAtPosition(x, y)
    if (dotIndex !== null && !pattern.includes(dotIndex)) {
      setPattern(prev => [...prev, dotIndex])
    }
  }

  // Handle touch/mouse end
  const handleEnd = () => {
    setIsDrawing(false)
    setCurrentPos(null)

    if (pattern.length >= 4) {
      onPatternComplete(pattern)
    } else if (pattern.length > 0) {
      // Pattern too short - clear it
      setTimeout(() => {
        setPattern([])
      }, 500)
    }
  }

  // Get canvas coordinates from event
  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * canvasSize,
      y: ((clientY - rect.top) / rect.height) * canvasSize
    }
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY)
    handleStart(coords.x, coords.y)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY)
    handleMove(coords.x, coords.y)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY)
    handleStart(coords.x, coords.y)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY)
    handleMove(coords.x, coords.y)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }

  // Redraw on pattern change
  useEffect(() => {
    draw()
  }, [pattern, isDrawing, currentPos])

  return (
    <div ref={containerRef} style={{ touchAction: 'none', userSelect: 'none' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          maxWidth: '300px',
          height: 'auto',
          cursor: 'pointer',
          border: '2px solid #E5E7EB',
          borderRadius: '12px',
          background: '#F9FAFB'
        }}
      />
      {pattern.length > 0 && pattern.length < 4 && (
        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          color: '#DC2626',
          textAlign: 'center'
        }}>
          Minimaal 4 punten verbinden
        </div>
      )}
    </div>
  )
}


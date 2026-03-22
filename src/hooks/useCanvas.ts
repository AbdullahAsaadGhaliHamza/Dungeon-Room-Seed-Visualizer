import { useCallback, useEffect, useRef, useState } from 'react'
import { getHitRoom, renderGraph, type RenderOptions } from '@/engine/renderer'
import type { DungeonGraph, Room } from '@/types'

interface UseCanvasResult {
  canvasRef: React.RefObject<HTMLCanvasElement>
  hoveredRoom: Room | null
}

export function useCanvas(graph: DungeonGraph | null, opts: Omit<RenderOptions, 'highlightRoomId'>): UseCanvasResult {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null)
  const hoveredIdRef = useRef<number | null>(null)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !graph) return
    renderGraph(canvas, graph, { ...opts, highlightRoomId: hoveredIdRef.current })
  }, [graph, opts])

  useEffect(() => {
    redraw()
  }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!graph) return
      const rect = canvas.getBoundingClientRect()
      const hit = getHitRoom(canvas, e.clientX - rect.left, e.clientY - rect.top, graph)
      const newId = hit?.id ?? null
      if (newId !== hoveredIdRef.current) {
        hoveredIdRef.current = newId
        setHoveredRoom(hit)
        redraw()
      }
    }

    const handleMouseLeave = () => {
      hoveredIdRef.current = null
      setHoveredRoom(null)
      redraw()
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [graph, redraw])

  useEffect(() => {
    const observer = new ResizeObserver(() => redraw())
    if (canvasRef.current) observer.observe(canvasRef.current)
    return () => observer.disconnect()
  }, [redraw])

  return { canvasRef, hoveredRoom }
}

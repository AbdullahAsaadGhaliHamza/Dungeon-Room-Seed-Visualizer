import { useCanvas } from '@/hooks/useCanvas'
import type { DungeonGraph, Room, RoomTypeConfig } from '@/types'

interface Props {
  graph: DungeonGraph | null
  isDark: boolean
  roomTypes: RoomTypeConfig[]
  onHover?: (room: Room | null) => void
  className?: string
}

export function DungeonCanvas({ graph, isDark, roomTypes, onHover, className = '' }: Props) {
  const { canvasRef, hoveredRoom } = useCanvas(graph, { isDark, roomTypes })

  if (onHover) {
    const prev = hoveredRoom
    if (prev !== hoveredRoom) onHover(hoveredRoom)
  }

  return (
    <div className={`relative w-full ${className}`} style={{ height: '420px' }}>
      {!graph && (
        <div className="absolute inset-0 flex items-center justify-center text-stone-400 dark:text-stone-600 font-body italic text-base select-none">
          Enter a seed string above to generate a layout.
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: graph ? 'crosshair' : 'default' }}
      />
    </div>
  )
}

import type { DungeonGraph, Room } from '@/types'

interface Props {
  graph: DungeonGraph | null
  hoveredRoom: Room | null
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-display tracking-widest uppercase text-stone-400 dark:text-stone-500">
        {label}
      </span>
      <span className="text-xl font-body font-light text-stone-800 dark:text-stone-200 tabular-nums">
        {value}
      </span>
    </div>
  )
}

export function StatsBar({ graph, hoveredRoom }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-4 py-3 px-4 rounded-lg
        bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <Stat label="Rooms" value={graph?.rooms.length ?? '–'} />
        <Stat label="Corridors" value={graph?.edges.length ?? '–'} />
        <Stat label="Depth" value={graph?.maxDepth ?? '–'} />
        <Stat label="Loops" value={graph?.loops ?? '–'} />
      </div>

      <div className="h-5 text-sm font-body italic text-stone-500 dark:text-stone-400 px-1 transition-opacity">
        {hoveredRoom ? (
          <>
            <span className="not-italic font-normal text-stone-700 dark:text-stone-300">
              {hoveredRoom.flavor}
            </span>
            {' '}· {hoveredRoom.label} · depth {hoveredRoom.depth} · {hoveredRoom.connections.length} connection{hoveredRoom.connections.length !== 1 ? 's' : ''}
          </>
        ) : graph ? (
          'Hover a room to inspect it.'
        ) : null}
      </div>
    </div>
  )
}

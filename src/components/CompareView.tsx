import { useState } from 'react'
import { DungeonCanvas } from './DungeonCanvas'
import { useDungeon } from '@/hooks/useDungeon'
import type { GeneratorConfig, Room, RoomTypeConfig } from '@/types'

interface PaneProps {
  label: 'A' | 'B'
  isDark: boolean
  roomTypes: RoomTypeConfig[]
  config: Partial<GeneratorConfig>
}

function ComparePane({ label, isDark, roomTypes, config }: PaneProps) {
  const [seed, setSeed] = useState('')
  const [input, setInput] = useState('')
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null)
  const { graph, regenerate, isGenerating } = useDungeon()

  const submit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setSeed(trimmed)
    regenerate(trimmed, config)
  }

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-display
          bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex-shrink-0">
          {label}
        </span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Enter seed..."
          spellCheck={false}
          className="flex-1 min-w-0 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700
            text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500
            font-mono text-sm rounded-md px-3 py-2 outline-none
            focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
        />
        <button
          onClick={submit}
          disabled={!input.trim() || isGenerating}
          className="px-3 py-2 text-xs font-display tracking-wider
            border border-stone-300 dark:border-stone-600
            text-stone-600 dark:text-stone-400
            hover:bg-stone-100 dark:hover:bg-stone-800
            disabled:opacity-40 rounded-md transition-colors flex-shrink-0"
        >
          {isGenerating ? '...' : 'Go'}
        </button>
      </div>

      <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden
        bg-white dark:bg-stone-950">
        <DungeonCanvas
          graph={graph}
          isDark={isDark}
          roomTypes={roomTypes}
          onHover={setHoveredRoom}
          className="!h-64"
        />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ['Rooms', graph?.rooms.length],
          ['Edges', graph?.edges.length],
          ['Depth', graph?.maxDepth],
          ['Loops', graph?.loops],
        ].map(([lbl, val]) => (
          <div key={String(lbl)} className="bg-stone-50 dark:bg-stone-900 rounded-md py-2">
            <div className="text-xs font-display tracking-wider uppercase text-stone-400 dark:text-stone-500">{lbl}</div>
            <div className="text-lg font-body font-light text-stone-700 dark:text-stone-300 tabular-nums">{val ?? '–'}</div>
          </div>
        ))}
      </div>

      {seed && graph && (
        <div className="text-xs font-mono text-stone-400 dark:text-stone-500 truncate">
          {graph.hash}
        </div>
      )}

      <div className="h-4 text-xs font-body italic text-stone-500 dark:text-stone-400 truncate">
        {hoveredRoom ? `${hoveredRoom.flavor} · depth ${hoveredRoom.depth}` : null}
      </div>
    </div>
  )
}

interface CompareViewProps {
  isDark: boolean
  roomTypes: RoomTypeConfig[]
  config: Partial<GeneratorConfig>
}

export function CompareView({ isDark, roomTypes, config }: CompareViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-body italic text-stone-500 dark:text-stone-400">
        Enter two seeds to compare layouts side by side. Useful for catching unintended structural similarities.
      </p>
      <div className="flex flex-col sm:flex-row gap-6">
        <ComparePane label="A" isDark={isDark} roomTypes={roomTypes} config={config} />
        <div className="hidden sm:block w-px bg-stone-200 dark:bg-stone-700 self-stretch" />
        <ComparePane label="B" isDark={isDark} roomTypes={roomTypes} config={config} />
      </div>
    </div>
  )
}

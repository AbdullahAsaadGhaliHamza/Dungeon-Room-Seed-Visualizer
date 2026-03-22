import { useEffect, useRef, useState } from 'react'
import { DungeonCanvas } from '@/components/DungeonCanvas'
import { SeedInput } from '@/components/SeedInput'
import { StatsBar } from '@/components/StatsBar'
import { Legend } from '@/components/Legend'
import { ExportMenu } from '@/components/ExportMenu'
import { ShareButton } from '@/components/ShareButton'
import { ConfigPanel } from '@/components/ConfigPanel'
import { RoomTypeEditor } from '@/components/RoomTypeEditor'
import { CompareView } from '@/components/CompareView'
import { useDungeon } from '@/hooks/useDungeon'
import { useCanvas } from '@/hooks/useCanvas'
import { useTheme } from '@/hooks/useTheme'
import { DEFAULT_CONFIG, DEFAULT_ROOM_TYPES } from '@/engine/defaults'
import { decodeUrlState, pushUrlState } from '@/utils/urlState'
import type { GeneratorConfig, Room, RoomTypeConfig, UrlState } from '@/types'

type Panel = 'none' | 'config' | 'types'
type Mode = 'single' | 'compare'

const EXAMPLE_SEEDS = ['iron_keep_v2', 'catacombs_alpha', 'boss_lair_03', 'sunken_temple', 'maze_seed_7']

export default function App() {
  const { isDark, toggle: toggleTheme } = useTheme()

  const urlState = decodeUrlState()
  const [mode, setMode] = useState<Mode>(urlState.mode === 'compare' ? 'compare' : 'single')
  const [seedInput, setSeedInput] = useState(urlState.seed ?? 'iron_keep_v2')
  const [config, setConfig] = useState<Partial<GeneratorConfig>>({
    ...DEFAULT_CONFIG,
    ...urlState.config,
  })
  const [roomTypes, setRoomTypes] = useState<RoomTypeConfig[]>(DEFAULT_ROOM_TYPES)
  const [panel, setPanel] = useState<Panel>('none')
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null)

  const fullConfig = { ...config, roomTypes }
  const { graph, isGenerating, regenerate } = useDungeon(urlState.seed ?? 'iron_keep_v2')

  const canvasOpts = { isDark, roomTypes }
  const { canvasRef } = useCanvas(graph, canvasOpts)

  const handleSubmit = (seed: string) => {
    regenerate(seed, fullConfig)
    pushUrlState({ mode: 'single', seed, config })
  }

  const handleConfigChange = (patch: Partial<GeneratorConfig>) => {
    const next = { ...config, ...patch }
    setConfig(next)
    if (graph) regenerate(graph.seed, { ...next, roomTypes })
  }

  const getShareState = (): UrlState => ({
    mode: 'single',
    seed: graph?.seed,
    config,
  })

  const togglePanel = (p: Panel) => setPanel(prev => prev === p ? 'none' : p)

  useEffect(() => {
    if (urlState.seed) regenerate(urlState.seed, fullConfig)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display tracking-widest text-stone-900 dark:text-stone-100">
              Dungeon Seed Visualizer
            </h1>
            <p className="text-sm font-body italic text-stone-500 dark:text-stone-400 mt-1">
              Turn any seed string into a room layout graph. Same seed, same layout, always.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="mt-1 text-xs font-mono text-stone-400 dark:text-stone-500
              hover:text-stone-700 dark:hover:text-stone-300 transition-colors flex-shrink-0"
            title="Toggle dark mode"
          >
            {isDark ? '◐ light' : '◑ dark'}
          </button>
        </header>

        <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800 pb-0">
          {(['single', 'compare'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`pb-2 px-1 text-sm font-display tracking-wider capitalize transition-colors border-b-2 -mb-px
                ${mode === m
                  ? 'border-stone-700 dark:border-stone-300 text-stone-800 dark:text-stone-200'
                  : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400'
                }`}
            >
              {m === 'single' ? 'Visualizer' : 'Compare'}
            </button>
          ))}
        </div>

        {mode === 'compare' ? (
          <CompareView isDark={isDark} roomTypes={roomTypes} config={config} />
        ) : (
          <>
            <SeedInput
              value={seedInput}
              onChange={setSeedInput}
              onSubmit={handleSubmit}
              isGenerating={isGenerating}
            />

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-body italic text-stone-400 dark:text-stone-500">examples:</span>
              {EXAMPLE_SEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => { setSeedInput(s); handleSubmit(s) }}
                  className="text-xs font-mono px-2.5 py-1
                    border border-stone-200 dark:border-stone-700
                    text-stone-500 dark:text-stone-400
                    hover:border-stone-400 dark:hover:border-stone-500
                    hover:text-stone-700 dark:hover:text-stone-300
                    rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
                <button
                  onClick={() => togglePanel('config')}
                  className={`px-3 py-1.5 text-xs font-display tracking-wider rounded-md transition-colors
                    border ${panel === 'config'
                      ? 'border-stone-500 dark:border-stone-400 text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800'
                      : 'border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                >
                  Config
                </button>
                <button
                  onClick={() => togglePanel('types')}
                  className={`px-3 py-1.5 text-xs font-display tracking-wider rounded-md transition-colors
                    border ${panel === 'types'
                      ? 'border-stone-500 dark:border-stone-400 text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800'
                      : 'border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                >
                  Room Types
                </button>
              </div>
              <div className="flex gap-2 items-center">
                {graph && (
                  <span className="text-xs font-mono text-stone-400 dark:text-stone-500 hidden sm:block">
                    {graph.hash}
                  </span>
                )}
                <ShareButton getState={getShareState} disabled={!graph} />
                <ExportMenu graph={graph} canvasRef={canvasRef} />
              </div>
            </div>

            {panel === 'config' && (
              <ConfigPanel
                config={config}
                onChange={handleConfigChange}
                onClose={() => setPanel('none')}
              />
            )}

            {panel === 'types' && (
              <RoomTypeEditor
                roomTypes={roomTypes}
                onChange={types => {
                  setRoomTypes(types)
                  if (graph) regenerate(graph.seed, { ...config, roomTypes: types })
                }}
                onClose={() => setPanel('none')}
              />
            )}

            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden
              bg-stone-50 dark:bg-stone-900">
              <DungeonCanvas
                graph={graph}
                isDark={isDark}
                roomTypes={roomTypes}
                onHover={setHoveredRoom}
              />
            </div>

            <StatsBar graph={graph} hoveredRoom={hoveredRoom} />
            <Legend roomTypes={roomTypes} isDark={isDark} />
          </>
        )}

        <footer className="pt-4 border-t border-stone-100 dark:border-stone-800
          flex items-center justify-between text-xs font-body text-stone-400 dark:text-stone-600">
          <span>Dungeon Seed Visualizer · MIT License</span>
          <a
            href="https://github.com/yourusername/dungeon-seed-viz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
          >
            GitHub ↗
          </a>
        </footer>
      </div>
    </div>
  )
}

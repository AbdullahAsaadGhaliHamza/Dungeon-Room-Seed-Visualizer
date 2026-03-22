import { useRef, useState } from 'react'
import { triggerExport } from '@/utils/export'
import type { DungeonGraph } from '@/types'

interface Props {
  graph: DungeonGraph | null
  canvasRef: React.RefObject<HTMLCanvasElement>
}

const FORMATS = [
  { id: 'json', label: 'JSON', desc: 'Full graph data with metadata' },
  { id: 'csv',  label: 'CSV',  desc: 'Rooms and edges as spreadsheet' },
  { id: 'dot',  label: 'DOT',  desc: 'Graphviz format for tooling' },
  { id: 'png',  label: 'PNG',  desc: 'Canvas snapshot at current size' },
]

export function ExportMenu({ graph, canvasRef }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleExport = (format: string) => {
    if (!graph) return
    triggerExport(graph, format, canvasRef.current ?? undefined)
    setOpen(false)
  }

  const handleCopyJson = async () => {
    if (!graph) return
    const { exportJson } = await import('@/utils/export')
    await navigator.clipboard.writeText(exportJson(graph, { includeMetadata: true, prettyPrint: true }))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={!graph}
        className="px-3 py-1.5 text-xs font-display tracking-wider
          border border-stone-300 dark:border-stone-700
          text-stone-600 dark:text-stone-400
          hover:bg-stone-100 dark:hover:bg-stone-800
          disabled:opacity-40 disabled:cursor-not-allowed
          rounded-md transition-colors"
      >
        Export ▾
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-56
            bg-white dark:bg-stone-900
            border border-stone-200 dark:border-stone-700
            rounded-lg shadow-xl overflow-hidden">
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => handleExport(f.id)}
                className="w-full text-left px-3 py-2.5 flex items-start gap-3
                  hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
              >
                <span className="font-mono text-xs font-medium text-stone-500 dark:text-stone-400
                  group-hover:text-stone-700 dark:group-hover:text-stone-200 w-8 mt-0.5">
                  .{f.id}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm text-stone-800 dark:text-stone-200 font-body">{f.label}</span>
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-body">{f.desc}</span>
                </span>
              </button>
            ))}

            <div className="border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={handleCopyJson}
                className="w-full text-left px-3 py-2 text-xs font-body
                  text-stone-500 dark:text-stone-400
                  hover:text-stone-800 dark:hover:text-stone-200
                  hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                {copied ? '✓ Copied to clipboard' : 'Copy JSON to clipboard'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

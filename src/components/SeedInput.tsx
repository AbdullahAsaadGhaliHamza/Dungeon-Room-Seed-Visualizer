import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (val: string) => void
  onSubmit: (val: string) => void
  isGenerating?: boolean
}

const HISTORY_KEY = 'dsv:seed_history'
const MAX_HISTORY = 12

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveHistory(history: string[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
}

export function SeedInput({ value, onChange, onSubmit, isGenerating }: Props) {
  const [history, setHistory] = useState<string[]>(loadHistory)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const commit = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setHistory(prev => {
      const next = [trimmed, ...prev.filter(h => h !== trimmed)].slice(0, MAX_HISTORY)
      saveHistory(next)
      return next
    })
    setShowHistory(false)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit(value)
    if (e.key === 'Escape') setShowHistory(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => history.length > 0 && setShowHistory(true)}
          placeholder="Enter any seed string, e.g. iron_keep_v2 or boss_test_07"
          spellCheck={false}
          className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700
            text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500
            font-mono text-sm rounded-md px-3 py-2.5 outline-none
            focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
        />
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(v => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500
              hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-xs font-mono"
            title="Recent seeds"
          >
            ▾
          </button>
        )}

        {showHistory && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 z-20
              bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700
              rounded-md shadow-lg overflow-hidden"
          >
            <div className="px-3 py-1.5 text-xs text-stone-400 dark:text-stone-500 font-display tracking-wider uppercase border-b border-stone-100 dark:border-stone-800">
              Recent
            </div>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => { onChange(h); commit(h) }}
                className="w-full text-left px-3 py-2 text-sm font-mono text-stone-700 dark:text-stone-300
                  hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors truncate"
              >
                {h}
              </button>
            ))}
            <div className="border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => { setHistory([]); saveHistory([]); setShowHistory(false) }}
                className="w-full text-left px-3 py-1.5 text-xs text-stone-400 dark:text-stone-500
                  hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Clear history
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => commit(value)}
        disabled={!value.trim() || isGenerating}
        className="px-4 py-2.5 text-sm font-display tracking-wider
          bg-transparent border border-stone-300 dark:border-stone-600
          text-stone-700 dark:text-stone-300
          hover:bg-stone-100 dark:hover:bg-stone-800
          disabled:opacity-40 disabled:cursor-not-allowed
          rounded-md transition-colors active:scale-95"
      >
        {isGenerating ? '...' : 'Generate'}
      </button>
    </div>
  )
}

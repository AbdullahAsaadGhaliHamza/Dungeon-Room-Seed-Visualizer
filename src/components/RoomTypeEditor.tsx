import { useState } from 'react'
import type { RoomType, RoomTypeConfig } from '@/types'
import { DEFAULT_ROOM_TYPES } from '@/engine/defaults'

interface Props {
  roomTypes: RoomTypeConfig[]
  onChange: (types: RoomTypeConfig[]) => void
  onClose: () => void
}

const PRESET_COLORS = [
  '#4A7FB5', '#7A3B1E', '#3A6B48', '#5E3A8A', '#8A4A1E',
  '#5A6B3A', '#3A5A6B', '#5A5650', '#8B3A5A', '#3A7B6B',
]

interface RowProps {
  rt: RoomTypeConfig
  onUpdate: (patch: Partial<RoomTypeConfig>) => void
  onDelete: () => void
  isFixed: boolean
}

function TypeRow({ rt, onUpdate, onDelete, isFixed }: RowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer
          hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0" style={{ background: rt.color }} />
        <span className="text-sm font-body text-stone-700 dark:text-stone-300 flex-1 truncate">
          {rt.label}
          <span className="ml-2 text-xs text-stone-400 dark:text-stone-500 font-mono italic">
            {isFixed ? 'fixed' : `weight ${rt.weight}`}
          </span>
        </span>
        <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
          {expanded ? '▴' : '▾'}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-stone-100 dark:border-stone-800 px-3 py-3 flex flex-col gap-3
          bg-white dark:bg-stone-900">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 dark:text-stone-400 font-body block mb-1">Label</label>
              <input
                type="text"
                value={rt.label}
                disabled={isFixed}
                onChange={e => onUpdate({ label: e.target.value })}
                className="w-full text-sm font-body bg-stone-50 dark:bg-stone-800
                  border border-stone-200 dark:border-stone-700 rounded px-2 py-1
                  text-stone-800 dark:text-stone-200 outline-none
                  disabled:opacity-50 focus:border-stone-400 dark:focus:border-stone-500"
              />
            </div>
            {!isFixed && (
              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400 font-body block mb-1">
                  Weight (relative frequency)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rt.weight}
                  onChange={e => onUpdate({ weight: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full text-sm font-mono bg-stone-50 dark:bg-stone-800
                    border border-stone-200 dark:border-stone-700 rounded px-2 py-1
                    text-stone-800 dark:text-stone-200 outline-none
                    focus:border-stone-400 dark:focus:border-stone-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-stone-500 dark:text-stone-400 font-body block mb-1.5">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => onUpdate({ color: c, darkColor: c })}
                  className="w-5 h-5 rounded transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: rt.color === c ? '2px solid white' : 'none',
                    outlineOffset: '1px',
                    boxShadow: rt.color === c ? `0 0 0 3px ${c}44` : 'none',
                  }}
                />
              ))}
              <input
                type="color"
                value={rt.color}
                onChange={e => onUpdate({ color: e.target.value, darkColor: e.target.value })}
                className="w-7 h-7 cursor-pointer rounded border-0 bg-transparent p-0"
                title="Custom color"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-500 dark:text-stone-400 font-body block mb-1">
              Room name flavors (one per line)
            </label>
            <textarea
              value={rt.flavors.join('\n')}
              onChange={e => onUpdate({ flavors: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
              rows={4}
              className="w-full text-sm font-body bg-stone-50 dark:bg-stone-800
                border border-stone-200 dark:border-stone-700 rounded px-2 py-1.5
                text-stone-800 dark:text-stone-200 outline-none resize-none
                focus:border-stone-400 dark:focus:border-stone-500"
              placeholder="One flavor name per line..."
            />
          </div>

          {!isFixed && (
            <button
              onClick={onDelete}
              className="self-start text-xs font-body text-red-400 dark:text-red-500
                hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Remove type
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const FIXED_TYPES: RoomType[] = ['start', 'boss']

export function RoomTypeEditor({ roomTypes, onChange, onClose }: Props) {
  const addType = () => {
    const newType: RoomTypeConfig = {
      type: `custom_${Date.now()}` as RoomType,
      label: 'Custom',
      color: '#6B5B8A',
      darkColor: '#8B7BAA',
      textColor: '#ffffff',
      darkTextColor: '#ede8f5',
      weight: 10,
      description: 'A custom room type.',
      icon: '?',
      flavors: ['Custom Room'],
    }
    onChange([...roomTypes, newType])
  }

  const update = (index: number, patch: Partial<RoomTypeConfig>) => {
    const next = [...roomTypes]
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  const remove = (index: number) => {
    onChange(roomTypes.filter((_, i) => i !== index))
  }

  const reset = () => onChange(DEFAULT_ROOM_TYPES)

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-700
      bg-stone-50 dark:bg-stone-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display tracking-widest uppercase text-stone-600 dark:text-stone-400">
          Room Types
        </h3>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="text-xs font-body text-stone-400 dark:text-stone-500
              hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            Reset defaults
          </button>
          <button
            onClick={onClose}
            className="text-xs text-stone-400 dark:text-stone-500
              hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            Close ✕
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
        {roomTypes.map((rt, i) => (
          <TypeRow
            key={rt.type}
            rt={rt}
            onUpdate={patch => update(i, patch)}
            onDelete={() => remove(i)}
            isFixed={FIXED_TYPES.includes(rt.type)}
          />
        ))}
      </div>

      <button
        onClick={addType}
        className="mt-3 w-full py-2 text-sm font-body
          border border-dashed border-stone-300 dark:border-stone-600
          text-stone-500 dark:text-stone-400
          hover:border-stone-400 dark:hover:border-stone-500
          hover:text-stone-700 dark:hover:text-stone-300
          rounded-lg transition-colors"
      >
        + Add room type
      </button>

      <p className="mt-3 text-xs font-body italic text-stone-400 dark:text-stone-500">
        Weight is relative. Total weights are normalized automatically.
      </p>
    </div>
  )
}

import type { GeneratorConfig } from '@/types'

interface Props {
  config: Partial<GeneratorConfig>
  onChange: (patch: Partial<GeneratorConfig>) => void
  onClose: () => void
}

interface SliderProps {
  label: string
  hint: string
  min: number
  max: number
  step: number
  value: number
  format?: (v: number) => string
  onChange: (v: number) => void
}

function Slider({ label, hint, min, max, step, value, format, onChange }: SliderProps) {
  const display = format ? format(value) : String(value)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-body text-stone-700 dark:text-stone-300">{label}</span>
        <span className="text-xs font-mono text-stone-500 dark:text-stone-400 tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-stone-600 dark:accent-stone-400"
      />
      <p className="text-xs text-stone-400 dark:text-stone-500 font-body italic">{hint}</p>
    </div>
  )
}

const pct = (v: number) => Math.round(v * 100) + '%'

export function ConfigPanel({ config, onChange, onClose }: Props) {
  const minRooms = config.minRooms ?? 6
  const maxRooms = config.maxRooms ?? 14
  const secretChance = config.secretDoorChance ?? 0.12
  const lockedChance = config.lockedDoorChance ?? 0.10
  const loopChance = config.extraLoopChance ?? 0.45
  const onewayChance = config.onewayChance ?? 0.06

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-700
      bg-stone-50 dark:bg-stone-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display tracking-widest uppercase text-stone-600 dark:text-stone-400">
          Generation Config
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          Close ✕
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <Slider
          label="Min rooms"
          hint="Fewest rooms the generator can place."
          min={2} max={maxRooms} step={1} value={minRooms}
          onChange={v => onChange({ minRooms: Math.min(v, maxRooms) })}
        />
        <Slider
          label="Max rooms"
          hint="Most rooms the generator can place."
          min={minRooms} max={24} step={1} value={maxRooms}
          onChange={v => onChange({ maxRooms: Math.max(v, minRooms) })}
        />
        <Slider
          label="Extra loop chance"
          hint="Probability of adding bonus connections (cycles)."
          min={0} max={1} step={0.01} value={loopChance}
          format={pct}
          onChange={v => onChange({ extraLoopChance: v })}
        />
        <Slider
          label="Secret door chance"
          hint="Per-edge chance of a secret passage."
          min={0} max={0.5} step={0.01} value={secretChance}
          format={pct}
          onChange={v => onChange({ secretDoorChance: v })}
        />
        <Slider
          label="Locked door chance"
          hint="Per-edge chance of a locked door."
          min={0} max={0.5} step={0.01} value={lockedChance}
          format={pct}
          onChange={v => onChange({ lockedDoorChance: v })}
        />
        <Slider
          label="One-way chance"
          hint="Per-edge chance of a one-way passage."
          min={0} max={0.3} step={0.01} value={onewayChance}
          format={pct}
          onChange={v => onChange({ onewayChance: v })}
        />
      </div>

      <p className="mt-4 text-xs font-body italic text-stone-400 dark:text-stone-500">
        Changes apply on next generation. Same seed + different config = different layout.
      </p>
    </div>
  )
}

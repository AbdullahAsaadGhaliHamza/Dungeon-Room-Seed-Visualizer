import type { RoomTypeConfig } from '@/types'

interface Props {
  roomTypes: RoomTypeConfig[]
  isDark: boolean
}

const EDGE_TYPES = [
  { label: 'Normal', dash: false, color: '#888' },
  { label: 'Secret', dash: true, color: '#8B6914' },
  { label: 'Locked', dash: 'long' as const, color: '#8B1a1a' },
  { label: 'One-way', dash: false, color: '#3a6b14', arrow: true },
]

export function Legend({ roomTypes, isDark }: Props) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-body text-stone-500 dark:text-stone-400">
      {roomTypes.map(rt => (
        <div key={rt.type} className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ background: isDark ? rt.darkColor : rt.color }}
          />
          {rt.label}
        </div>
      ))}

      <div className="w-px bg-stone-200 dark:bg-stone-700 mx-1 self-stretch" />

      {EDGE_TYPES.map(et => (
        <div key={et.label} className="flex items-center gap-1.5">
          <svg width="20" height="10" className="flex-shrink-0">
            <line
              x1="0" y1="5" x2={et.arrow ? '14' : '20'} y2="5"
              stroke={et.color}
              strokeWidth="1.5"
              strokeDasharray={et.dash === true ? '4,3' : et.dash === 'long' ? '7,3' : undefined}
            />
            {et.arrow && (
              <polygon points="14,2 20,5 14,8" fill={et.color} />
            )}
          </svg>
          {et.label}
        </div>
      ))}
    </div>
  )
}

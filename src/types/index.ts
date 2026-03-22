export type RoomType = 'start' | 'boss' | 'treasure' | 'puzzle' | 'standard' | 'trap' | 'shop' | 'rest'

export interface RoomTypeConfig {
  type: RoomType
  label: string
  color: string
  darkColor: string
  textColor: string
  darkTextColor: string
  weight: number
  flavors: string[]
  description: string
  icon: string
}

export interface Room {
  id: number
  cx: number
  cy: number
  w: number
  h: number
  type: RoomType
  label: string
  flavor: string
  depth: number
  connections: number[]
}

export interface Edge {
  from: number
  to: number
  kind: 'normal' | 'secret' | 'locked' | 'oneway'
}

export interface DungeonGraph {
  rooms: Room[]
  edges: Edge[]
  maxDepth: number
  loops: number
  seed: string
  hash: string
  generatedAt: number
}

export interface GeneratorConfig {
  minRooms: number
  maxRooms: number
  extraLoopChance: number
  secretDoorChance: number
  lockedDoorChance: number
  onewayChance: number
  roomTypes: RoomTypeConfig[]
}

export interface CompareState {
  seedA: string
  seedB: string
  graphA: DungeonGraph | null
  graphB: DungeonGraph | null
}

export type ExportFormat = 'json' | 'csv' | 'dot' | 'png' | 'svg'

export interface ExportOptions {
  format: ExportFormat
  includeMetadata: boolean
  prettyPrint: boolean
}

export interface UrlState {
  seed?: string
  seedA?: string
  seedB?: string
  mode?: 'single' | 'compare'
  config?: Partial<GeneratorConfig>
}

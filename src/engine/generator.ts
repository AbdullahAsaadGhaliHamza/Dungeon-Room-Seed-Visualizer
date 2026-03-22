import type { DungeonGraph, Edge, GeneratorConfig, Room, RoomType, RoomTypeConfig } from '@/types'
import { DEFAULT_CONFIG } from './defaults'
import { createRng, hashSeed, hashToHex } from './rng'

const CANVAS_W = 800
const CANVAS_H = 520
const PAD = 70
const MIN_ROOM_GAP = 24

function dist(a: Room, b: Room): number {
  return Math.sqrt((a.cx - b.cx) ** 2 + (a.cy - b.cy) ** 2)
}

function boxesOverlap(a: Room, b: Room, gap = MIN_ROOM_GAP): boolean {
  return (
    Math.abs(a.cx - b.cx) < (a.w + b.w) / 2 + gap &&
    Math.abs(a.cy - b.cy) < (a.h + b.h) / 2 + gap
  )
}

function computeDepths(rooms: Room[], edges: Edge[]): void {
  const adj: number[][] = Array.from({ length: rooms.length }, () => [])
  for (const e of edges) {
    if (e.kind !== 'oneway') {
      adj[e.from].push(e.to)
      adj[e.to].push(e.from)
    } else {
      adj[e.from].push(e.to)
    }
  }
  const queue = [0]
  rooms[0].depth = 0
  const visited = new Set([0])
  while (queue.length) {
    const cur = queue.shift()!
    for (const nb of adj[cur]) {
      if (!visited.has(nb)) {
        rooms[nb].depth = rooms[cur].depth + 1
        visited.add(nb)
        queue.push(nb)
      }
    }
  }
  for (const r of rooms) {
    r.connections = adj[r.id]
  }
}

function pickRoomType(
  index: number,
  total: number,
  rng: ReturnType<typeof createRng>,
  config: GeneratorConfig,
  usedTypes: Set<RoomType>
): RoomTypeConfig {
  if (index === 0) return config.roomTypes.find(r => r.type === 'start')!
  if (index === total - 1) return config.roomTypes.find(r => r.type === 'boss')!

  const eligibleTypes = config.roomTypes.filter(r => r.weight > 0)

  if (!usedTypes.has('treasure') && index >= Math.floor(total * 0.4)) {
    const treasureType = eligibleTypes.find(r => r.type === 'treasure')!
    if (rng.nextBool(0.35)) return treasureType
  }

  return rng.weightedPick(eligibleTypes)
}

export function generate(seed: string, userConfig?: Partial<GeneratorConfig>): DungeonGraph {
  const config: GeneratorConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    roomTypes: userConfig?.roomTypes ?? DEFAULT_CONFIG.roomTypes,
  }

  const rng = createRng(hashSeed(seed))
  const roomCount = rng.nextInt(config.minRooms, config.maxRooms)
  const rooms: Room[] = []
  const usedTypes = new Set<RoomType>()

  for (let i = 0; i < roomCount; i++) {
    const typeConfig = pickRoomType(i, roomCount, rng, config, usedTypes)
    usedTypes.add(typeConfig.type)

    const w = 80 + rng.nextInt(0, 48)
    const h = 48 + rng.nextInt(0, 28)

    let cx = 0, cy = 0, placed = false
    for (let attempt = 0; attempt < 80; attempt++) {
      cx = PAD + rng.next() * (CANVAS_W - PAD * 2)
      cy = PAD + rng.next() * (CANVAS_H - PAD * 2)
      const candidate = { id: i, cx, cy, w, h, type: typeConfig.type, label: typeConfig.label, flavor: '', depth: 0, connections: [] }
      if (!rooms.some(r => boxesOverlap(r, candidate))) {
        placed = true
        break
      }
    }
    if (!placed) {
      cx = PAD + (i % 5) * 140
      cy = PAD + Math.floor(i / 5) * 120
    }

    rooms.push({
      id: i,
      cx,
      cy,
      w,
      h,
      type: typeConfig.type,
      label: typeConfig.label,
      flavor: rng.pick(typeConfig.flavors),
      depth: 0,
      connections: [],
    })
  }

  const edges: Edge[] = []
  const adj: number[][] = Array.from({ length: roomCount }, () => [])

  const connected = new Set([0])
  const sorted = [...rooms].sort((a, b) => dist(rooms[0], a) - dist(rooms[0], b))

  for (let i = 1; i < sorted.length; i++) {
    const target = sorted[i].id
    let closest = -1, minD = Infinity
    for (const cid of connected) {
      const d = dist(rooms[cid], rooms[target])
      if (d < minD) { minD = d; closest = cid }
    }
    const edge = buildEdge(closest, target, rng, config)
    edges.push(edge)
    adj[closest].push(target)
    adj[target].push(closest)
    connected.add(target)
  }

  const extraLoops = rng.nextBool(config.extraLoopChance)
    ? rng.nextInt(1, Math.max(1, Math.floor(roomCount / 4)))
    : 0

  let loopCount = 0
  for (let attempt = 0; attempt < 40 && loopCount < extraLoops; attempt++) {
    const a = rng.nextInt(0, roomCount - 1)
    const b = rng.nextInt(0, roomCount - 1)
    if (a !== b && !adj[a].includes(b) && dist(rooms[a], rooms[b]) < 260) {
      const edge = buildEdge(a, b, rng, config)
      edges.push(edge)
      adj[a].push(b)
      adj[b].push(a)
      loopCount++
    }
  }

  computeDepths(rooms, edges)

  const maxDepth = Math.max(...rooms.map(r => r.depth))

  return {
    rooms,
    edges,
    maxDepth,
    loops: loopCount,
    seed,
    hash: hashToHex(seed),
    generatedAt: Date.now(),
  }
}

function buildEdge(
  from: number,
  to: number,
  rng: ReturnType<typeof createRng>,
  config: GeneratorConfig
): Edge {
  const r = rng.next()
  let kind: Edge['kind'] = 'normal'
  if (r < config.secretDoorChance) kind = 'secret'
  else if (r < config.secretDoorChance + config.lockedDoorChance) kind = 'locked'
  else if (r < config.secretDoorChance + config.lockedDoorChance + config.onewayChance) kind = 'oneway'
  return { from, to, kind }
}

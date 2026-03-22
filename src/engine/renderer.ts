import type { DungeonGraph, Edge, Room, RoomTypeConfig } from '@/types'

export interface RenderOptions {
  isDark: boolean
  roomTypes: RoomTypeConfig[]
  highlightRoomId?: number | null
  scale?: number
}

const CANVAS_W = 800
const CANVAS_H = 520

function roomColor(room: Room, types: RoomTypeConfig[], isDark: boolean, highlighted: boolean): string {
  const cfg = types.find(t => t.type === room.type)
  const base = isDark ? (cfg?.darkColor ?? '#7A7670') : (cfg?.color ?? '#5A5650')
  if (!highlighted) return base
  return base
}

function textColor(room: Room, types: RoomTypeConfig[], isDark: boolean): string {
  const cfg = types.find(t => t.type === room.type)
  return isDark ? (cfg?.darkTextColor ?? '#e8e4df') : (cfg?.textColor ?? '#ffffff')
}

function edgeStyle(edge: Edge, isDark: boolean): { color: string; dash: number[]; width: number } {
  const alpha = isDark ? 'aa' : '99'
  switch (edge.kind) {
    case 'secret':
      return { color: isDark ? '#c49a28' + alpha : '#8B6914' + alpha, dash: [5, 4], width: 1.5 }
    case 'locked':
      return { color: isDark ? '#d04444' + alpha : '#8B1a1a' + alpha, dash: [8, 3], width: 2 }
    case 'oneway':
      return { color: isDark ? '#7aaa44' + alpha : '#3a6b14' + alpha, dash: [], width: 2 }
    default:
      return { color: isDark ? 'rgba(200,190,175,0.3)' : 'rgba(50,40,30,0.22)', dash: [], width: 1.5 }
  }
}

function drawArrow(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, color: string): void {
  const angle = Math.atan2(by - ay, bx - ax)
  const size = 7
  ctx.beginPath()
  ctx.moveTo(bx, by)
  ctx.lineTo(bx - size * Math.cos(angle - 0.4), by - size * Math.sin(angle - 0.4))
  ctx.lineTo(bx - size * Math.cos(angle + 0.4), by - size * Math.sin(angle + 0.4))
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function roomEdgePoint(room: Room, targetCx: number, targetCy: number, scaleX: number, scaleY: number): [number, number] {
  const cx = room.cx * scaleX
  const cy = room.cy * scaleY
  const hw = (room.w / 2) * scaleX
  const hh = (room.h / 2) * scaleY
  const dx = targetCx * scaleX - cx
  const dy = targetCy * scaleY - cy
  if (dx === 0 && dy === 0) return [cx, cy]
  const scaleToEdge = Math.min(Math.abs(hw / dx), Math.abs(hh / dy))
  return [cx + dx * scaleToEdge, cy + dy * scaleToEdge]
}

export function renderGraph(
  canvas: HTMLCanvasElement,
  graph: DungeonGraph,
  opts: RenderOptions
): void {
  const dpr = window.devicePixelRatio || 1
  const W = canvas.offsetWidth
  const H = canvas.offsetHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  const sx = W / CANVAS_W
  const sy = H / CANVAS_H

  for (const edge of graph.edges) {
    const a = graph.rooms[edge.from]
    const b = graph.rooms[edge.to]
    const [ax, ay] = roomEdgePoint(a, b.cx, b.cy, sx, sy)
    const [bx, by] = roomEdgePoint(b, a.cx, a.cy, sx, sy)
    const style = edgeStyle(edge, opts.isDark)

    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.strokeStyle = style.color
    ctx.lineWidth = style.width
    ctx.setLineDash(style.dash)
    ctx.stroke()
    ctx.setLineDash([])

    if (edge.kind === 'oneway') {
      const mx = (ax + bx) / 2
      const my = (ay + by) / 2
      drawArrow(ctx, ax, ay, mx, my, style.color)
    }
  }

  for (const room of graph.rooms) {
    const x = (room.cx - room.w / 2) * sx
    const y = (room.cy - room.h / 2) * sy
    const w = room.w * sx
    const h = room.h * sy
    const cx = room.cx * sx
    const cy = room.cy * sy
    const isHighlighted = opts.highlightRoomId === room.id

    ctx.beginPath()
    roundRect(ctx, x, y, w, h, 6 * Math.min(sx, sy))

    const base = roomColor(room, opts.roomTypes, opts.isDark, isHighlighted)
    ctx.fillStyle = base + (opts.isDark ? 'cc' : 'dd')
    ctx.fill()

    if (isHighlighted) {
      ctx.fillStyle = opts.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
      ctx.fill()
    }

    ctx.strokeStyle = opts.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 0.5
    ctx.stroke()

    ctx.fillStyle = textColor(room, opts.roomTypes, opts.isDark)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const fontSize = Math.max(9, Math.min(11, 11 * Math.min(sx, sy)))
    ctx.font = `500 ${fontSize}px 'Cinzel', serif`
    const shortFlavor = room.flavor.length > 14 ? room.flavor.slice(0, 13) + '…' : room.flavor
    ctx.fillText(shortFlavor, cx, cy - fontSize * 0.7)

    ctx.font = `300 ${Math.max(8, fontSize - 1)}px 'Crimson Pro', serif`
    ctx.fillStyle = opts.isDark ? 'rgba(220,210,200,0.6)' : 'rgba(255,255,255,0.75)'
    ctx.fillText(`d${room.depth}`, cx, cy + fontSize * 0.7)
  }
}

export function getHitRoom(
  canvas: HTMLCanvasElement,
  mouseX: number,
  mouseY: number,
  graph: DungeonGraph
): Room | null {
  const sx = canvas.offsetWidth / CANVAS_W
  const sy = canvas.offsetHeight / CANVAS_H
  for (const r of graph.rooms) {
    const hw = (r.w / 2) * sx
    const hh = (r.h / 2) * sy
    const cx = r.cx * sx
    const cy = r.cy * sy
    if (mouseX >= cx - hw && mouseX <= cx + hw && mouseY >= cy - hh && mouseY <= cy + hh) {
      return r
    }
  }
  return null
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r)
    return
  }
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

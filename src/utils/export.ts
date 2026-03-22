import type { DungeonGraph, ExportOptions } from '@/types'

export function exportJson(graph: DungeonGraph, opts: Pick<ExportOptions, 'includeMetadata' | 'prettyPrint'>): string {
  const data = opts.includeMetadata
    ? graph
    : { rooms: graph.rooms, edges: graph.edges }
  return JSON.stringify(data, null, opts.prettyPrint ? 2 : 0)
}

export function exportCsv(graph: DungeonGraph): string {
  const roomLines = [
    'id,type,label,flavor,cx,cy,width,height,depth,connections',
    ...graph.rooms.map(r =>
      [r.id, r.type, r.label, `"${r.flavor}"`, Math.round(r.cx), Math.round(r.cy), r.w, r.h, r.depth, `"${r.connections.join(';')}"`].join(',')
    ),
  ]
  const edgeLines = [
    '',
    'from,to,kind',
    ...graph.edges.map(e => `${e.from},${e.to},${e.kind}`),
  ]
  return [...roomLines, ...edgeLines].join('\n')
}

export function exportDot(graph: DungeonGraph): string {
  const lines = [
    `digraph dungeon_${graph.seed.replace(/\W/g, '_')} {`,
    '  graph [rankdir=LR fontname="monospace"]',
    '  node [shape=box style=filled fontname="monospace" fontsize=11]',
    '',
  ]
  for (const room of graph.rooms) {
    const color = roomDotColor(room.type)
    lines.push(`  r${room.id} [label="${room.flavor}\\n(${room.label}, d${room.depth})" fillcolor="${color}" fontcolor="white"]`)
  }
  lines.push('')
  for (const edge of graph.edges) {
    const attrs = edgeDotAttrs(edge.kind)
    lines.push(`  r${edge.from} -> r${edge.to} [${attrs}]`)
  }
  lines.push('}')
  return lines.join('\n')
}

function roomDotColor(type: string): string {
  const map: Record<string, string> = {
    start: '#4A7FB5',
    boss: '#7A3B1E',
    treasure: '#3A6B48',
    puzzle: '#5E3A8A',
    trap: '#8A4A1E',
    shop: '#5A6B3A',
    rest: '#3A5A6B',
    standard: '#5A5650',
  }
  return map[type] ?? '#555'
}

function edgeDotAttrs(kind: string): string {
  switch (kind) {
    case 'secret': return 'style=dashed color="#8B6914" label="secret"'
    case 'locked': return 'color="#A02020" label="locked"'
    case 'oneway': return 'style=bold label="one-way"'
    default: return ''
  }
}

export function exportSvgString(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadPng(canvas: HTMLCanvasElement, seed: string): void {
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `dungeon_${seed.replace(/\W/g, '_')}.png`
  a.click()
}

export function triggerExport(graph: DungeonGraph, format: string, canvas?: HTMLCanvasElement): void {
  const slug = graph.seed.replace(/\W/g, '_')
  switch (format) {
    case 'json':
      downloadFile(exportJson(graph, { includeMetadata: true, prettyPrint: true }), `${slug}.json`, 'application/json')
      break
    case 'csv':
      downloadFile(exportCsv(graph), `${slug}.csv`, 'text/csv')
      break
    case 'dot':
      downloadFile(exportDot(graph), `${slug}.dot`, 'text/plain')
      break
    case 'png':
      if (canvas) downloadPng(canvas, graph.seed)
      break
  }
}

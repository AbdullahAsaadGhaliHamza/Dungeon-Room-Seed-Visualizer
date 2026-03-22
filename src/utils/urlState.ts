import type { GeneratorConfig, UrlState } from '@/types'

export function encodeUrlState(state: UrlState): string {
  const params = new URLSearchParams()
  if (state.mode) params.set('mode', state.mode)
  if (state.seed) params.set('seed', state.seed)
  if (state.seedA) params.set('a', state.seedA)
  if (state.seedB) params.set('b', state.seedB)
  if (state.config) {
    const cfg = state.config
    if (cfg.minRooms !== undefined) params.set('min', String(cfg.minRooms))
    if (cfg.maxRooms !== undefined) params.set('max', String(cfg.maxRooms))
    if (cfg.secretDoorChance !== undefined) params.set('secret', String(cfg.secretDoorChance))
    if (cfg.lockedDoorChance !== undefined) params.set('locked', String(cfg.lockedDoorChance))
    if (cfg.extraLoopChance !== undefined) params.set('loops', String(cfg.extraLoopChance))
  }
  return params.toString()
}

export function decodeUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search)
  const state: UrlState = {}
  const mode = params.get('mode')
  if (mode === 'compare') state.mode = 'compare'
  else if (mode === 'single') state.mode = 'single'
  const seed = params.get('seed')
  if (seed) state.seed = seed
  const a = params.get('a')
  if (a) state.seedA = a
  const b = params.get('b')
  if (b) state.seedB = b

  const cfg: Partial<GeneratorConfig> = {}
  const min = params.get('min')
  if (min) cfg.minRooms = Math.max(2, Math.min(20, parseInt(min)))
  const max = params.get('max')
  if (max) cfg.maxRooms = Math.max(2, Math.min(24, parseInt(max)))
  const secret = params.get('secret')
  if (secret) cfg.secretDoorChance = Math.max(0, Math.min(1, parseFloat(secret)))
  const locked = params.get('locked')
  if (locked) cfg.lockedDoorChance = Math.max(0, Math.min(1, parseFloat(locked)))
  const loops = params.get('loops')
  if (loops) cfg.extraLoopChance = Math.max(0, Math.min(1, parseFloat(loops)))
  if (Object.keys(cfg).length > 0) state.config = cfg

  return state
}

export function buildShareUrl(state: UrlState): string {
  const base = window.location.origin + window.location.pathname
  const qs = encodeUrlState(state)
  return qs ? `${base}?${qs}` : base
}

export function pushUrlState(state: UrlState): void {
  const qs = encodeUrlState(state)
  const url = window.location.pathname + (qs ? `?${qs}` : '')
  window.history.pushState(null, '', url)
}

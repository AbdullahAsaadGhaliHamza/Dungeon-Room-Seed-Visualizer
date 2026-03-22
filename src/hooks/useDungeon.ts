import { useCallback, useEffect, useRef, useState } from 'react'
import { generate } from '@/engine/generator'
import type { DungeonGraph, GeneratorConfig } from '@/types'

interface UseDungeonResult {
  graph: DungeonGraph | null
  isGenerating: boolean
  regenerate: (seed: string, config?: Partial<GeneratorConfig>) => void
  lastSeed: string
}

export function useDungeon(initialSeed = ''): UseDungeonResult {
  const [graph, setGraph] = useState<DungeonGraph | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastSeed, setLastSeed] = useState(initialSeed)
  const configRef = useRef<Partial<GeneratorConfig>>({})

  const regenerate = useCallback((seed: string, config?: Partial<GeneratorConfig>) => {
    if (!seed.trim()) return
    setIsGenerating(true)
    if (config) configRef.current = config
    requestAnimationFrame(() => {
      try {
        const g = generate(seed.trim(), configRef.current)
        setGraph(g)
        setLastSeed(seed.trim())
      } finally {
        setIsGenerating(false)
      }
    })
  }, [])

  useEffect(() => {
    if (initialSeed) regenerate(initialSeed)
  }, [])

  return { graph, isGenerating, regenerate, lastSeed }
}

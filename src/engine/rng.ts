export function hashSeed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
    h >>>= 0
  }
  return h
}

export function hashToHex(str: string): string {
  return '0x' + hashSeed(str).toString(16).padStart(8, '0').toUpperCase()
}

export function createRng(seed: number) {
  let s = seed >>> 0
  return {
    next(): number {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0
      return s / 0xffffffff
    },
    nextInt(min: number, max: number): number {
      return min + Math.floor(this.next() * (max - min + 1))
    },
    nextBool(probability = 0.5): boolean {
      return this.next() < probability
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)]
    },
    weightedPick<T extends { weight: number }>(items: T[]): T {
      const total = items.reduce((sum, item) => sum + item.weight, 0)
      let threshold = this.next() * total
      for (const item of items) {
        threshold -= item.weight
        if (threshold <= 0) return item
      }
      return items[items.length - 1]
    },
    shuffle<T>(arr: T[]): T[] {
      const result = [...arr]
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(this.next() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
      }
      return result
    },
  }
}

export type Rng = ReturnType<typeof createRng>

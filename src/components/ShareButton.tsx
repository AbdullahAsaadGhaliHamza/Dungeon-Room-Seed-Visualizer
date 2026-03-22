import { useState } from 'react'
import { buildShareUrl } from '@/utils/urlState'
import type { UrlState } from '@/types'

interface Props {
  getState: () => UrlState
  disabled?: boolean
}

export function ShareButton({ getState, disabled }: Props) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const handleShare = async () => {
    try {
      const url = buildShareUrl(getState())
      await navigator.clipboard.writeText(url)
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  const label = status === 'copied' ? '✓ Link copied' : status === 'error' ? 'Copy failed' : 'Share'

  return (
    <button
      onClick={handleShare}
      disabled={disabled}
      className="px-3 py-1.5 text-xs font-display tracking-wider
        border border-stone-300 dark:border-stone-700
        text-stone-600 dark:text-stone-400
        hover:bg-stone-100 dark:hover:bg-stone-800
        disabled:opacity-40 disabled:cursor-not-allowed
        rounded-md transition-colors"
    >
      {label}
    </button>
  )
}

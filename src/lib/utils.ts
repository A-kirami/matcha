import { cx } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

import type { ClassValue } from 'class-variance-authority/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(cx(inputs))
}

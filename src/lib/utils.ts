import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mongolian month names
const mongolianMonths = [
  '1-р сар', '2-р сар', '3-р сар', '4-р сар',
  '5-р сар', '6-р сар', '7-р сар', '8-р сар',
  '9-р сар', '10-р сар', '11-р сар', '12-р сар'
]

// Format date in Mongolian
export function formatDateMn(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'

  const year = date.getFullYear()
  const month = mongolianMonths[date.getMonth()]
  const day = date.getDate()

  return `${year} оны ${month} ${day}`
}

// Format date short in Mongolian (YYYY.MM.DD)
export function formatDateShortMn(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

// Format currency in Mongolian
export function formatCurrencyMn(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'

  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} тэрбум₮`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} сая₮`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} мянга₮`
  }
  return `${value.toLocaleString('mn-MN')}₮`
}

// Get relative time in Mongolian
export function getRelativeTimeMn(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Өнөөдөр'
  if (diffDays === 1) return 'Өчигдөр'
  if (diffDays < 7) return `${diffDays} өдрийн өмнө`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} долоо хоногийн өмнө`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} сарын өмнө`
  return `${Math.floor(diffDays / 365)} жилийн өмнө`
}

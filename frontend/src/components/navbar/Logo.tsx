import type { MouseEventHandler } from 'react'
import Link from 'next/link'

type LogoProps = {
  className?: string
  iconClassName?: string
  iconSize?: number
  onClick?: MouseEventHandler<HTMLAnchorElement>
  textClassName?: string
}

export function LogoMark({ className = '', size = 44 }: { className?: string; size?: number }) {
  const iconSize = Math.max(18, Math.round(size * 0.6))

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-[14px] bg-stone-900 shadow-md ${className}`}
      style={{ height: size, width: size }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <path
          d="M4 13L13 5L22 13V22a1 1 0 01-1 1H5a1 1 0 01-1-1V13z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="9.5" y="16" width="7" height="7" rx="2.5" fill="#D97706" />
      </svg>
    </span>
  )
}

export default function Logo({
  className = '',
  iconClassName,
  iconSize = 44,
  onClick,
  textClassName = ''
}: LogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`flex items-center gap-3 p-1 transition hover:opacity-80 ${className}`}
    >
      <LogoMark className={iconClassName} size={iconSize} />
      <span
        className={`font-heading text-[1.625rem] font-bold leading-none tracking-[-0.03em] text-stone-900 ${textClassName}`}
      >
        Prop<span className="text-amber-600">Bol</span>
      </span>
    </Link>
  )
}

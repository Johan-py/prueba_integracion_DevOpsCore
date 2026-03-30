import Link from 'next/link'

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-xl font-bold text-black hover:opacity-80 transition p-1"
    >
      <div className="w-8 h-8 bg-black rounded-sm"></div>
      Prop<span className="text-[#E68B25]">Bol</span>
    </Link>
  )
}

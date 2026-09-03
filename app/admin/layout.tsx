import Link from 'next/link'

const tabs = [
  { href: '/admin/scoreboard', label: 'Scoreboard' },
  { href: '/admin/library', label: 'Question Library' },
  { href: '/admin/games', label: 'Games' },
  { href: '/admin/players', label: 'Players' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#111] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="text-[#73d13d] font-bold text-base">🚌 FlixBingo — Admin</div>
        <div className="text-xs bg-[#73d13d22] text-[#73d13d] border border-[#73d13d44] rounded-md px-2.5 py-1 font-bold uppercase tracking-wide">Admin</div>
      </header>
      <nav className="bg-[#111] border-b border-[#2a2a2a] px-6 flex sticky top-[53px] z-[9]">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-3 text-xs font-semibold text-gray-500 border-b-2 border-transparent hover:text-gray-300 whitespace-nowrap"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  )
}

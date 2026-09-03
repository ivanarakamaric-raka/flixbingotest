import { adminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function PlayersPage() {
  const { data: players } = await adminClient()
    .from('players')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-white">Players</h2>
        <div className="text-xs text-gray-500">{(players ?? []).length} total</div>
      </div>

      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {(players ?? []).map(p => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a] last:border-0">
            <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
              {p.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-200">{p.name}</div>
              <div className="text-xs text-gray-600 truncate">{p.email}</div>
            </div>
            <div className="text-[10px] text-gray-600">
              {new Date(p.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {(players ?? []).length === 0 && (
          <div className="p-6 text-center text-gray-600 text-sm">No players yet.</div>
        )}
      </div>
    </div>
  )
}

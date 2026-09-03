import { auth, signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function JoinPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#111] rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <div className="p-8 flex flex-col items-center gap-6 text-center">
          <div className="text-5xl">🚌</div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">FlixBingo</h1>
            <p className="text-sm text-gray-500 mt-1">FlixTech Summit 2026</p>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Tag your colleagues, fill your card, <strong className="text-white">have fun</strong>.
          </p>
          <form action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/' })
          }}>
            <button
              type="submit"
              className="w-full bg-[#73d13d] text-black font-bold py-4 px-6 rounded-2xl text-base"
            >
              Sign in with Flix Google
            </button>
          </form>
          <p className="text-xs text-gray-600">@flixbus.com or @flix.com only</p>
        </div>
      </div>
    </main>
  )
}

'use client'

type Square = {
  questionId: string
  text: string
  claimedAt: string | null
  claimedByName: string | null
}

export function BingoCard({
  squares,
  onSquareTap,
}: {
  squares: Square[]
  onSquareTap: (questionId: string) => void
}) {
  return (
    <div
      className="grid gap-1.5 p-2"
      style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
    >
      {squares.map((sq) => (
        <button
          key={sq.questionId}
          onClick={() => !sq.claimedAt && onSquareTap(sq.questionId)}
          className={`aspect-square rounded-lg p-1.5 flex flex-col items-center justify-center text-center transition-colors ${
            sq.claimedAt
              ? 'bg-[#0d2010] border-2 border-[#73d13d]'
              : 'bg-[#1a1a1a] border border-[#2a2a2a] active:bg-[#222]'
          }`}
        >
          <span
            className="leading-tight"
            style={{ fontSize: 'clamp(7px, 2vw, 9px)', color: sq.claimedAt ? '#c8f08f' : '#ccc' }}
          >
            {sq.text}
          </span>
          {sq.claimedByName && (
            <span
              className="text-[#73d13d] font-bold mt-1"
              style={{ fontSize: 'clamp(6px, 1.5vw, 8px)' }}
            >
              {sq.claimedByName}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

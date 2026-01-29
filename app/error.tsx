'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center card p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Something went wrong!</h2>
        <p className="text-textMuted mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

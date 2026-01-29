import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center card p-8 max-w-md">
        <h2 className="text-4xl font-bold mb-4 text-textPrimary">
          404
        </h2>
        <p className="text-textMuted mb-6">Page not found</p>
        <Link
          href="/"
          className="btn-primary inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

// Allow login page to be accessed without authentication
export const dynamic = 'force-dynamic'

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


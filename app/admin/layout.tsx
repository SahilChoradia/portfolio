import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-utils'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get pathname from headers set by middleware
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Allow login page to be accessed without auth
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return <>{children}</>
  }
  
  // For all other admin pages, check authentication
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    redirect('/admin/login')
  }

  return <>{children}</>
}


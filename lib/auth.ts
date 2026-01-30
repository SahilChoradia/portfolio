import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('[Auth] Missing email or password in credentials')
          return null
        }

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        // Check if environment variables are set (critical for production)
        if (!adminEmail || !adminPassword) {
          console.error('[Auth] ADMIN_EMAIL or ADMIN_PASSWORD environment variables are not set')
          console.error('[Auth] ADMIN_EMAIL:', adminEmail ? 'SET' : 'MISSING')
          console.error('[Auth] ADMIN_PASSWORD:', adminPassword ? 'SET' : 'MISSING')
          return null
        }

        // Case-insensitive email comparison for better UX
        const emailMatch = credentials.email.toLowerCase().trim() === adminEmail.toLowerCase().trim()
        
        if (!emailMatch) {
          console.warn('[Auth] Email mismatch:', {
            provided: credentials.email,
            expected: adminEmail,
          })
          return null
        }

        // Try bcrypt comparison first (for hashed passwords)
        let isValid = false
        try {
          // Check if adminPassword looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
          if (adminPassword.startsWith('$2')) {
            isValid = await bcrypt.compare(credentials.password, adminPassword)
          } else {
            // Plain text comparison (fallback for development/setup)
            isValid = credentials.password === adminPassword
          }
        } catch (error) {
          console.error('[Auth] Error during password comparison:', error)
          return null
        }
        
        if (isValid) {
          return {
            id: '1',
            email: adminEmail,
            name: 'Admin',
          }
        } else {
          console.warn('[Auth] Invalid password for email:', credentials.email)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}






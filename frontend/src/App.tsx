// app/layout.tsx
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import AuthProvider from '@/providers/AuthProvider'
import { Toaster } from '@/components/ui/Toaster'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Secure Application',
  description: 'A secure application with authentication and user management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

// app/page.tsx
export default function HomePage() {
  return (
    <div className="prose max-w-none">
      <h1>Welcome to the Application</h1>
      <p>Please login to access protected resources.</p>
    </div>
  )
}

// app/(auth)/login/page.tsx
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return <LoginForm />
}

// app/(auth)/register/page.tsx
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return <RegisterForm />
}

// app/(protected)/users/page.tsx
import { Suspense } from 'react'
import UserList from '@/components/users/UserList'
import Loading from '@/components/ui/Loading'

export default function UsersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <UserList />
    </Suspense>
  )
}

// app/(protected)/users/[id]/page.tsx
import { Suspense } from 'react'
import UserDetail from '@/components/users/UserDetail'
import Loading from '@/components/ui/Loading'

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      <UserDetail id={params.id} />
    </Suspense>
  )
}

// app/(protected)/users/create/page.tsx
import UserForm from '@/components/users/UserForm'

export default function CreateUserPage() {
  return <UserForm />
}

// app/(protected)/users/[id]/edit/page.tsx
import { Suspense } from 'react'
import UserForm from '@/components/users/UserForm'
import Loading from '@/components/ui/Loading'

export default function EditUserPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      <UserForm id={params.id} />
    </Suspense>
  )
}

// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-4">The page you're looking for doesn't exist.</p>
      <Link 
        href="/"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Return Home
      </Link>
    </div>
  )
}

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Protected routes pattern
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/(protected)')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/(auth)')
  
  const token = request.cookies.get('token')?.value
  const verifiedToken = token && await verifyAuth(token)

  if (isProtectedRoute && !verifiedToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && verifiedToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/(protected)/:path*',
    '/(auth)/:path*',
  ],
}
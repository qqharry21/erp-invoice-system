import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} userRole={dbUser?.role || 'EMPLOYEE'} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

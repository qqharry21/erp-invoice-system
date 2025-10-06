'use client'

import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardNavProps {
  user: User
  userRole: string
}

export function DashboardNav({ user, userRole }: DashboardNavProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            SmartClaim
          </Link>
          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              儀表板
            </Link>
            <Link
              href="/dashboard/claims"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              我的請款
            </Link>
            <Link
              href="/dashboard/claims/new"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              新增請款
            </Link>
            {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
              <Link
                href="/dashboard/reports"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                報表
              </Link>
            )}
            {userRole === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                系統管理
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            登出
          </Button>
        </div>
      </div>
    </nav>
  )
}

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserManagementTable } from '@/components/admin/user-management-table'

export default async function AdminPage() {
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

  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          claims: true,
          approvals: true,
        },
      },
    },
  })

  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.claim.count({ where: { status: 'PENDING' } }),
    prisma.claim.count({ where: { status: 'APPROVED' } }),
    prisma.claim.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'PAID',
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系統管理</h1>
        <p className="text-gray-600">管理使用者和系統設定</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">總使用者數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[0]}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">待審核請款</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[1]}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">已核准請款</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[2]}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">已付款總額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              NT$ {stats[3]._sum.amount?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>使用者管理</CardTitle>
          <CardDescription>管理使用者角色和權限</CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable users={users} />
        </CardContent>
      </Card>
    </div>
  )
}

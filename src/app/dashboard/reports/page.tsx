import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportsFilter } from '@/components/reports/reports-filter'
import { ReportsTable } from '@/components/reports/reports-table'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>
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

  if (!dbUser || (dbUser.role !== 'MANAGER' && dbUser.role !== 'ADMIN')) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const { status, from, to } = params

  // Build filter conditions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (from) {
    where.claimDate = { ...where.claimDate, gte: new Date(from) }
  }

  if (to) {
    where.claimDate = { ...where.claimDate, lte: new Date(to) }
  }

  // Fetch claims with filters
  const claims = await prisma.claim.findMany({
    where,
    include: {
      user: true,
      attachments: true,
      approvals: {
        include: {
          approver: true,
        },
      },
    },
    orderBy: { claimDate: 'desc' },
  })

  // Calculate statistics
  const stats = {
    total: claims.length,
    totalAmount: claims.reduce((sum, claim) => sum + Number(claim.amount), 0),
    pending: claims.filter((c) => c.status === 'PENDING').length,
    approved: claims.filter((c) => c.status === 'APPROVED').length,
    rejected: claims.filter((c) => c.status === 'REJECTED').length,
    paid: claims.filter((c) => c.status === 'PAID').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">報表與匯出</h1>
        <p className="text-gray-600">查看和匯出請款報表</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">總請款數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">總金額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NT$ {stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">待審核</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">已核准</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>篩選條件</CardTitle>
          <CardDescription>設定報表篩選條件</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsFilter />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>請款列表</CardTitle>
          <CardDescription>符合條件的請款記錄</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsTable claims={claims} />
        </CardContent>
      </Card>
    </div>
  )
}

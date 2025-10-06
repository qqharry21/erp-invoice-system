import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ClaimsList } from '@/components/claims/claims-list'

export default async function ClaimsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get or create user in database
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split('@')[0],
      },
    })
  }

  // Fetch user's claims
  const claims = await prisma.claim.findMany({
    where: { userId: dbUser.id },
    include: {
      attachments: true,
      approvals: {
        include: {
          approver: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的請款</h1>
          <p className="text-gray-600">查看和管理您的請款單</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/claims/new">新增請款</Link>
        </Button>
      </div>

      <ClaimsList claims={claims} />
    </div>
  )
}

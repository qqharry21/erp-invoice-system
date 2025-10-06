import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClaimApprovalActions } from '@/components/claims/claim-approval-actions'
import { ClaimHistory } from '@/components/claims/claim-history'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PAID: 'bg-blue-100 text-blue-800',
}

const statusLabels = {
  DRAFT: '草稿',
  PENDING: '待審核',
  APPROVED: '已核准',
  REJECTED: '已拒絕',
  PAID: '已付款',
}

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  if (!dbUser) {
    redirect('/login')
  }

  const claim = await prisma.claim.findUnique({
    where: { id },
    include: {
      user: true,
      attachments: true,
      approvals: {
        include: {
          approver: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      history: {
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!claim) {
    notFound()
  }

  // Check if user can approve (must be manager or admin, and not the claim owner)
  const canApprove =
    (dbUser.role === 'MANAGER' || dbUser.role === 'ADMIN') &&
    claim.userId !== dbUser.id &&
    claim.status === 'PENDING'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">請款詳情</h1>
          <p className="text-gray-600">查看請款的完整資訊</p>
        </div>
        <Badge className={statusColors[claim.status as keyof typeof statusColors]}>
          {statusLabels[claim.status as keyof typeof statusLabels]}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>請款資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">請款人</p>
              <p className="font-medium">{claim.user.name}</p>
              <p className="text-sm text-gray-500">{claim.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">請款金額</p>
              <p className="text-2xl font-bold">NT$ {claim.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">請款日期</p>
              <p className="font-medium">
                {format(new Date(claim.claimDate), 'PPP', { locale: zhTW })}
              </p>
            </div>
            {claim.submittedAt && (
              <div>
                <p className="text-sm text-gray-600">提交時間</p>
                <p className="font-medium">
                  {format(new Date(claim.submittedAt), 'PPP p', { locale: zhTW })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>請款事由</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{claim.purpose}</p>
          </CardContent>
        </Card>
      </div>

      {claim.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>附件 ({claim.attachments.length})</CardTitle>
            <CardDescription>點擊查看發票或收據</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {claim.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {attachment.mimeType.startsWith('image/') ? (
                        <img
                          src={attachment.fileUrl}
                          alt={attachment.fileName}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-red-100 rounded flex items-center justify-center">
                          <span className="text-red-600 font-bold text-xs">PDF</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {canApprove && (
        <ClaimApprovalActions claimId={claim.id} userId={dbUser.id} />
      )}

      {claim.approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>審核紀錄</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claim.approvals.map((approval) => (
                <div key={approval.id} className="border-l-4 border-gray-300 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{approval.approver.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(approval.createdAt), 'PPP p', { locale: zhTW })}
                      </p>
                    </div>
                    <Badge className={statusColors[approval.status as keyof typeof statusColors]}>
                      {statusLabels[approval.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  {approval.comment && (
                    <p className="text-sm text-gray-600">{approval.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ClaimHistory history={claim.history} />
    </div>
  )
}

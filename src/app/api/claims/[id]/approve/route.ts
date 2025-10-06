import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is manager or admin
    if (dbUser.role !== 'MANAGER' && dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const claim = await prisma.claim.findUnique({
      where: { id },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Check if claim is in PENDING status
    if (claim.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Claim is not pending approval' },
        { status: 400 }
      )
    }

    // Check if user is trying to approve their own claim
    if (claim.userId === dbUser.id) {
      return NextResponse.json(
        { error: 'Cannot approve your own claim' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, comment } = body

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update claim status
    const updatedClaim = await prisma.claim.update({
      where: { id },
      data: { status },
    })

    // Create approval record
    await prisma.approval.create({
      data: {
        claimId: id,
        approverId: dbUser.id,
        status,
        comment,
      },
    })

    // Create approval history
    await prisma.approvalHistory.create({
      data: {
        claimId: id,
        userId: dbUser.id,
        action: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        fromStatus: 'PENDING',
        toStatus: status,
        comment,
      },
    })

    // TODO: Send email notification to claim owner

    return NextResponse.json(updatedClaim)
  } catch (error) {
    console.error('Error approving claim:', error)
    return NextResponse.json(
      { error: 'Failed to approve claim' },
      { status: 500 }
    )
  }
}

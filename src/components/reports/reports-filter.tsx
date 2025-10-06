'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

export function ReportsFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get('status') || 'ALL')
  const [from, setFrom] = useState(searchParams.get('from') || '')
  const [to, setTo] = useState(searchParams.get('to') || '')

  const handleApplyFilter = () => {
    const params = new URLSearchParams()

    if (status !== 'ALL') {
      params.set('status', status)
    }

    if (from) {
      params.set('from', from)
    }

    if (to) {
      params.set('to', to)
    }

    router.push(`/dashboard/reports?${params.toString()}`)
  }

  const handleReset = () => {
    setStatus('ALL')
    setFrom('')
    setTo('')
    router.push('/dashboard/reports')
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="space-y-2">
        <Label>狀態</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部</SelectItem>
            <SelectItem value="DRAFT">草稿</SelectItem>
            <SelectItem value="PENDING">待審核</SelectItem>
            <SelectItem value="APPROVED">已核准</SelectItem>
            <SelectItem value="REJECTED">已拒絕</SelectItem>
            <SelectItem value="PAID">已付款</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="from">開始日期</Label>
        <Input
          id="from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="to">結束日期</Label>
        <Input
          id="to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>&nbsp;</Label>
        <div className="flex space-x-2">
          <Button onClick={handleApplyFilter} className="flex-1">
            套用
          </Button>
          <Button variant="outline" onClick={handleReset}>
            重設
          </Button>
        </div>
      </div>
    </div>
  )
}

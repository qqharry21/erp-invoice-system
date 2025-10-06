'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
  _count: {
    claims: number
    approvals: number
  }
}

interface UserManagementTableProps {
  users: User[]
}

const roleColors = {
  EMPLOYEE: 'bg-gray-100 text-gray-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-purple-100 text-purple-800',
}

const roleLabels = {
  EMPLOYEE: '員工',
  MANAGER: '主管',
  ADMIN: '管理員',
}

export function UserManagementTable({ users }: UserManagementTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('更新角色失敗')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>姓名</TableHead>
          <TableHead>電子郵件</TableHead>
          <TableHead>角色</TableHead>
          <TableHead className="text-center">請款數</TableHead>
          <TableHead className="text-center">審核數</TableHead>
          <TableHead>註冊日期</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                {roleLabels[user.role as keyof typeof roleLabels]}
              </Badge>
            </TableCell>
            <TableCell className="text-center">{user._count.claims}</TableCell>
            <TableCell className="text-center">{user._count.approvals}</TableCell>
            <TableCell>
              {format(new Date(user.createdAt), 'PP', { locale: zhTW })}
            </TableCell>
            <TableCell>
              <Select
                value={user.role}
                onValueChange={(value) => handleRoleChange(user.id, value)}
                disabled={updating === user.id}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">員工</SelectItem>
                  <SelectItem value="MANAGER">主管</SelectItem>
                  <SelectItem value="ADMIN">管理員</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

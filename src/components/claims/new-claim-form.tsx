'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

interface NewClaimFormProps {
  userId: string
  userEmail: string
}

export function NewClaimForm({ userId, userEmail }: NewClaimFormProps) {
  const [amount, setAmount] = useState('')
  const [purpose, setPurpose] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)

      // Validate file types
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type))

      if (invalidFiles.length > 0) {
        setError('只允許上傳 JPG、PNG 或 PDF 檔案')
        return
      }

      // Validate file sizes (max 50MB)
      const maxSize = 50 * 1024 * 1024
      const oversizedFiles = newFiles.filter(file => file.size > maxSize)

      if (oversizedFiles.length > 0) {
        setError('檔案大小不得超過 50MB')
        return
      }

      setFiles([...files, ...newFiles])
      setError(null)
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Upload files to Supabase Storage
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

          const { data, error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(data.path)

          return {
            fileName: file.name,
            fileUrl: publicUrl,
            fileSize: file.size,
            mimeType: file.type,
          }
        })
      )

      // Create claim
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          purpose,
          status: isDraft ? 'DRAFT' : 'PENDING',
          attachments: uploadedFiles,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '建立請款失敗')
      }

      router.push('/dashboard/claims')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">請款金額 (NT$)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">請款事由</Label>
        <Textarea
          id="purpose"
          placeholder="請說明請款的目的和原因"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
          disabled={loading}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="files">發票附件 (JPG, PNG, PDF)</Label>
        <Input
          id="files"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          onChange={handleFileChange}
          disabled={loading}
        />
        {files.length > 0 && (
          <div className="mt-2 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <span className="text-sm truncate">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  disabled={loading}
                >
                  移除
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading}
        >
          儲存為草稿
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          disabled={loading}
        >
          {loading ? '提交中...' : '提交請款'}
        </Button>
      </div>
    </form>
  )
}

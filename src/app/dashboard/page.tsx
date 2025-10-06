import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">歡迎回來</h1>
        <p className="text-gray-600">這是您的 SmartClaim 儀表板</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">待審核請款</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-600">等待主管審核</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">已核准請款</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-600">等待付款</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">本月總額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NT$ 0</div>
            <p className="text-xs text-gray-600">已請款金額</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近的請款</CardTitle>
          <CardDescription>您最近提交的請款單</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600 py-8">
            尚無請款記錄
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

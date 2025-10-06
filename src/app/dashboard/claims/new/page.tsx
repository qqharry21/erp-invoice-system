import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewClaimForm } from "@/components/claims/new-claim-form";

export default async function NewClaimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">新增請款</h1>
        <p className="text-gray-600">填寫請款資訊並上傳發票</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>請款資訊</CardTitle>
          <CardDescription>請填寫完整的請款資訊</CardDescription>
        </CardHeader>
        <CardContent>
          <NewClaimForm userId={user.id} userEmail={user.email!} />
        </CardContent>
      </Card>
    </div>
  );
}

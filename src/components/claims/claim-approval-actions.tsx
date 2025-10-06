"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ClaimApprovalActionsProps {
  claimId: string;
  userId: string;
}

export function ClaimApprovalActions({
  claimId,
  userId,
}: ClaimApprovalActionsProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleApproval = async (status: "APPROVED" | "REJECTED") => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/claims/${claimId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "審核失敗");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle>審核請款</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="comment">審核意見（選填）</Label>
          <Textarea
            id="comment"
            placeholder="輸入審核意見..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="flex space-x-4">
          <Button
            variant="destructive"
            onClick={() => handleApproval("REJECTED")}
            disabled={loading}
            className="flex-1"
          >
            拒絕
          </Button>
          <Button
            onClick={() => handleApproval("APPROVED")}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "處理中..." : "核准"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Decimal } from "@prisma/client/runtime/library";

interface Claim {
  id: string;
  amount: Decimal;
  purpose: string;
  status: string;
  claimDate: Date;
  createdAt: Date;
  attachments: { id: string }[];
  approvals: {
    id: string;
    approver: {
      name: string;
    };
  }[];
}

interface ClaimsListProps {
  claims: Claim[];
}

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PAID: "bg-blue-100 text-blue-800",
};

const statusLabels = {
  DRAFT: "草稿",
  PENDING: "待審核",
  APPROVED: "已核准",
  REJECTED: "已拒絕",
  PAID: "已付款",
};

export function ClaimsList({ claims }: ClaimsListProps) {
  if (claims.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-600 mb-4">尚無請款記錄</p>
          <Button asChild>
            <Link href="/dashboard/claims/new">建立第一筆請款</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <Card key={claim.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{claim.purpose}</CardTitle>
                <CardDescription>
                  {formatDistance(new Date(claim.createdAt), new Date(), {
                    addSuffix: true,
                    locale: zhTW,
                  })}
                </CardDescription>
              </div>
              <Badge
                className={
                  statusColors[claim.status as keyof typeof statusColors]
                }
              >
                {statusLabels[claim.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  NT$ {claim.amount.toNumber().toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {claim.attachments.length} 個附件
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/claims/${claim.id}`}>查看詳情</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

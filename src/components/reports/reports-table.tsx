"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Decimal } from "@prisma/client/runtime/library";

interface Claim {
  id: string;
  amount: Decimal;
  purpose: string;
  status: string;
  claimDate: Date;
  user: {
    name: string;
    email: string;
  };
  approvals: {
    approver: {
      name: string;
    };
  }[];
}

interface ReportsTableProps {
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

export function ReportsTable({ claims }: ReportsTableProps) {
  const handleExportCSV = () => {
    const headers = ["請款日期", "請款人", "金額", "事由", "狀態", "審核人"];
    const rows = claims.map((claim) => [
      format(new Date(claim.claimDate), "yyyy-MM-dd"),
      claim.user.name,
      claim.amount.toNumber().toString(),
      claim.purpose.replace(/\n/g, " "),
      statusLabels[claim.status as keyof typeof statusLabels],
      claim.approvals.map((a) => a.approver.name).join(", ") || "-",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `請款報表_${format(new Date(), "yyyyMMdd")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (claims.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        沒有符合條件的請款記錄
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleExportCSV} variant="outline">
          匯出 CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>請款日期</TableHead>
              <TableHead>請款人</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>事由</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>審核人</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell>
                  {format(new Date(claim.claimDate), "PP", { locale: zhTW })}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{claim.user.name}</p>
                    <p className="text-sm text-gray-500">{claim.user.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  NT$ {claim.amount.toNumber().toLocaleString()}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {claim.purpose}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      statusColors[claim.status as keyof typeof statusColors]
                    }
                  >
                    {statusLabels[claim.status as keyof typeof statusLabels]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {claim.approvals.length > 0
                    ? claim.approvals.map((a) => a.approver.name).join(", ")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

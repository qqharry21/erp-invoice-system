"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface HistoryItem {
  id: string;
  action: string;
  fromStatus: string | null;
  toStatus: string;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
}

interface ClaimHistoryProps {
  history: HistoryItem[];
}

const statusLabels = {
  DRAFT: "草稿",
  PENDING: "待審核",
  APPROVED: "已核准",
  REJECTED: "已拒絕",
  PAID: "已付款",
};

export function ClaimHistory({ history }: ClaimHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>歷史紀錄</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={item.id} className="relative">
              {index !== history.length - 1 && (
                <div className="absolute left-2 top-8 h-full w-0.5 bg-gray-200" />
              )}
              <div className="flex gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="h-4 w-4 rounded-full bg-blue-500 mt-1" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium">{item.user.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(item.createdAt), "PPP p", {
                          locale: zhTW,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    {item.fromStatus && (
                      <span>
                        從{" "}
                        <span className="font-medium">
                          {
                            statusLabels[
                              item.fromStatus as keyof typeof statusLabels
                            ]
                          }
                        </span>{" "}
                        變更為{" "}
                      </span>
                    )}
                    <span className="font-medium">
                      {statusLabels[item.toStatus as keyof typeof statusLabels]}
                    </span>
                  </div>
                  {item.comment && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {item.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

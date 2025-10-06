import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "../route";
import { NextRequest } from "next/server";

// Mock modules
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    claim: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    approvalHistory: {
      create: vi.fn(),
    },
  },
}));

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

describe("/api/claims", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/claims", () => {
    it("creates a new claim successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      const mockDbUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "EMPLOYEE",
      };

      const mockClaim = {
        id: "claim-123",
        userId: "user-123",
        amount: 1000,
        purpose: "Test purpose",
        status: "PENDING",
        attachments: [],
      };

      (createClient as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      });
      (prisma.user.findUnique as any).mockResolvedValue(mockDbUser);
      (prisma.claim.create as any).mockResolvedValue(mockClaim);
      (prisma.approvalHistory.create as any).mockResolvedValue({});

      const request = new NextRequest("http://localhost/api/claims", {
        method: "POST",
        body: JSON.stringify({
          amount: 1000,
          purpose: "Test purpose",
          status: "PENDING",
          attachments: [],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe("claim-123");
      expect(prisma.claim.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 1000,
            purpose: "Test purpose",
            status: "PENDING",
          }),
        }),
      );
    });

    it("returns 401 when user is not authenticated", async () => {
      (createClient as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      });

      const request = new NextRequest("http://localhost/api/claims", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/claims", () => {
    it("returns user claims successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      const mockDbUser = {
        id: "user-123",
        email: "test@example.com",
      };

      const mockClaims = [
        {
          id: "claim-1",
          userId: "user-123",
          amount: 1000,
          purpose: "Test 1",
          attachments: [],
          approvals: [],
        },
        {
          id: "claim-2",
          userId: "user-123",
          amount: 2000,
          purpose: "Test 2",
          attachments: [],
          approvals: [],
        },
      ];

      (createClient as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      });
      (prisma.user.findUnique as any).mockResolvedValue(mockDbUser);
      (prisma.claim.findMany as any).mockResolvedValue(mockClaims);

      const request = new NextRequest("http://localhost/api/claims");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].id).toBe("claim-1");
      expect(data[1].id).toBe("claim-2");
    });

    it("returns 401 when user is not authenticated", async () => {
      (createClient as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      });

      const request = new NextRequest("http://localhost/api/claims");

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("returns 404 when user not found in database", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      (createClient as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      });
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/claims");

      const response = await GET(request);

      expect(response.status).toBe(404);
    });
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClaimsList } from '../claims-list';

describe('ClaimsList', () => {
  it('renders empty state when no claims', () => {
    render(<ClaimsList claims={[]} />);

    expect(screen.getByText('尚無請款記錄')).toBeInTheDocument();
    expect(screen.getByText('建立第一筆請款')).toBeInTheDocument();
  });

  it('renders claims list with data', () => {
    const mockClaims = [
      {
        id: '1',
        amount: 1000,
        purpose: 'Test claim 1',
        status: 'PENDING',
        claimDate: new Date('2025-01-01'),
        createdAt: new Date('2025-01-01'),
        attachments: [{ id: 'att-1' }],
        approvals: [],
      },
      {
        id: '2',
        amount: 2000,
        purpose: 'Test claim 2',
        status: 'APPROVED',
        claimDate: new Date('2025-01-02'),
        createdAt: new Date('2025-01-02'),
        attachments: [{ id: 'att-2' }, { id: 'att-3' }],
        approvals: [
          {
            id: 'app-1',
            approver: { name: 'Manager' },
          },
        ],
      },
    ];

    render(<ClaimsList claims={mockClaims} />);

    expect(screen.getByText('Test claim 1')).toBeInTheDocument();
    expect(screen.getByText('Test claim 2')).toBeInTheDocument();
    expect(screen.getByText('NT$ 1,000')).toBeInTheDocument();
    expect(screen.getByText('NT$ 2,000')).toBeInTheDocument();
    expect(screen.getByText('1 個附件')).toBeInTheDocument();
    expect(screen.getByText('2 個附件')).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    const mockClaims = [
      {
        id: '1',
        amount: 1000,
        purpose: 'Pending claim',
        status: 'PENDING',
        claimDate: new Date(),
        createdAt: new Date(),
        attachments: [],
        approvals: [],
      },
      {
        id: '2',
        amount: 2000,
        purpose: 'Approved claim',
        status: 'APPROVED',
        claimDate: new Date(),
        createdAt: new Date(),
        attachments: [],
        approvals: [],
      },
    ];

    render(<ClaimsList claims={mockClaims} />);

    expect(screen.getByText('待審核')).toBeInTheDocument();
    expect(screen.getByText('已核准')).toBeInTheDocument();
  });

  it('renders view details links for each claim', () => {
    const mockClaims = [
      {
        id: 'claim-123',
        amount: 1000,
        purpose: 'Test claim',
        status: 'PENDING',
        claimDate: new Date(),
        createdAt: new Date(),
        attachments: [],
        approvals: [],
      },
    ];

    render(<ClaimsList claims={mockClaims} />);

    const detailsLink = screen.getByText('查看詳情').closest('a');
    expect(detailsLink).toHaveAttribute('href', '/dashboard/claims/claim-123');
  });
});

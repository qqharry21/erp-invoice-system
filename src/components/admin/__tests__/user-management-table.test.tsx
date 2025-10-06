import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserManagementTable } from '../user-management-table'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('UserManagementTable', () => {
  const mockUsers = [
    {
      id: 'user-1',
      email: 'employee@test.com',
      name: 'Test Employee',
      role: 'EMPLOYEE',
      createdAt: new Date('2025-01-01'),
      _count: {
        claims: 5,
        approvals: 0,
      },
    },
    {
      id: 'user-2',
      email: 'manager@test.com',
      name: 'Test Manager',
      role: 'MANAGER',
      createdAt: new Date('2025-01-02'),
      _count: {
        claims: 2,
        approvals: 10,
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user table with data', () => {
    render(<UserManagementTable users={mockUsers} />)

    expect(screen.getByText('Test Employee')).toBeInTheDocument()
    expect(screen.getByText('employee@test.com')).toBeInTheDocument()
    expect(screen.getByText('Test Manager')).toBeInTheDocument()
    expect(screen.getByText('manager@test.com')).toBeInTheDocument()
  })

  it('displays correct role badges', () => {
    render(<UserManagementTable users={mockUsers} />)

    const employeeBadges = screen.getAllByText('員工')
    expect(employeeBadges.length).toBeGreaterThan(0)
    const managerBadges = screen.getAllByText('主管')
    expect(managerBadges.length).toBeGreaterThan(0)
  })

  it('displays claims and approvals counts', () => {
    render(<UserManagementTable users={mockUsers} />)

    const cells = screen.getAllByRole('cell')

    // Check if counts are in the document
    expect(screen.getByText('5')).toBeInTheDocument() // claims count
    expect(screen.getByText('10')).toBeInTheDocument() // approvals count
  })

  it('allows role change via select dropdown', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ role: 'ADMIN' }),
    })

    render(<UserManagementTable users={mockUsers} />)

    const selects = screen.getAllByRole('combobox')
    const firstSelect = selects[0]

    fireEvent.click(firstSelect)

    // Wait for dropdown options
    await waitFor(() => {
      const adminOption = screen.getByText('管理員')
      fireEvent.click(adminOption)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users/user-1/role'),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'ADMIN' }),
        })
      )
    })
  })

  it('handles role change error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    mockFetch.mockRejectedValueOnce(new Error('Failed'))

    render(<UserManagementTable users={mockUsers} />)

    const selects = screen.getAllByRole('combobox')
    fireEvent.click(selects[0])

    await waitFor(() => {
      const managerOptions = screen.getAllByText('主管')
      // Click the option in the dropdown (not the badge)
      const dropdownOption = managerOptions.find(el =>
        el.getAttribute('role') === 'option' || el.closest('[role="option"]')
      )
      if (dropdownOption) {
        fireEvent.click(dropdownOption)
      }
    })

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('更新角色失敗')
    })

    consoleErrorSpy.mockRestore()
    alertSpy.mockRestore()
  })
})

# Testing Guide

This document describes the testing strategy and setup for the SmartClaim invoice management system.

## Test Stack

- **Unit & Integration Tests**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react)
- **E2E Tests**: [Playwright](https://playwright.dev/)
- **Coverage**: Vitest Coverage (v8)

## Running Tests

### Unit & Integration Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

### Run All Tests

```bash
npm run test:all
```

## Test Structure

```
erp-invoice-system/
├── src/
│   ├── components/
│   │   └── **/__tests__/          # Component unit tests
│   ├── app/
│   │   └── api/**/__tests__/      # API route tests
│   └── test/
│       └── setup.ts                # Test setup & global mocks
├── e2e/
│   ├── auth.spec.ts                # Authentication E2E tests
│   └── claims.spec.ts              # Claims management E2E tests
├── vitest.config.ts                # Vitest configuration
└── playwright.config.ts            # Playwright configuration
```

## Test Categories

### 1. Component Tests

Located in `src/components/**/__tests__/`

**Example**: `src/components/claims/__tests__/claims-list.test.tsx`

Tests component rendering, user interactions, and state changes.

```typescript
import { render, screen } from '@testing-library/react'
import { ClaimsList } from '../claims-list'

test('renders empty state when no claims', () => {
  render(<ClaimsList claims={[]} />)
  expect(screen.getByText('尚無請款記錄')).toBeInTheDocument()
})
```

### 2. API Route Tests

Located in `src/app/api/**/__tests__/`

**Example**: `src/app/api/claims/__tests__/route.test.ts`

Tests API endpoints, request/response handling, and error cases.

```typescript
import { POST } from "../route";
import { NextRequest } from "next/server";

test("creates a new claim successfully", async () => {
  const request = new NextRequest("http://localhost/api/claims", {
    method: "POST",
    body: JSON.stringify({ amount: 1000, purpose: "Test" }),
  });

  const response = await POST(request);
  expect(response.status).toBe(201);
});
```

### 3. E2E Tests

Located in `e2e/`

**Example**: `e2e/auth.spec.ts`

Tests complete user workflows across multiple pages.

```typescript
import { test, expect } from "@playwright/test";

test("should display login page", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("SmartClaim 登入")).toBeVisible();
});
```

## Writing Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '../my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### API Test Example

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock external dependencies
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
  })),
}));

describe("/api/endpoint", () => {
  it("returns correct response", async () => {
    // Test implementation
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test("user can complete workflow", async ({ page }) => {
  await page.goto("/dashboard");

  // Navigate
  await page.click("text=新增請款");

  // Fill form
  await page.fill('[name="amount"]', "1000");
  await page.fill('[name="purpose"]', "Test purpose");

  // Submit
  await page.click('button[type="submit"]');

  // Verify
  await expect(page).toHaveURL("/dashboard/claims");
});
```

## Mocking

### Global Mocks

Defined in `src/test/setup.ts`:

- Next.js router (`next/navigation`)
- Supabase client (`@/lib/supabase/client`)

### Test-Specific Mocks

```typescript
import { vi } from "vitest";

// Mock a module
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock a function
const mockFn = vi.fn();
mockFn.mockResolvedValue({ id: "123" });
```

## Coverage Requirements

Target coverage thresholds:

- **Statements**: 70%
- **Branches**: 65%
- **Functions**: 70%
- **Lines**: 70%

View coverage report:

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Testing Best Practices

1. **Write tests alongside code**: Create test files in `__tests__` directories next to the code being tested

2. **Test behavior, not implementation**: Focus on what the code does, not how it does it

3. **Use descriptive test names**: Test names should clearly describe what is being tested

4. **Keep tests isolated**: Each test should be independent and not rely on others

5. **Mock external dependencies**: Mock API calls, database queries, and third-party services

6. **Test edge cases**: Include tests for error conditions, empty states, and boundary values

7. **Maintain test data**: Use factories or fixtures for consistent test data

## Authenticated E2E Tests

For E2E tests requiring authentication, create a test helper:

```typescript
// e2e/helpers/auth.ts
import { Page } from "@playwright/test";

export async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.fill('[type="email"]', process.env.TEST_USER_EMAIL);
  await page.fill('[type="password"]', process.env.TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}
```

Then use in tests:

```typescript
test("authenticated user can create claim", async ({ page }) => {
  await loginAsTestUser(page);
  // ... test implementation
});
```

## Debugging Tests

### Vitest

```bash
# Debug in VS Code
# Add breakpoint and run: Debug Test (from test file)

# View test UI
npm run test:ui
```

### Playwright

```bash
# Run with browser visible
npm run test:e2e:headed

# Debug mode
npm run test:e2e -- --debug

# View test report
npx playwright show-report
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

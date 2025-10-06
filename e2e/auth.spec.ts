import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("SmartClaim 登入")).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "登入" })).toBeVisible();
  });

  test("should display signup page", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByText("建立帳號")).toBeVisible();
    await expect(page.getByPlaceholder("您的姓名")).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "註冊" })).toBeVisible();
  });

  test("should navigate between login and signup", async ({ page }) => {
    await page.goto("/login");

    await page.getByText("註冊").click();
    await expect(page).toHaveURL("/signup");

    await page.getByText("登入").click();
    await expect(page).toHaveURL("/login");
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "登入" }).click();

    // HTML5 validation should prevent submission
    const emailInput = page.getByPlaceholder("name@example.com");
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL("/login");
  });
});

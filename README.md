# 💼 SmartClaim 請款管理系統

一個為中小型企業打造的 **內部請款與審批管理系統**，支援請款單建立、發票上傳、審批流程、報表匯出與權限管理。
本專案以 **Next.js (App Router)** 為核心框架，整合 **Supabase / PostgreSQL** 資料庫與 **TailwindCSS + ShadCN UI** 前端設計，提供輕量、高效且可擴充的解決方案。

---

## 🚀 Features 功能特色

### 🔐 帳號與認證

- 使用 Supabase Auth 的 Email/Password 登入機制
- 角色權限分級：`EMPLOYEE`、`MANAGER`、`ADMIN`
- 忘記密碼與重設功能（可延伸為 Email 驗證連結）

### 📄 請款單管理

- 新增 / 編輯 / 刪除 / 查詢 請款單
- 欄位：請款項目、金額、用途、狀態、備註、日期
- 狀態流程：`DRAFT` → `PENDING` → `APPROVED` / `REJECTED` → `PAID`

### 🧾 發票管理

- 多張發票圖片上傳（jpg/png/pdf）
- 使用 Supabase Storage 或 AWS S3 儲存
- 可預覽 / 刪除 / 下載
- （可選）OCR 擴充擷取發票號碼與金額

### 🔁 審批流程

- 單層審批（主管核准 / 退回）
- 審批通知（Email via Resend / AWS SES）
- 審批歷程紀錄

### 📊 報表匯出

- 支援條件搜尋、日期篩選、狀態過濾
- 匯出 CSV / Excel 報表
- 可視化圖表（本月總請款金額、未付款件數）

### ⚙️ 系統後台

- 使用者帳號管理（新增/停用）
- 權限設定
- 系統設定與維護工具

---

## 🧱 技術架構 (Tech Stack)

| 類別       | 使用技術                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Frontend   | [Next.js 15 (App Router)](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| UI         | [Tailwind CSS v4](https://tailwindcss.com/) + [ShadCN UI](https://ui.shadcn.com/)              |
| Auth       | [Supabase Auth](https://supabase.com/docs/guides/auth)                                         |
| Database   | [PostgreSQL / Supabase DB](https://supabase.com/docs/guides/database)                          |
| ORM        | [Prisma](https://www.prisma.io/)                                                               |
| Storage    | [Supabase Storage / AWS S3](https://supabase.com/docs/guides/storage)                          |
| Email      | [Resend](https://resend.com/) / AWS SES                                                        |
| Deployment | [Vercel](https://vercel.com/)                                                                  |

---

## 📦 Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Docker (for Supabase local development)
- Git

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd erp-invoice-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start Supabase local services**

   ```bash
   supabase start
   ```

   This will start local Supabase services on:
   - API: `http://localhost:54321`
   - Database: `postgresql://postgres:postgres@localhost:54322/postgres`
   - Studio: `http://localhost:54323`
   - Inbucket (email testing): `http://localhost:54324`

4. **Set up environment variables**

   The `.env` file should already be configured for local development:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-local-anon-key>
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
   ```

5. **Run database migrations**

   ```bash
   npx prisma migrate deploy
   ```

6. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Default Test Accounts

Create your first account via the signup page. You can then:

- Access admin panel at `/dashboard/admin` to change user roles
- Test different role permissions (EMPLOYEE, MANAGER, ADMIN)

---

## 🗂️ Project Structure

```
erp-invoice-system/
├── prisma/
│   ├── schema.prisma          # Prisma schema definition
│   └── migrations/            # Database migrations
├── public/                    # Static files
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── admin/       # Admin panel
│   │   │   ├── claims/      # Claims management
│   │   │   └── reports/     # Reports & analytics
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── components/           # React components
│   │   ├── ui/              # ShadCN UI components
│   │   ├── admin/           # Admin components
│   │   ├── claims/          # Claims components
│   │   ├── dashboard/       # Dashboard components
│   │   └── reports/         # Reports components
│   ├── lib/                  # Utility libraries
│   │   ├── prisma.ts        # Prisma client
│   │   └── supabase/        # Supabase clients
│   └── generated/            # Generated Prisma client
├── supabase/
│   ├── config.toml           # Supabase configuration
│   └── migrations/           # Supabase migrations
└── CLAUDE.md                 # Development guidelines
```

---

## 🎯 Key Features & Usage

### 1. User Roles & Permissions

- **EMPLOYEE**: Create and view own claims
- **MANAGER**: Approve/reject claims, access reports
- **ADMIN**: Full system access, user management

### 2. Claim Workflow

1. Employee creates a claim (DRAFT status)
2. Employee submits claim (PENDING status)
3. Manager reviews and approves/rejects
4. Approved claims can be marked as PAID by admin

### 3. File Upload

- Supported formats: JPG, PNG, PDF
- Max file size: 50MB per file
- Files stored in Supabase Storage with RLS policies
- Automatic cleanup on claim deletion

### 4. Reports & Export

- Filter by status, date range, user
- Export to CSV with UTF-8 BOM support
- Real-time statistics dashboard

---

## 🔧 Development Commands

```bash
# Database
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Prisma Studio
npx prisma migrate dev   # Create and apply migration

# Supabase
supabase start          # Start local Supabase
supabase stop           # Stop local Supabase
supabase status         # Check service status
supabase db reset       # Reset database

# Development
npm run dev             # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

---

## 🚀 Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on git push

### Production Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
DATABASE_URL=<your-database-url>
```

---

## 📝 Next Steps & TODOs

- [ ] Implement email notifications (Resend/AWS SES)
- [ ] Add OCR for invoice data extraction
- [ ] Multi-level approval workflow
- [ ] Advanced reporting with charts
- [ ] Mobile responsive improvements
- [ ] PWA support
- [ ] Internationalization (i18n)
- [ ] Unit and E2E tests

---

## 📄 License

MIT License - see LICENSE file for details

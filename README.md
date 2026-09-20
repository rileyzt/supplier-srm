# Supplier SRM Portal

Standalone Supplier Relationship Management (SRM) Portal for manufacturing partners.

## Features
- **Supplier Operations**: Manage order sourcing enquiries, view specifications, review customer customizations.
- **Quotation Submission**: Submit availability, unit cost in CNY, lead time, and factory production notes.
- **Private Reference Photos**: Direct secure streaming of customer reference photos from private Blob storage with strict supplier ownership checks.
- **Bilingual Interface**: Full real-time English and Simplified Chinese (简体中文) support.
- **Supplier-Only Security**: NextAuth session authentication scoped exclusively to supplier accounts (no admin surface).

## Getting Started

1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in `DATABASE_URL` (Neon PostgreSQL), `AUTH_SECRET`, and `BLOB_STORE_ID`.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run locally:
   ```bash
   npm run dev
   ```

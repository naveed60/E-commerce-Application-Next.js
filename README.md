## NextShop — curated commerce starter

NextShop is a modern ecommerce starter built with **Next.js 16 (App Router)**, **TypeScript**, **NextAuth**, **Prisma**, and **PostgreSQL**. It ships with an expressive landing page, responsive navigation, product cards with add-to-cart interactions, and an admin dashboard wired for authentication/authorization.

### Highlights

- **Landing experience**: hero slider, search-as-you-type filtering, feature highlights, responsive layout, mobile sidebar, and animated cart drawer with badge counter.
- **Admin suite**: `/nextshop/admin` is gated behind NextAuth + role-based authorization and includes sidebar navigation, spotlight metrics, live order table, and CTA cards.
- **Authentication**: email/password credentials provider backed by Prisma + bcrypt with registration API and client-side login/register pages.
- **Database ready**: Prisma schema for PostgreSQL (users, products, carts, orders) plus seed script that provisions an admin account and demo catalog.
- **Clean UI foundation**: Tailwind v4, shared button component, cart context, session provider, and remote Unsplash imagery configured in `next.config.ts`.

### Getting started
reate an XLSX file for importing Decision Metro LSD checklists.
Use exactly this workbook format:
Sheet name: import_rows
Row 1 must contain exactly these headers, in this exact order:
decision_category_key
decision_category_en
decision_category_es
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
   ```
3. **Provision the database**
   ```bash
   npm run db:push   # applies Prisma schema to PostgreSQL
   npm run db:seed   # optional: inserts sample catalog + admin user
   ```
   The seed script creates an administrator you can use immediately:
   - Email: `admin@nextshop.dev`
   - Password: `admin123`
4. **Run the development server**
   ```bash
   npm run dev
   ```
   - Landing page: [http://localhost:3000/nextshop](http://localhost:3000/nextshop)
   - Admin dashboard: [http://localhost:3000/nextshop/admin](http://localhost:3000/nextshop/admin)
   - Auth routes: `/login` and `/register`

### Project structure

```
src/
  app/
    nextshop/            # Landing page route
    nextshop/admin/      # Protected admin dashboard
    api/auth/...         # NextAuth + registration handlers
    (auth)/login|register
  components/
    landing/             # Hero slider, header, grid, etc.
    admin/               # Dashboard shell + widgets
    providers/           # Session + cart providers
    cart/                # Cart drawer UI
  data/products.ts       # Featured and slider content
  lib/auth|prisma|utils  # Server utilities
prisma/
  schema.prisma          # PostgreSQL data model
  seed.ts                # Demo catalog + admin bootstrap
```

### Implementation details

- **Responsive navigation**: Hamburger-triggered sidebar, sticky header, stacked search input on mobile, and `lucide-react` icons for clarity.
- **Cart state**: Lightweight context with optimistic add-to-cart interactions and slide-over drawer.
- **Authorization**: `/nextshop/admin` leverages `getServerSession` with role checks; non-admins are redirected to the storefront.
- **UI polish**: Rounded containers, glassmorphism touches, and modern typography via Geist fonts for both public and admin surfaces.

### Next steps

- Plug in real Stripe/checkout logic inside `CartDrawer`.
- Expand admin widgets with real analytics using `prisma` queries once production data exists.
- Connect product grid to live database reads or headless CMS feeds.
# NEXT-js-store

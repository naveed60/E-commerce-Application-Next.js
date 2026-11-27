## NextShop — curated commerce starter

NextShop is a modern ecommerce starter built with **Next.js 16 (App Router)**, **TypeScript**, **NextAuth**, **Prisma**, and **PostgreSQL**. It ships with an expressive landing page, responsive navigation, product cards with add-to-cart interactions, and an admin dashboard wired for authentication/authorization.

### Highlights

- **Landing experience**: hero slider, search-as-you-type filtering, feature highlights, responsive layout, mobile sidebar, and animated cart drawer with badge counter.
- **Admin suite**: `/admin` is gated behind NextAuth + role-based authorization and includes sidebar navigation, spotlight metrics, live order table, and CTA cards.
- **Authentication**: email/password credentials provider backed by Prisma + bcrypt with registration API and client-side login/register pages.
- **Database ready**: Prisma schema for PostgreSQL (users, products, carts, orders) plus seed script that provisions an admin account and demo catalog.
- **Clean UI foundation**: Tailwind v4, shared button component, cart context, session provider, and remote Unsplash imagery configured in `next.config.ts`.

### Getting started

PostgreSQL must be running before you initialize the project. Create an empty
database named `nextshop`, or point `DATABASE_URL` at an existing empty database.

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL, AUTH_SECRET, and the optional service credentials
   ```
3. **Provision the database**
   ```bash
   npm run db:setup  # applies migrations and inserts the demo catalog/admin
   ```
   When your development database is configured in `.env`, open Prisma Studio with `npm run db:studio` so it connects to the same database as Next.js.
   Schema changes are intentionally not run by `npm run build`; apply them explicitly before deploying.
   The seed script creates an administrator you can use immediately:
   - Email: `admin@nextshop.dev`
   - Password: `admin123`
4. **Run the development server**
   ```bash
   npm run dev
   ```
   - Landing page: [http://localhost:3000](http://localhost:3000)
   - Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)
   - Auth routes: `/login` and `/register`

### Safepay checkout

The storefront includes a hosted Safepay checkout at `/checkout` with no login or registration required. Customers enter their name, email, phone, and delivery address; these details and product/price snapshots are saved on the order. Signed-in purchases remain linked to their account. Guest payment status and cancellation are authorized by a 30-day HttpOnly browser cookie; only its SHA-256 hash is stored on the order.

1. Add the Safepay sandbox credentials, `APP_URL`, Resend credentials, and `CRON_SECRET` from `.env.example` to your local environment.
2. Apply the commerce schema with `npm run db:migrate`.
3. In Safepay Dashboard → **Developers → Endpoints**, register:

   ```text
   https://your-public-domain/api/webhooks/safepay
   ```

   Subscribe to `payment.succeeded`, `payment.failed`, `payment.refunded`, `authorization.succeeded`, and `authorization.reversed`.
4. For local webhook testing, expose the app through a TLS tunnel and use the tunnel URL as `APP_URL`; Safepay requires a public HTTPS endpoint.

The redirect back from Safepay only shows payment status. A signed `payment.succeeded` webhook is the sole action that marks an order paid and queues its confirmation email. The included Vercel cron configuration processes email retries and releases stock held by expired checkouts every five minutes. For a non-Vercel deployment, invoke `GET /api/cron/commerce` on the same schedule with `Authorization: Bearer <CRON_SECRET>`.

### Project structure

```
src/
  app/
    (store)/             # Storefront routes
    (store)/admin/       # Protected admin dashboard
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
- **Authorization**: `/admin` leverages `getServerSession` with role checks; non-admins are redirected to the storefront.
- **UI polish**: Rounded containers, glassmorphism touches, and modern typography via Geist fonts for both public and admin surfaces.

### Next steps

- Plug in real Stripe/checkout logic inside `CartDrawer`.
- Expand admin widgets with real analytics using `prisma` queries once production data exists.
- Connect product grid to live database reads or headless CMS feeds.
# NEXT-js-store

### SEO and storefront performance

The public SEO origin defaults to `https://my-store-next-js.vercel.app`, independently
of local checkout/authentication URLs. Set `SITE_URL` to an absolute HTTPS origin
when moving to a custom domain. Canonical URLs, social links, structured data, and
sitemaps all use this origin.

Production pages are indexable by default. Development, localhost origins, and
Vercel previews are excluded automatically. Set `INDEXING_ENABLED=false` for a
self-hosted staging deployment. A preview with production mode also needs this
setting unless `VERCEL_ENV=preview` is present. Rebuild after changing these
settings because static pages and robots metadata are generated at build time.

- Submit `/sitemap-index.xml` to Search Console. It references `/sitemap.xml`
  for public content and `/products/sitemap/0.xml` (and further shards) for
  products, at most 10,000 products per shard. Archived products, empty
  collections, utility pages, and search/sort states are excluded.
- Optionally set `GOOGLE_SITE_VERIFICATION` to the Search Console HTML verification
  token. Domain verification through DNS can be used without an app token.
- `/shop` and collection routes render 24 products per page with ordinary HTML
  search forms and pagination links. Each page has its own canonical URL;
  search/sort results are `noindex`. The homepage renders only 12 new arrivals.
- Catalog and product routes validate page/product existence before entering
  route-local loading fallbacks. Slower catalog results and product details can
  stream behind skeleton UI without turning invalid URLs into HTTP 200 responses.
- Product metadata and page rendering share request-memoized Prisma loaders.
  Public stock and prices are not cached across requests. Checkout continues to
  validate the price and reserve stock independently.
- Displayed star ratings and structured-data aggregates use visible customer
  reviews, not the editable legacy product rating field. Products with no
  published reviews show no aggregate rating.
- Variant links use `/products/<id>?variant=<variant-id>` and restore the matching
  options, image, stock, and price. All variants share the parent canonical URL.
  JSON-LD includes only active variants and their actual SKUs and offers.
- Product, collection, homepage, and related-product images use responsive Next
  Image delivery, reserved aspect ratios, and lazy loading. Hero and main product
  images load eagerly with high fetch priority. Add a trusted host in
  `src/lib/image-hosts.ts` when introducing another image provider; the same
  allowlist configures validation and the optimizer.
- Auth, admin, checkout/payment results, and order tracking have indexing
  exclusions. Authentication and order authorization continue to protect data;
  crawler directives are not access controls.
- Former starter category edits are marked as unavailable and `noindex`.
  Public section pages use Drape & Line branding. Existing product URLs are
  retained; permanent legacy category redirects use 308 responses.

Before deployment, review actual product descriptions/photos, business contact
information, and delivery/returns policies. No manufacturer identifiers, product
specifications, review counts, shipping fees, or analytics account IDs are invented.
Search Console submission, DNS/hosting redirects for a future custom domain,
Merchant Center eligibility/feed setup, and off-page outreach remain account or
business tasks. Changing the default deployment domain requires corresponding
`SITE_URL`, checkout, and authentication configuration.

Validation:

```bash
npm run type-check
npm run db:migrate # apply the additive catalog indexes before deploying
npm run build
node --import tsx tests/seo.test.ts
# Against a locally started production build:
node scripts/verify-seo.mjs http://127.0.0.1:3104
```

Real-user Core Web Vitals and search indexing must be checked after deployment;
source changes and local tests cannot establish field performance or rankings.

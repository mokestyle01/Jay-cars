# JAY — Premium Automotive Marketplace

Jay-cars makes it simple to find and enquire about your preferred vehicle.

JAY is built with the Next.js App Router, TypeScript, Tailwind CSS, and Supabase. It includes a
public vehicle marketplace, customer enquiries and order requests, role-restricted admin tools,
and two authenticated showroom designs.

## Development

Use Node.js 20.9 or newer and Bun (or npm) for local development.

```sh
bun install --frozen-lockfile
bun run dev
```

### Supabase authentication

Create a `.env.local` file in the project root with the Supabase project URL and publishable key:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Email/password and Google, GitHub, Discord, and X sign-in use Supabase Auth. Enable each
provider under **Authentication → Providers**, add its OAuth client credentials, and add the
local and deployed application URLs ending in `/auth` to Supabase's allowed redirect URLs.
Use the Supabase callback URL shown in each provider's settings as that provider's authorized
redirect URI. OAuth client secrets belong in the provider configuration, never in this app.

Profile photos are stored in a private `avatars` bucket and displayed using short-lived signed
URLs. Apply
[`supabase/migrations/20261102223000_create_profile_avatars_bucket.sql`](./supabase/migrations/20261102223000_create_profile_avatars_bucket.sql)
in the Supabase SQL Editor to create the bucket and restrict access and changes to each
authenticated user's own folder.

### Vehicle submissions and customer requests

Apply
[`supabase/migrations/20261103000000_customer_vehicle_submissions_and_requests.sql`](./supabase/migrations/20261103000000_customer_vehicle_submissions_and_requests.sql)
in the Supabase SQL Editor after the profile-photo migration. Signed-in customers can submit
vehicle details and up to six private photos, or send an order enquiry or car-buying
consultation request. Customers can only read their own submissions and requests. Submissions
start in `pending` review status; review and follow-up are handled through the Supabase
dashboard until a staff workflow is added. An order enquiry is not an online purchase or
payment.

### Public marketplace, enquiries, orders, and admin

Apply
[`supabase/migrations/20261113000000_vehicle_marketplace.sql`](./supabase/migrations/20261113000000_vehicle_marketplace.sql)
after the existing migrations. It creates or extends `profiles`, creates marketplace listings,
media, enquiries, and order-request tables, sets up public vehicle media buckets, and applies
Row Level Security. New email and OAuth users receive the `Member` role. Staff can manage
vehicles and customer requests; only superadmins can change user roles.

After creating your account, bootstrap the first superadmin once in the Supabase SQL Editor by
setting that user's role. Replace the email below and verify that exactly one row is updated:

```sql
update public.profiles
set role = 'Superadmin', updated_at = now()
where email = 'owner@example.com';
```

Superadmins can then assign `Admin` and `Superadmin` roles through the dashboard. Do not expose
a service-role key in the browser.
Vehicle images and videos are public to support the public listings; uploads and changes are
restricted to staff. Enquiry and order requests require sign-in and are visible only to their
customer and staff. Order requests do not accept payment.

The public marketplace is available at `/cars`. Admins can add and manage listings at `/admin`;
signed-in customers can review their enquiry and order history at `/my-requests`.
Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in local `.env.local` and Vercel project environment
settings.

The V1 and V2 showrooms include an interactive three-car motion showcase and powertrain
explainer for the existing car models. It is an illustrative, step-by-step animation based on
the displayed fuel type and transmission, not recorded vehicle test footage or a substitute
for verified test results.

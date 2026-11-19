import { contact, contactEmailUrl } from "@/data/contact";

const columns = [
  {
    title: "Explore",
    items: [
      { label: "New arrivals", href: "#models" },
      { label: "Certified stock", href: "#models" },
      { label: "Categories", href: "#categories" },
      { label: "Flagship", href: "#flagship" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About JAY", href: "#top" },
      { label: "Careers", href: contactEmailUrl("Careers at JAY") },
      { label: "Press", href: contactEmailUrl("Press enquiry") },
      { label: "Partners", href: contactEmailUrl("Partnership enquiry") },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Financing", href: contactEmailUrl("Financing enquiry") },
      { label: "Trade-in", href: contactEmailUrl("Trade-in enquiry") },
      { label: "Delivery", href: contactEmailUrl("Delivery enquiry") },
      { label: "Contact", href: `mailto:${contact.email}` },
    ],
  },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-2xl tracking-[0.3em] text-foreground">JAY</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              <a href={`tel:${contact.phoneHref}`} className="transition-colors hover:text-foreground">
                {contact.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${contact.email}`} className="transition-colors hover:text-foreground">
                {contact.email}
              </a>
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-xs uppercase tracking-[0.3em] text-brand">{column.title}</p>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {column.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="transition-colors hover:text-foreground">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-16 border-t border-border pt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} JAY Atelier. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

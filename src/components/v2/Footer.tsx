import { contact, contactEmailUrl } from "@/data/contact";

const columns = [
  {
    title: "Shop",
    items: [
      { label: "Lineup", href: "#lineup" },
      { label: "Electric", href: "#categories" },
      { label: "Performance", href: "#performance" },
      { label: "Pre-owned", href: "#lineup" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "#top" },
      { label: "Careers", href: contactEmailUrl("Careers at JAY") },
      { label: "Newsroom", href: contactEmailUrl("Press enquiry") },
      { label: "Locations", href: contactEmailUrl("Location enquiry") },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "Financing", href: "#financing" },
      { label: "Trade-in", href: contactEmailUrl("Trade-in enquiry") },
      { label: "Delivery", href: contactEmailUrl("Delivery enquiry") },
      { label: "Contact", href: `mailto:${contact.email}` },
    ],
  },
];

export function Footer() {
  return (
    <footer id="contact" className="px-3 pb-6 sm:px-5">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-surface p-8 shadow-elevate sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-4xl tracking-wide text-foreground">
              <span className="text-primary">JAY</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
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
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                {column.title}
              </p>
              <ul className="mt-5 space-y-3 text-sm font-semibold text-muted-foreground">
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
        <p className="mt-12 border-t border-border pt-6 text-xs font-semibold text-muted-foreground">
          © {new Date().getFullYear()} JAY Motors. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

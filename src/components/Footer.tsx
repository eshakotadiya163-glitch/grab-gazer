import { Link } from "@tanstack/react-router";
import {
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Leaf,
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
} from "lucide-react";

const quickLinks = [
  { to: "/shop", label: "Shop All" },
  { to: "/about", label: "About Us" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact Us" },
];

const helpLinks = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/returns", label: "Returns & Exchanges" },
  { to: "/my-orders", label: "Track Order" },
];

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

const paymentBadges = [
  { icon: CreditCard, label: "Cards" },
  { icon: Wallet, label: "UPI" },
  { icon: Banknote, label: "COD" },
  { icon: ShieldCheck, label: "Secure" },
];

export function Footer() {
  return (
    <footer className="bg-cream text-foreground">
      <div className="container-tight py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-sage-deep" />
              <span className="font-[family-name:var(--font-display)] text-xl font-semibold">
                The Woman's Company
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sustainable, safe and comfortable feminine wellness products —
              thoughtfully designed for every stage of life.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background transition-all hover:-translate-y-0.5 hover:border-sage hover:text-sage-deep"
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-sage-deep">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Help
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {helpLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-sage-deep">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />
                <span>First Floor, Local Shopping Complex, 7, Panchsheel Marg, New Delhi 110017</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-sage-deep" />
                <a href="mailto:sales@ecosattvastore.com" className="hover:text-foreground">
                  sales@ecosattvastore.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-sage-deep" />
                <a href="tel:+911140000000" className="hover:text-foreground">
                  +91 11 4000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026, The Woman's Company. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-wider text-muted-foreground">
              We Accept
            </span>
            {paymentBadges.map((p) => (
              <span
                key={p.label}
                className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground/80"
                title={p.label}
              >
                <p.icon className="h-3.5 w-3.5 text-sage-deep" />
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

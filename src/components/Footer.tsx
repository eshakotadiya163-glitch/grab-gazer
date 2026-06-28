import { Link } from "@tanstack/react-router";
import { Twitter, Facebook, Instagram, Mail, MapPin, Leaf } from "lucide-react";

const quickLinks = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/returns", label: "Returns & Exchanges" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact Us" },
];

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
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
              We provide sustainable, safe, and comfortable feminine hygiene products designed for
              every stage of life.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Contact</h3>
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
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Follow Us</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background transition-colors hover:border-sage hover:text-sage-deep"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026, The Woman's Company</p>
        </div>
      </div>
    </footer>
  );
}

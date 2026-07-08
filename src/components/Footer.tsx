import { Link } from "@tanstack/react-router";
import {
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  ArrowRight
} from "lucide-react";

const quickLinks = [
  { to: "/shop", label: "Shop All Collections" },
  { to: "/about", label: "Our Philosophy" },
  { to: "/blog", label: "The Journal" },
  { to: "/contact", label: "Contact Concierge" },
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

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-tight pt-20 pb-12">
        {/* Top Section: Newsletter */}
        <div className="flex flex-col items-center text-center pb-16 border-b border-background/10 mb-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-medium tracking-wide mb-4">
            Join The Inner Circle
          </h2>
          <p className="text-background/70 mb-8 max-w-md text-sm leading-relaxed">
            Subscribe to receive exclusive access to new product launches, curated editorial content, and private sales.
          </p>
          <form 
            className="flex w-full max-w-md relative"
            onSubmit={(e) => {
              e.preventDefault();
              // handle newsletter submission
            }}
          >
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="w-full bg-transparent border-b border-background/30 pb-3 pr-10 text-sm outline-none transition-colors focus:border-sage placeholder:text-background/30"
              required
            />
            <button 
              type="submit" 
              className="absolute right-0 top-0 bottom-3 flex items-center justify-center text-background/50 hover:text-sage transition-colors"
              aria-label="Subscribe"
            >
              <ArrowRight className="w-5 h-5 stroke-[1.5]" />
            </button>
          </form>
        </div>

        {/* Main Footer Links */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-[family-name:var(--font-display)] text-2xl tracking-widest uppercase">
                The Women<br/>Company
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-background/60 pr-4">
              Curated luxury wellness and premium care essentials, designed to elevate your everyday rituals.
            </p>
            <div className="flex items-center gap-4 pt-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/50 transition-all hover:text-sage hover:-translate-y-0.5"
                  aria-label={s.label}
                >
                  <s.icon className="h-5 w-5 stroke-[1.5]" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-background/90">
              Discover
            </h3>
            <ul className="space-y-4 text-sm text-background/60">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-sage">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-background/90">
              Client Services
            </h3>
            <ul className="space-y-4 text-sm text-background/60">
              {helpLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-background/90">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-background/60">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-background/40 stroke-[1.5]" />
                <span className="leading-relaxed">7 Panchsheel Marg<br/>New Delhi 110017, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-background/40 stroke-[1.5]" />
                <a href="mailto:concierge@thewomencompany.com" className="transition-colors hover:text-primary">
                  concierge@thewomencompany.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-background/40 stroke-[1.5]" />
                <a href="tel:+911140000000" className="transition-colors hover:text-primary">
                  +91 11 4000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
          <p className="text-xs text-background/40 tracking-wide">
            © {new Date().getFullYear()} THE WOMEN COMPANY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6 text-xs text-background/40 tracking-wide">
            <Link to="/privacy" className="hover:text-background/80 transition-colors">PRIVACY</Link>
            <Link to="/terms" className="hover:text-background/80 transition-colors">TERMS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

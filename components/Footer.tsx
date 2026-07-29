import React from "react";
import Link from "next/link";
import { Utensils, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Utensils className="h-6 w-6" />
              <span>Gusto<span className="text-foreground font-light">Bites</span></span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Experience the finest gourmet meals delivered fresh to your doorstep. Satisfying your cravings, one bite at a time.
            </p>
            <div className="flex gap-4 text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054 1.14.051 1.96.23 2.53.45a5.58 5.58 0 011.95 1.27 5.58 5.58 0 011.27 1.95c.22.57.4 1.39.45 2.53.044.925.054 1.278.054 3.71s-.01 2.784-.054 3.71c-.051 1.14-.23 1.96-.45 2.53a5.58 5.58 0 01-1.27 1.95 5.58 5.58 0 01-1.95 1.27c-.57.22-1.39.4-2.53.45-.925.044-1.278.054-3.71.054s-2.784-.01-3.71-.054c-1.14-.051-1.96-.23-2.53-.45a5.58 5.58 0 01-1.95-1.27 5.58 5.58 0 01-1.27-1.95c-.22-.57-.4-1.39-.45-2.53C2.01 14.815 2 14.462 2 12s.01-2.784.054-3.71c.051-1.14.23-1.96.45-2.53a5.58 5.58 0 011.27-1.95A5.58 5.58 0 015.67 2.23c.57-.22 1.39-.4 2.53-.45C9.105 2.01 9.458 2 12 2h.315zm0 1.44c-2.395 0-2.72.01-3.665.053-.94.043-1.45.2-1.8.34a3.84 3.84 0 00-1.4 1.01 3.84 3.84 0 00-1.01 1.4c-.14.35-.29.86-.34 1.8-.043.945-.053 1.27-.053 3.665s.01 2.72.053 3.665c.043.94.2 1.45.34 1.8a3.84 3.84 0 001.01 1.4 3.84 3.84 0 001.4 1.01c.35.14.86.29 1.8.34.945.043 1.27.053 3.665.053s2.72-.01 3.665-.053c.94-.043 1.45-.2 1.8-.34a3.84 3.84 0 001.4-1.01 3.84 3.84 0 001.01-1.4c.14-.35.29-.86.34-1.8.043-.945.053-1.27.053-3.665s-.01-2.72-.053-3.665c-.043-.94-.2-1.45-.34-1.8a3.84 3.84 0 00-1.01-1.4 3.84 3.84 0 00-1.4-1.01c-.35-.14-.86-.29-1.8-.34-.945-.043-1.27-.053-3.665-.053zM12 6.865A5.135 5.135 0 1017.135 12 5.135 5.135 0 0012 6.865zm0 8.83A3.695 3.695 0 1115.695 12 3.695 3.695 0 0112 15.695zm5.83-9.98a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-primary transition-colors">Order Menu</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Opening Hours</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex justify-between"><span>Mon - Fri:</span> <span>10:00 AM - 11:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday:</span> <span>09:00 AM - Midnight</span></li>
              <li className="flex justify-between"><span>Sunday:</span> <span>09:00 AM - 10:00 PM</span></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>123 Culinary Boulevard, Foodville, NY 10001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>orders@gustobites.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-border my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} GustoBites Restaurant. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { Shield, Mail, FileText, Lock } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: "Contact", href: "/contact", icon: Mail },
    { name: "Privacy Policy", href: "/privacy", icon: FileText },
    { name: "Security", href: "/security", icon: Lock },
  ];

  return (
    <footer className="bg-card border-t border-card-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Description */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">SecureVote</h3>
              <p className="text-sm text-muted-foreground">
                Secure, transparent, accessible voting
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex items-center space-x-6">
            {footerLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-card-border">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} SecureVote. All rights reserved. Building trust in democratic processes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
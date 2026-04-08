import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="gradient-hero text-primary-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">
              THE SUMMIT <span className="text-gradient-gold">LLP</span>
            </h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Advancing Healthcare Quality & Sustainability through global standards,
              innovation, and leadership excellence.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-gold">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {["About", "Speakers", "Conference", "Register"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="text-primary-foreground/70 text-sm hover:text-gold transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-gold">Contact</h4>
            <div className="text-primary-foreground/70 text-sm space-y-2">
              <p>Email: info@thesummitllp.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-12 pt-8">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Link to="/privacy-policy" className="text-primary-foreground/50 text-xs hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/refund-policy" className="text-primary-foreground/50 text-xs hover:text-gold transition-colors">Refund Policy</Link>
            <Link to="/cancellation-policy" className="text-primary-foreground/50 text-xs hover:text-gold transition-colors">Cancellation Policy</Link>
            <Link to="/confidentiality-statement" className="text-primary-foreground/50 text-xs hover:text-gold transition-colors">Confidentiality Statement</Link>
          </div>
          <p className="text-primary-foreground/50 text-xs text-center">
            © {new Date().getFullYear()} The Summit LLP. All Rights Reserved. | Registered LLP
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroBg from "@/assets/hero-bg.jpg";
import keralaImg from "@/assets/kerala.jpg";
import goaImg from "@/assets/goa.jpg";
import amritsarImg from "@/assets/amritsar.jpg";
import DestinationCard from "@/components/DestinationCard";
import PaymentModal from "@/components/PaymentModal";
import ChatBot from "@/components/ChatBot";

const destinations = [
  {
    id: "kerala",
    name: "Kerala",
    tagline: "God's Own Country",
    price: 1,
    image: keralaImg,
    highlights: ["Backwater houseboat cruise", "Munnar tea plantations", "Ayurvedic spa experience", "Fort Kochi heritage walk"],
    duration: "5 Days / 4 Nights",
  },
  {
    id: "goa",
    name: "Goa",
    tagline: "Beach Paradise",
    price: 1,
    image: goaImg,
    highlights: ["Beach hopping tour", "Old Goa heritage sites", "Dudhsagar Falls trip", "Night cruise party"],
    duration: "4 Days / 3 Nights",
  },
  {
    id: "amritsar",
    name: "Amritsar",
    tagline: "The Golden City",
    price: 1,
    image: amritsarImg,
    highlights: ["Golden Temple visit", "Wagah Border ceremony", "Jallianwala Bagh memorial", "Street food trail"],
    duration: "3 Days / 2 Nights",
  },
];

const Index = () => {
  const [selectedDest, setSelectedDest] = useState<typeof destinations[0] | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold gradient-text">Where Is My Trip</h2>
          <div className="hidden md:flex items-center gap-8">
            <a href="#destinations" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Destinations</a>
            <button onClick={() => navigate("/planner")} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">AI Planner</button>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</a>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-foreground">
                  <User className="w-4 h-4 text-primary" />
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Travel landscape" className="absolute inset-0 w-full h-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-primary-foreground mb-6 animate-fade-up">
            Where Is My Trip
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 font-body animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Explore India's most beautiful destinations — starting at just ₹1
          </p>
          <a
            href="#destinations"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            Explore Plans
          </a>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Our Travel Plans</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Choose your dream destination and embark on an unforgettable journey
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} onBook={() => {
                if (!user) {
                  navigate("/auth");
                  return;
                }
                setSelectedDest(dest);
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl font-bold text-foreground mb-6">About Us</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Where Is My Trip</strong> is your trusted travel companion, curating the best experiences across India. 
            We believe everyone deserves to explore — that's why our plans start at just ₹1. 
            Our AI travel assistant is available 24/7 to help you plan your perfect getaway.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl font-bold text-foreground mb-10">Get In Touch</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <a href="tel:+919082494524" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-5 h-5 text-primary" />
              <span>+91 9082494524</span>
            </a>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-5 h-5 text-primary" />
              <span>hello@whereismytrip.in</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Mumbai, India</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground/70 py-8 px-4 text-center">
        <p className="text-sm">© 2026 Where Is My Trip. All rights reserved.</p>
      </footer>

      {/* Chat FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity animate-float"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* ChatBot */}
      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}

      {/* Payment Modal */}
      {selectedDest && (
        <PaymentModal destination={selectedDest} onClose={() => setSelectedDest(null)} />
      )}
    </div>
  );
};

export default Index;

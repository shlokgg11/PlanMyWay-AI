import { MapPin, Clock } from "lucide-react";

interface Destination {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  highlights: string[];
  duration: string;
}

const DestinationCard = ({ destination, onBook }: { destination: Destination; onBook: () => void }) => {
  return (
    <div className="bg-card rounded-lg overflow-hidden card-hover" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="relative h-64 overflow-hidden">
        <img src={destination.image} alt={destination.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
          ₹{destination.price}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{destination.tagline}</span>
        </div>
        <h3 className="font-display text-2xl font-bold text-card-foreground mb-3">{destination.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Clock className="w-4 h-4" />
          <span>{destination.duration}</span>
        </div>
        <ul className="space-y-2 mb-6">
          {destination.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              {h}
            </li>
          ))}
        </ul>
        <button
          onClick={onBook}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Book Now — ₹{destination.price}
        </button>
      </div>
    </div>
  );
};

export default DestinationCard;

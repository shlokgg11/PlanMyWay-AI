import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, IndianRupee, Trash2, Eye, Plane, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SavedTrip {
  id: string;
  title: string;
  destination: string;
  duration: string | null;
  budget: string | null;
  summary: string | null;
  created_at: string;
  itinerary_data: any;
}

const MyTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from("saved_itineraries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load trips", variant: "destructive" });
    } else {
      setTrips(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("saved_itineraries").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete trip", variant: "destructive" });
    } else {
      setTrips((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Trip deleted" });
    }
  };

  const handleView = (trip: SavedTrip) => {
    navigate("/planner", { state: { itinerary: trip.itinerary_data } });
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-2xl font-bold gradient-text">My Trips</h2>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <Plane className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No saved trips yet</h3>
            <p className="text-muted-foreground mb-6">Generate an itinerary with the AI Trip Planner to get started!</p>
            <Button onClick={() => navigate("/planner")}>
              <Plane className="w-4 h-4" />
              Go to Trip Planner
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-card rounded-xl border border-border p-5 flex flex-col md:flex-row md:items-center gap-4"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-foreground truncate">{trip.title}</h3>
                  {trip.summary && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{trip.summary}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />{trip.destination}
                    </span>
                    {trip.duration && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{trip.duration}
                      </span>
                    )}
                    {trip.budget && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <IndianRupee className="w-3 h-3" />{trip.budget}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(trip.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleView(trip)}>
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(trip.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrips;

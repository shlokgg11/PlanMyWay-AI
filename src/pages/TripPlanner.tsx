import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plane, MapPin, Clock, IndianRupee, Sparkles, Download, Loader2, Lightbulb, Save, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ItineraryMap from "@/components/ItineraryMap";
import { generateItineraryPDF } from "@/lib/pdfGenerator";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  time: string;
  activity: string;
  location: string;
  cost: string;
}

interface Day {
  day: number;
  title: string;
  activities: Activity[];
}

interface Location {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

interface Itinerary {
  title: string;
  destination: string;
  duration: string;
  budget: string;
  summary: string;
  locations: Location[];
  days: Day[];
  tips: string[];
  totalEstimatedCost: string;
}

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-itinerary`;

const TripPlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  // Load itinerary from navigation state (viewing a saved trip)
  useEffect(() => {
    const state = location.state as { itinerary?: Itinerary } | null;
    if (state?.itinerary) {
      setItinerary(state.itinerary);
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!destination.trim() || !duration.trim() || !budget.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    setItinerary(null);

    try {
      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          destination: destination.trim(),
          duration: parseInt(duration),
          budget: budget.trim(),
          interests: interests.trim(),
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate itinerary");
      }

      const data = await resp.json();
      setItinerary(data.itinerary);
      toast({ title: "✨ Itinerary generated!", description: "Scroll down to see your trip plan" });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!itinerary) return;
    generateItineraryPDF(itinerary);
    toast({ title: "PDF downloaded!", description: "Check your downloads folder" });
  };

  const handleSaveItinerary = async () => {
    if (!itinerary || !user) {
      toast({ title: "Please log in to save trips", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("saved_itineraries").insert({
      user_id: user.id,
      title: itinerary.title,
      destination: itinerary.destination,
      duration: itinerary.duration,
      budget: itinerary.totalEstimatedCost,
      summary: itinerary.summary,
      itinerary_data: itinerary as any,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save trip", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Trip saved!", description: "View it anytime from My Trips" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-2xl font-bold gradient-text">AI Trip Planner</h2>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate("/my-trips")}>
              <BookOpen className="w-4 h-4" />
              My Trips
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Form */}
        <div className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Plan Your Dream Trip</h3>
              <p className="text-sm text-muted-foreground">AI generates a detailed day-by-day itinerary with map</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />Destination *
              </label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Paris, Bali..."
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                <Clock className="w-3.5 h-3.5 inline mr-1" />Duration (days) *
              </label>
              <Input
                type="number"
                min={1}
                max={30}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 5"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                <IndianRupee className="w-3.5 h-3.5 inline mr-1" />Budget (₹) *
              </label>
              <Input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 25000"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                <Lightbulb className="w-3.5 h-3.5 inline mr-1" />Interests
              </label>
              <Input
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. adventure, food, culture, nature..."
                disabled={loading}
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto" size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating your itinerary...
              </>
            ) : (
              <>
                <Plane className="w-4 h-4" />
                Generate Itinerary
              </>
            )}
          </Button>
        </div>

        {/* Itinerary Result */}
        {itinerary && (
          <div className="space-y-8 animate-fade-up">
            {/* Header + Download */}
            <div className="bg-card rounded-xl border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground">{itinerary.title}</h2>
                  <p className="text-muted-foreground mt-1">{itinerary.summary}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button onClick={handleSaveItinerary} disabled={saving} variant="default" className="shrink-0">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Trip"}
                  </Button>
                  <Button onClick={handleDownloadPDF} variant="outline" className="shrink-0">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                  <Clock className="w-3.5 h-3.5" />{itinerary.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-sm font-medium">
                  <IndianRupee className="w-3.5 h-3.5" />{itinerary.totalEstimatedCost}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-accent/20 text-accent-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                  <MapPin className="w-3.5 h-3.5" />{itinerary.destination}
                </span>
              </div>
            </div>

            {/* Map */}
            {itinerary.locations && itinerary.locations.length > 0 && (
              <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="p-4 border-b border-border">
                  <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />Trip Locations
                  </h3>
                </div>
                <ItineraryMap locations={itinerary.locations} />
              </div>
            )}

            {/* Day-by-day */}
            <div className="space-y-4">
              {itinerary.days.map((day) => (
                <div key={day.day} className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">{day.title}</h3>
                  <div className="space-y-3">
                    {day.activities.map((act, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <span className="text-sm font-mono text-primary font-semibold min-w-[80px] pt-0.5">{act.time}</span>
                        <div className="flex-1">
                          <p className="text-sm text-foreground font-medium">{act.activity}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{act.location}
                            </span>
                            {act.cost && act.cost !== "₹0" && (
                              <span className="text-xs text-primary font-medium">{act.cost}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />Travel Tips
                </h3>
                <ul className="space-y-2">
                  {itinerary.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ElectionCard, { type Election } from "@/components/ui/ElectionCard";
import { useToast } from "@/hooks/use-toast";
import { getEvents } from "@/lib/api";

const Elections = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const [events, setEvents] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getEvents();
        const now = new Date();
        const mapped: Election[] = ((res.data as any[]) || []).map((ev: any) => {
          const start = ev.startAt ? new Date(ev.startAt) : new Date(ev.createdAt);
          const end = ev.endAt ? new Date(ev.endAt) : null;
          let status: Election["status"] = "active";
          if (start && now < start) status = "upcoming";
          else if (end && now > end) status = "completed";
          else status = "active";
          return {
            id: ev._id,
            title: ev.title,
            description: ev.description,
            startDate: start.toISOString(),
            endDate: (end || new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)).toISOString(),
            status,
            totalVoters: 0,
          };
        });
        setEvents(mapped);
      } catch (err: any) {
        toast({
          title: "Failed to load elections",
          description:
            err?.response?.data?.message || err?.message || "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [toast]);

  const filteredElections = events.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || election.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: "All Elections" },
    { value: "active", label: "Active" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          All Elections
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Browse and participate in democratic elections. Your voice matters.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-card rounded-xl border border-card-border p-6 mb-8 shadow-card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search elections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(option.value)}
              >
                <Filter className="mr-1 h-3 w-3" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Elections Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Vote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Loading Elections...
          </h3>
        </div>
      ) : filteredElections.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election, index) => (
            <div
              key={election.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ElectionCard
                election={election}
                onVote={(id) => navigate(`/vote/${id}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Vote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Elections Found
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? `No elections match your search for "${searchTerm}"`
              : "No elections match your filter criteria"}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Election Summary */}
      <div className="mt-12 bg-gradient-card rounded-xl border border-card-border p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">
              {events.filter(e => e.status === "active").length}
            </div>
            <div className="text-muted-foreground">Active Elections</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-warning mb-2">
              {events.filter(e => e.status === "upcoming").length}
            </div>
            <div className="text-muted-foreground">Upcoming Elections</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-muted-foreground mb-2">
              {events.filter(e => e.status === "completed").length}
            </div>
            <div className="text-muted-foreground">Completed Elections</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Elections;
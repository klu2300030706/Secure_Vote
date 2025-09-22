import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Vote, Calendar, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ElectionCard from "@/components/ui/ElectionCard";
import type { Election } from "@/components/ui/ElectionCard";
import { useToast } from "@/hooks/use-toast";
import { getEvents } from "@/lib/api";

const MyElections = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userElections, setUserElections] = useState<Election[]>([]);
  const [votedElections, setVotedElections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const voted = JSON.parse(localStorage.getItem("votedElections") || "[]");
        setVotedElections(voted);
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
            hasVoted: voted.includes(ev._id),
          };
        });
        setUserElections(mapped);
      } catch (err: any) {
        toast({
          title: "Failed to load elections",
          description: err?.response?.data?.message || err?.message || "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [toast]);

  const handleVote = (electionId: string) => {
    navigate(`/vote/${electionId}`);
  };

  const availableElections = userElections.filter(e => e.status === "active" && !e.hasVoted);
  const votedElectionsList = userElections.filter(e => e.hasVoted);
  const upcomingElections = userElections.filter(e => e.status === "upcoming");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          My Elections
        </h1>
        <p className="text-xl text-muted-foreground">
          Manage your voting activities and track your participation.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-card rounded-xl border border-card-border p-6 shadow-card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Vote className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-foreground">
                {availableElections.length}
              </div>
              <div className="text-sm text-muted-foreground">Available to Vote</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-card rounded-xl border border-card-border p-6 shadow-card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-foreground">
                {votedElectionsList.length}
              </div>
              <div className="text-sm text-muted-foreground">Votes Cast</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-card rounded-xl border border-card-border p-6 shadow-card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-foreground">
                {upcomingElections.length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-card rounded-xl border border-card-border p-6 shadow-card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-foreground">
                {userElections.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Elections</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Elections */}
      {loading ? (
        <div className="text-center py-16">
          <Vote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Loading...</h3>
        </div>
      ) : availableElections.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Available to Vote
            </h2>
            <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
              {availableElections.length} Active
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableElections.map((election, index) => (
              <div
                key={election.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ElectionCard
                  election={election}
                  onVote={handleVote}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Elections */}
      {upcomingElections.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Upcoming Elections
            </h2>
            <div className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm font-medium">
              {upcomingElections.length} Scheduled
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingElections.map((election, index) => (
              <div
                key={election.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ElectionCard
                  election={election}
                  showVoteButton={false}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Voted Elections */}
      {votedElectionsList.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Elections You've Voted In
            </h2>
            <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
              {votedElectionsList.length} Completed
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {votedElectionsList.map((election, index) => (
              <div
                key={election.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ElectionCard
                  election={election}
                  showVoteButton={false}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && userElections.length === 0 && (
        <div className="text-center py-16">
          <Vote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Elections Available
          </h3>
          <p className="text-muted-foreground mb-6">
            There are currently no elections assigned to your account.
          </p>
          <Button variant="outline" onClick={() => navigate("/elections")}>
            Browse All Elections
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyElections;
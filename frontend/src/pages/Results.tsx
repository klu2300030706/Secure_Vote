import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAdminEvents, getEventResults } from "@/lib/api";

const Results = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedElection, setSelectedElection] = useState<string | null>(null);
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{ event: any; results: any[] } | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await getAdminEvents();
        const now = new Date();
        const mapped = ((res.data as any[]) || []).map((ev: any) => {
          const start = ev.startAt ? new Date(ev.startAt) : new Date(ev.createdAt);
          const end = ev.endAt ? new Date(ev.endAt) : null;
          let status: 'upcoming' | 'active' | 'completed' = 'active';
          if (start && now < start) status = 'upcoming';
          else if (end && now > end) status = 'completed';
          else status = 'active';
          return { ...ev, status };
        });
        setEvents(mapped);
      } catch (err: any) {
        toast({
          title: "Failed to load events",
          description: err?.response?.data?.message || err?.message || "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [toast]);

  const completedElections = events.filter(e => e.status === 'completed');
  const filteredElections = completedElections.filter((e: any) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadResults = async (electionId: string) => {
    try {
      setSelectedElection(electionId);
      const res = await getEventResults(electionId);
      const data = res.data as { event: any; results: any[] };
      setResults(data);
    } catch (err: any) {
      toast({
        title: "Failed to load results",
        description: err?.response?.data?.message || err?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Election Results
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transparent and verifiable results from completed elections.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Elections List */}
      {!selectedElection && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Loading...</h3>
            </div>
          ) : filteredElections.length > 0 ? (
            filteredElections.map((election: any) => (
              <Card
                key={election._id}
                className="bg-gradient-card border-card-border hover:shadow-elevated transition-all duration-300 cursor-pointer"
                onClick={() => loadResults(election._id)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {election.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        {election.description}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 mr-1 text-success" />
                        <span>Completed</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Results Found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? `No completed elections match "${searchTerm}"`
                  : "No completed elections available yet"}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Detailed Results */}
      {selectedElection && results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedElection(null);
                setResults(null);
              }}
            >
              ← Back to Results
            </Button>
          </div>

          {(() => {
            const election = results.event;
            const r = results.results || [];
            const totalVotes = r.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
            const withPercent = r
              .map((item: any) => ({
                ...item,
                percentage: totalVotes > 0 ? (item.count / totalVotes) * 100 : 0,
              }))
              .sort((a: any, b: any) => b.count - a.count);

            return (
              <>
                {/* Election Header */}
                <Card className="bg-gradient-card border-card-border shadow-card">
                  <div className="p-6">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      {election.title}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {election.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {formatNumber(totalVotes)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Votes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-secondary mb-1">
                          {withPercent.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Options</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success mb-1">
                          {totalVotes}
                        </div>
                        <div className="text-sm text-muted-foreground">Votes Counted</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                  {withPercent.map((item: any, index: number) => (
                    <Card
                      key={item.optionId}
                      className={`bg-gradient-card border-card-border shadow-card ${
                        index === 0 ? "ring-2 ring-success/50" : ""
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            {index === 0 && (
                              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center mr-3">
                                <TrendingUp className="h-4 w-4 text-success-foreground" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-xl font-bold text-foreground">
                                {item.option}
                              </h3>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">
                              {item.percentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatNumber(item.count || 0)} votes
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              index === 0 ? "bg-success" : "bg-primary"
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Results;
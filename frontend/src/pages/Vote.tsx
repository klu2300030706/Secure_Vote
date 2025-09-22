import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Vote as VoteIcon, Clock, Users, ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getEvent, voteForEvent } from "@/lib/api";

type EventOption = { _id: string; name: string; voteCount?: number };
type EventDoc = {
  _id: string;
  title: string;
  description: string;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  options: EventOption[];
};

const Vote = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (!electionId) {
      navigate("/elections");
      return;
    }

    const loadEvent = async () => {
      setLoading(true);
      try {
        const res = await getEvent(electionId);
        const ev = res.data as EventDoc;
        if (!ev?._id) {
          throw new Error("Event not found");
        }
        // Determine active status from dates
        const now = new Date();
        const start = ev.startAt ? new Date(ev.startAt) : new Date(ev.createdAt);
        const end = ev.endAt ? new Date(ev.endAt) : null;
        const notStarted = start && now < start;
        const ended = end && now > end;
        if (notStarted || ended) {
          toast({
            title: notStarted ? "Election Not Started" : "Election Ended",
            description: notStarted
              ? "This election hasn't started yet. Please check back later."
              : "This election is no longer accepting votes.",
            variant: "destructive",
          });
          navigate("/elections");
          return;
        }
        setEvent(ev);
      } catch (err: any) {
        toast({
          title: "Election Not Found",
          description: err?.response?.data?.message || err?.message || "Unable to load election",
          variant: "destructive",
        });
        navigate("/elections");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [electionId, navigate, toast]);

  const handleVoteSubmit = () => {
    if (!selectedOption) {
      toast({
        title: "No Candidate Selected",
        description: "Please select a candidate before submitting your vote.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmation(true);
  };

  const confirmVote = async () => {
    if (!selectedOption || !electionId) return;

    setIsSubmitting(true);

    try {
      await voteForEvent(electionId, selectedOption);
      toast({
        title: "Vote Successfully Cast!",
        description: `Your vote has been recorded.`,
        variant: "default",
      });
      // Update local UI marker for voted elections (used by MyElections page)
      try {
        const votedRaw = localStorage.getItem("votedElections");
        const voted: string[] = votedRaw ? JSON.parse(votedRaw) : [];
        if (!voted.includes(electionId)) {
          voted.push(electionId);
          localStorage.setItem("votedElections", JSON.stringify(voted));
        }
      } catch {}
      navigate("/my-elections");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message;
      toast({
        title: "Voting Failed",
        description: msg || "There was an error submitting your vote. Please try again.",
        variant: "destructive",
      });
      // If duplicate vote
      if (msg && /already voted/i.test(msg)) {
        navigate("/my-elections");
      }
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!event) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-elections")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Elections
        </Button>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Cast Your Vote
        </h1>
        <p className="text-xl text-muted-foreground">
          Your participation in democracy matters. Make your choice carefully.
        </p>
      </div>

      {/* Election Info */}
      <Card className="bg-gradient-card border-card-border shadow-card mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {event.title}
          </h2>
          <p className="text-muted-foreground mb-6">
            {event.description}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>Ends: {formatDate(event.endAt || event.createdAt)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>{(event.options?.length || 0)} options</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Voting Instructions */}
      <Card className="bg-warning/5 border-warning/20 mb-8">
        <div className="p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Important Voting Instructions
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select only one candidate from the list below</li>
                <li>• Review your selection carefully before submitting</li>
                <li>• Once submitted, your vote cannot be changed</li>
                <li>• You will receive a confirmation receipt after voting</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Candidates */}
      <div className="space-y-4 mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">
          Select Your Candidate
        </h3>
        
        {(event.options || []).map((option: any) => (
          <Card
            key={option._id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-elevated ${
              selectedOption === option._id
                ? "ring-2 ring-primary bg-primary/5 border-primary"
                : "border-card-border hover:border-primary/50"
            }`}
            onClick={() => setSelectedOption(option._id)}
          >
            <div className="p-6">
              <div className="flex items-start">
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-4 mt-1 flex items-center justify-center ${
                    selectedOption === option._id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {selectedOption === option._id && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-semibold text-foreground">
                      {option.name}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Submit Vote */}
      <Card className="bg-gradient-card border-card-border shadow-card">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Ready to Submit Your Vote?
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedOption
                  ? `You have selected: ${(event.options || []).find((o: any) => o._id === selectedOption)?.name}`
                  : "Please select a candidate to continue"}
              </p>
            </div>
            <Button
              variant="vote"
              size="lg"
              onClick={handleVoteSubmit}
              disabled={!selectedOption}
            >
              <VoteIcon className="mr-2 h-5 w-5" />
              Submit Vote
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-gradient-card border-card-border shadow-elevated">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Confirm Your Vote
                </h3>
                <p className="text-muted-foreground">
                  Are you sure you want to vote for{" "}
                  <span className="font-semibold text-foreground">
                    {(event.options || []).find((o: any) => o._id === selectedOption)?.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="vote"
                  className="flex-1"
                  onClick={confirmVote}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-foreground mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Confirm Vote
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Vote;
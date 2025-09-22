import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  totalVoters: number;
  hasVoted?: boolean;
}

interface ElectionCardProps {
  election: Election;
  onVote?: (electionId: string) => void;
  showVoteButton?: boolean;
}

const ElectionCard = ({ election, onVote, showVoteButton = true }: ElectionCardProps) => {
  const getStatusColor = (status: Election["status"]) => {
    switch (status) {
      case "upcoming":
        return "text-warning";
      case "active":
        return "text-success";
      case "completed":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusText = (status: Election["status"]) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="bg-gradient-card border-card-border hover:shadow-elevated transition-all duration-300 hover:scale-[1.02]">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {election.title}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-background border ${getStatusColor(
                election.status
              )}`}
            >
              {getStatusText(election.status)}
            </span>
          </div>
          {election.hasVoted && (
            <div className="flex items-center text-success">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Voted</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {election.description}
        </p>

        {/* Election Details */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Starts: {formatDate(election.startDate)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>Ends: {formatDate(election.endDate)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{election.totalVoters} registered voters</span>
          </div>
        </div>

        {/* Action Button */}
        {showVoteButton && (
          <div className="flex justify-end">
            {election.status === "active" && !election.hasVoted ? (
              <Button
                variant="vote"
                onClick={() => onVote?.(election.id)}
                className="w-full"
              >
                Vote Now
              </Button>
            ) : election.status === "active" && election.hasVoted ? (
              <Button variant="outline" disabled className="w-full">
                Vote Submitted
              </Button>
            ) : election.status === "upcoming" ? (
              <Button variant="ghost" disabled className="w-full">
                Not Started
              </Button>
            ) : (
              <Button variant="ghost" disabled className="w-full">
                Election Closed
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ElectionCard;
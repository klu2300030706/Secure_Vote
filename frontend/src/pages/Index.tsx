import { useNavigate } from "react-router-dom";
import { Shield, Vote, BarChart3, Lock, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ElectionCard from "@/components/ui/ElectionCard";
import { mockElections } from "@/data/mockData";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lock,
      title: "Secure & Encrypted",
      description: "Bank-level encryption protects every vote with advanced cryptographic security.",
    },
    {
      icon: Users,
      title: "Accessible to All",
      description: "Vote from anywhere, anytime. Designed for maximum accessibility and ease of use.",
    },
    {
      icon: CheckCircle,
      title: "Transparent Results",
      description: "Real-time result tracking with full audit trails and verification capabilities.",
    },
  ];

  const upcomingElections = mockElections.filter(e => e.status === "upcoming" || e.status === "active").slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <Shield className="h-16 w-16 mx-auto mb-6 text-primary-foreground/90" />
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
              Vote Anytime.
              <br />
              <span className="text-primary-glow">Anywhere. Securely.</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Experience the future of democratic participation with our secure, transparent, and accessible online voting platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate("/elections")}
                className="animate-scale-in"
              >
                <Vote className="mr-2 h-5 w-5" />
                View Elections
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-white text-primary hover:bg-white/90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Choose SecureVote?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with cutting-edge technology to ensure your vote counts and your voice is heard.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-gradient-card rounded-xl p-8 border border-card-border hover:shadow-elevated transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Elections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Upcoming Elections
            </h2>
            <p className="text-muted-foreground">
              Participate in the democratic process
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/elections")}
            className="hidden sm:flex"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View All
          </Button>
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
                onVote={(id) => navigate(`/vote/${id}`)}
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:hidden">
          <Button
            variant="outline"
            onClick={() => navigate("/elections")}
            className="w-full"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View All Elections
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

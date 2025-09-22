import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { 
  Plus, 
  Users, 
  BarChart3, 
  Calendar,
  Settings,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createEvent, getAdminEvents, deleteAdminEvent } from "@/lib/api";

// Admin Login is no longer used since routing is protected by role via AuthContext

// Admin Dashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, user } = useAuth();

  type AdminEvent = {
    _id: string;
    title: string;
    description: string;
    startAt?: string;
    endAt?: string;
    createdAt: string;
    options: { _id: string; name: string }[];
    createdBy: { _id: string; name: string; email: string };
  };

  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAdminEvents();
        setEvents((res.data as AdminEvent[]) || []);
      } catch (err: any) {
        toast({
          title: "Failed to load events",
          description: err?.response?.data?.message || err?.message || "Please try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this election? This action cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteAdminEvent(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast({ title: "Deleted", description: "Election deleted successfully." });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.response?.data?.message || err?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const dashboardCards = [
    {
      title: "Create Election",
      description: "Set up new elections with candidates and voting periods",
      icon: Plus,
      color: "bg-gradient-primary",
      action: () => navigate("/admin/create-election"),
    },
    {
      title: "Manage Voters",
      description: "Add, remove, and manage voter registrations",
      icon: Users,
      color: "bg-gradient-secondary", 
      action: () => navigate("/admin/manage-voters"),
    },
    {
      title: "View Results",
      description: "Monitor real-time results and generate reports",
      icon: BarChart3,
      color: "bg-accent",
      action: () => navigate("/results"),
    },
    {
      title: "System Settings",
      description: "Configure platform settings and security",
      icon: Settings,
      color: "bg-muted",
      action: () => toast({ title: "Coming Soon", description: "System settings panel" }),
    },
  ];

  const stats = [
    { label: "Total Elections", value: "12", change: "+2" },
    { label: "Active Voters", value: "15,423", change: "+124" },
    { label: "Votes Cast Today", value: "3,247", change: "+15%" },
    { label: "System Uptime", value: "99.9%", change: "stable" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage elections and oversee the voting platform
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-card border-card-border shadow-card">
            <div className="p-6">
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-success">
                {stat.change}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="bg-gradient-card border-card-border hover:shadow-elevated transition-all duration-300 cursor-pointer"
              onClick={card.action}
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mr-4`}>
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Your Elections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Elections</h2>
          <Button variant="outline" onClick={() => navigate("/admin/create-election")}>
            <Plus className="h-4 w-4 mr-2" /> New Election
          </Button>
        </div>
        {loading ? (
          <div className="text-muted-foreground">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-muted-foreground">No events yet. Create your first election.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const canDelete = user && ev.createdBy && ev.createdBy._id === user._id;
              return (
                <Card key={ev._id} className="bg-gradient-card border-card-border shadow-card">
                  <div className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{ev.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ev.description}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-col gap-1">
                      <span>Options: {ev.options?.length || 0}</span>
                      {ev.startAt && <span>Starts: {new Date(ev.startAt).toLocaleString()}</span>}
                      {ev.endAt && <span>Ends: {new Date(ev.endAt).toLocaleString()}</span>}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/results`)}>
                        <BarChart3 className="h-4 w-4 mr-1" /> Results
                      </Button>
                      {canDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(ev._id)}
                          disabled={deletingId === ev._id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingId === ev._id ? 'Deleting...' : 'Delete'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Create Election Component
const CreateElection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [candidates, setCandidates] = useState([
    { name: "", party: "", description: "" }
  ]);

  const addCandidate = () => {
    setCandidates([...candidates, { name: "", party: "", description: "" }]);
  };

  const updateCandidate = (index: number, field: string, value: string) => {
    const updated = [...candidates];
    updated[index] = { ...updated[index], [field]: value };
    setCandidates(updated);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const options = candidates.map(c => c.name).filter(Boolean);
      await createEvent({
        title: formData.title,
        description: formData.description,
        options,
        startAt: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endAt: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      });
      toast({
        title: "Election Created Successfully",
        description: `${formData.title} has been scheduled and configured.`,
      });
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({
        title: "Failed to Create Election",
        description: err?.response?.data?.message || err?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="mr-4">
          ← Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Election</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new election with candidates and voting period
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="bg-gradient-card border-card-border shadow-card">
          <div className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">Election Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title">Election Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 2024 Presidential Election"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the election purpose and scope..."
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date & Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-card border-card-border shadow-card">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-foreground">Candidates</h3>
              <Button type="button" variant="outline" onClick={addCandidate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </div>

            <div className="space-y-6">
              {candidates.map((candidate, index) => (
                <div key={index} className="border border-card-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-foreground">Candidate {index + 1}</h4>
                    {candidates.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCandidate(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`candidate-name-${index}`}>Name</Label>
                      <Input
                        id={`candidate-name-${index}`}
                        value={candidate.name}
                        onChange={(e) => updateCandidate(index, "name", e.target.value)}
                        placeholder="Candidate full name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor={`candidate-party-${index}`}>Party/Affiliation</Label>
                      <Input
                        id={`candidate-party-${index}`}
                        value={candidate.party}
                        onChange={(e) => updateCandidate(index, "party", e.target.value)}
                        placeholder="Political party or independent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`candidate-description-${index}`}>Description</Label>
                      <Textarea
                        id={`candidate-description-${index}`}
                        value={candidate.description}
                        onChange={(e) => updateCandidate(index, "description", e.target.value)}
                        placeholder="Brief candidate background and platform..."
                        required
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/dashboard")}>
            Cancel
          </Button>
          <Button type="submit">
            <Calendar className="mr-2 h-4 w-4" />
            Create Election
          </Button>
        </div>
      </form>
    </div>
  );
};

// Manage Voters Component (Simple placeholder)
const ManageVoters = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="mr-4">
          ← Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Voters</h1>
          <p className="text-muted-foreground mt-2">
            Voter registration and management tools
          </p>
        </div>
      </div>

      <Card className="bg-gradient-card border-card-border shadow-card">
        <div className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Voter Management
          </h3>
          <p className="text-muted-foreground mb-6">
            Advanced voter management features will be available in the full version.
          </p>
          <Button variant="outline">
            Coming Soon
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Admin wrapper with layout spacing
const AdminWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</div>;
};

// Main Admin Component
const Admin = () => {
  // App-level routing already ensures admin access via ProtectedRoute
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/dashboard" element={
        <AdminWrapper>
          <AdminDashboard />
        </AdminWrapper>
      } />
      <Route path="/create-election" element={
        <AdminWrapper>
          <CreateElection />
        </AdminWrapper>
      } />
      <Route path="/manage-voters" element={
        <AdminWrapper>
          <ManageVoters />
        </AdminWrapper>
      } />
    </Routes>
  );
};

export default Admin;
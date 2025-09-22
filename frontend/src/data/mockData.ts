import { Election } from "@/components/ui/ElectionCard";

export const mockElections: Election[] = [
  {
    id: "1",
    title: "2024 Presidential Election",
    description: "Choose the next President of the United States. This election will determine the country's leadership for the next four years.",
    startDate: "2024-11-05T08:00:00Z",
    endDate: "2024-11-05T20:00:00Z",
    status: "upcoming",
    totalVoters: 240000000,
  },
  {
    id: "2", 
    title: "City Council District 3",
    description: "Vote for your local representative in District 3. These representatives will make decisions about local infrastructure, schools, and community services.",
    startDate: "2024-09-15T07:00:00Z",
    endDate: "2024-09-15T19:00:00Z",
    status: "active",
    totalVoters: 15000,
  },
  {
    id: "3",
    title: "School Board Election",
    description: "Select members for the School Board who will oversee educational policies and budget allocation for our public schools.",
    startDate: "2024-08-20T08:00:00Z",
    endDate: "2024-08-20T18:00:00Z",
    status: "completed",
    totalVoters: 8500,
  },
  {
    id: "4",
    title: "State Governor Race",
    description: "Vote for the next State Governor. The governor will lead state-level policies on healthcare, education, and economic development.",
    startDate: "2024-10-12T07:00:00Z",
    endDate: "2024-10-12T20:00:00Z",
    status: "upcoming",
    totalVoters: 5200000,
  }
];

export interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  imageUrl?: string;
  votes?: number;
}

export const mockCandidates: Record<string, Candidate[]> = {
  "1": [
    {
      id: "c1",
      name: "John Anderson",
      party: "Democratic Party",
      description: "Former Senator with 20 years of experience in public service. Focused on healthcare reform and climate action.",
      votes: 0,
    },
    {
      id: "c2", 
      name: "Sarah Mitchell",
      party: "Republican Party",
      description: "Business leader and former Governor. Advocates for economic growth and traditional values.",
      votes: 0,
    },
    {
      id: "c3",
      name: "David Chen",
      party: "Independent",
      description: "Technology entrepreneur focused on innovation and government transparency.",
      votes: 0,
    }
  ],
  "2": [
    {
      id: "c4",
      name: "Maria Rodriguez",
      party: "Independent",
      description: "Community organizer with focus on affordable housing and public transportation.",
      votes: 1250,
    },
    {
      id: "c5",
      name: "Robert Johnson",
      party: "Progressive Coalition",
      description: "Environmental lawyer advocating for green infrastructure and sustainable development.",
      votes: 890,
    },
    {
      id: "c6",
      name: "Jennifer Williams",
      party: "Civic Alliance",
      description: "Former teacher and parent focused on education funding and community safety.",
      votes: 1100,
    }
  ],
  "3": [
    {
      id: "c7",
      name: "Dr. Michael Brown",
      party: "Education First",
      description: "Former school principal with 25 years in education. Advocates for teacher support and STEM programs.",
      votes: 2100,
    },
    {
      id: "c8",
      name: "Lisa Thompson",
      party: "Parents United",
      description: "Parent advocate focused on special education resources and school safety measures.",
      votes: 1800,
    },
    {
      id: "c9",
      name: "James Wilson",
      party: "Future Learning",
      description: "Technology expert promoting digital literacy and innovative teaching methods.",
      votes: 1550,
    }
  ]
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
  votedElections: string[];
}

export const mockUser: User = {
  id: "user1",
  name: "",
  email: "",
  phone: "",
  isLoggedIn: false,
  votedElections: [],
};
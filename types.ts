export type IssueStatus = 'reported' | 'acknowledged' | 'in_progress' | 'resolved';

export type IssueCategory = 'pothole' | 'graffiti' | 'broken_light' | 'water_leak' | 'trash' | 'safety' | 'other';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'citizen' | 'inspector' | 'admin';
  joinedAt: string;
  avatarColor: string;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  createdAt: string;
}

export interface AIAnalysis {
  severity: IssueSeverity;
  category: IssueCategory;
  suggestedAgency: string;
  summary: string;
  actionSteps: string[];
  detectedLocation?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  createdAt: string;
  imageUrl?: string;
  aiAnalysis?: AIAnalysis;
  upvotes: number;
  comments: Comment[];
  reportedBy?: string; // email of the reporter
  reportedByName?: string; // full name of the reporter
}

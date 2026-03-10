export interface Category {
  _id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
}

export interface ProjectMedia {
  type: 'image' | 'video' | 'pdf' | 'link';
  url: string;
  title?: string;
}

export interface Project {
  _id?: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  label?: string; // Private note for IC
  media: ProjectMedia[];
  links?: string[];
  isHidden: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShareLink {
  _id?: string;
  projectId?: string | { _id: string; title: string; category?: { _id: string; name: string } };
  projectIds?: Array<string | { _id: string; title: string; category?: { _id: string; name: string } }>;
  token: string;
  expiresAt: Date;
  isPortfolioLink: boolean; // true for full portfolio, false for single project
  privateNote?: string;
  accessCode?: string;
  allowedCategories?: string[]; // IDs of allowed categories
  createdAt?: Date;
}

export interface PortfolioSettings {
  title?: string;
  description?: string;
  theme?: 'light' | 'dark' | 'auto';
}

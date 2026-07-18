export type UserRole = 'creator' | 'brand' | 'admin';
export type AppLanguage = 'en' | 'ar';

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  country: string; // e.g., 'UAE', 'KSA', 'Egypt', 'Kuwait', 'Bahrain'
  city: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  niches: string[];
  languages: string[];
  followerCount: number;
  onTimeRate: number;      // percentage, e.g. 98
  revisionRate: number;    // average rounds, e.g. 1.2
  repeatClients: number;   // percentage, e.g. 42
  bio: string;
  portfolio: { id: string; url: string; title: string; type: 'video' | 'image' }[];
  lvl: number;
  exp: number;             // experiences points for gamification
  vettingStatus: 'pending_review' | 'approved' | 'rejected' | 'draft';
}

export interface BrandProfile {
  id: string;
  name: string;
  industry: string;
  city: string;
  country: string;
  logo: string;
  budgetLeft: number;
  totalSpent: number;
}

export interface CampaignBrief {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  title: string;
  productName: string;
  category: string;
  description: string;
  referenceAssets: string[];
  scriptText: string;
  videoTypes: string[]; // e.g. 'Unboxing', 'Tutorial', 'GRWM'
  targetDemographics: {
    gender: string;
    ageRange: string;
    countries: string[];
  };
  budgetPerCreator: number;
  creatorCountWanted: number;
  deadline: string;
  revisionRounds: number; // default 5
  status: 'draft' | 'active' | 'paused' | 'closed';
  physicalProduct: boolean;
  shippingMethod?: string;
  shippingWindow?: string;
}

export interface ProjectSubmission {
  version: number;
  videoUrl: string;
  thumbnailUrl: string;
  timestamp: string;
  notes?: string;
}

export interface RevisionComment {
  sender: 'brand' | 'creator';
  text: string;
  timestamp: string;
  version: number;
}

export interface ActiveProject {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  pitchNote?: string;
  status: 'applied' | 'accepted' | 'in_review' | 'revision_needed' | 'approved' | 'rejected';
  submissions: ProjectSubmission[];
  revisionComments: RevisionComment[];
  escrowStatus: 'none' | 'held' | 'released' | 'refunded' | 'disputed';
  amountHeld: number;
  trackingNumber?: string;
  trackingStatus?: string;
  dueDate: string;
  disputeReason?: string;
}

export interface DisputeComment {
  sender: 'brand' | 'creator' | 'admin';
  text: string;
  timestamp: string;
}

export interface Dispute {
  id: string;
  projectId: string;
  campaignTitle: string;
  brandId: string;
  brandName: string;
  creatorId: string;
  creatorName: string;
  amount: number;
  reason: string;
  status: 'open' | 'resolved';
  resolution?: 'released_to_creator' | 'refunded_to_brand' | 'split';
  splitCreatorAmount?: number;
  splitBrandAmount?: number;
  comments: DisputeComment[];
  timestamp: string;
}

export interface SpotlessPayTransaction {
  id: string;
  brandId: string;
  creatorId: string;
  brandName: string;
  creatorName: string;
  campaignTitle: string;
  amount: number;
  type: 'escrow_hold' | 'escrow_release' | 'refund' | 'dispute_payout';
  timestamp: string;
  status: 'pending' | 'completed' | 'refunded';
}

export interface CollabGig {
  id: string;
  posterId: string;
  posterName: string;
  posterAvatar: string;
  posterType: 'creator' | 'brand';
  title: string;
  role: 'editor' | 'scriptwriter' | 'translator' | 'model' | 'other';
  description: string;
  budget: number;
  country: string;
  dialect?: string;
  requirements: string[];
  status: 'open' | 'assigned' | 'completed';
  applicantCount: number;
  createdAt: string;
}

export interface CreatorService {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  deliveryDays: number;
  price: number;
  niche: string;
  includesRawFiles: boolean;
  revisionCount: number;
  activeOrdersCount: number;
}

export interface CollabMilestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'funded' | 'submitted' | 'approved' | 'released';
  deliverableUrl?: string;
  submittedAt?: string;
}

export interface FrameComment {
  id: string;
  timestamp: string; // format mm:ss
  milliseconds: number;
  commenterName: string;
  commenterAvatar: string;
  text: string;
  createdAt: string;
}

export interface ActiveCollab {
  id: string;
  gigId?: string;
  serviceId?: string;
  title: string;
  hirerId: string;
  hirerName: string;
  hirerAvatar: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  status: 'draft' | 'signed' | 'active' | 'in_review' | 'completed' | 'disputed';
  contractSignedHirer: boolean;
  contractSignedProvider: boolean;
  milestones: CollabMilestone[];
  draftVideoUrl?: string;
  draftVideoComments?: FrameComment[];
  escrowStatus: 'none' | 'funded' | 'released';
  totalPrice: number;
  createdAt: string;
}

export interface AppState {
  creators: CreatorProfile[];
  brands: BrandProfile[];
  campaigns: CampaignBrief[];
  projects: ActiveProject[];
  disputes: Dispute[];
  transactions: SpotlessPayTransaction[];
  gigs?: CollabGig[];
  services?: CreatorService[];
  collaborations?: ActiveCollab[];
}

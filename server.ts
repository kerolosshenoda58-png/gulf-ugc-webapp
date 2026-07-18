import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { 
  CreatorProfile, 
  BrandProfile, 
  CampaignBrief, 
  ActiveProject, 
  Dispute, 
  SpotlessPayTransaction, 
  AppState,
  CollabGig,
  CreatorService,
  ActiveCollab,
  FrameComment
} from "./src/types.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize server-side Gemini client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// Initial Seed Data reflecting the spec
const initialCreators: CreatorProfile[] = [
  {
    id: "creator_sofia",
    name: "Sofia Reyes",
    handle: "@sofiareyes",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    country: "UAE",
    city: "Dubai",
    rating: 4.98,
    reviewCount: 312,
    verified: true,
    niches: ["Beauty & Skincare", "Fashion", "Lifestyle"],
    languages: ["English", "Arabic"],
    followerCount: 245000,
    onTimeRate: 98,
    revisionRate: 1.2,
    repeatClients: 42,
    bio: "The Gulf's leading beauty and lifestyle UGC creator. Specializing in high-aesthetic skincare routines, product reviews, and lifestyle vlogs set in Dubai's most iconic locations.",
    portfolio: [
      { id: "p1", url: "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-skincare-product-to-her-face-34440-large.mp4", title: "NovaSkin Daily Skincare Routine", type: "video" },
      { id: "p2", url: "https://assets.mixkit.co/videos/preview/mixkit-woman-holding-perfume-bottle-in-a-aesthetic-way-40010-large.mp4", title: "Luxury Perfume Unboxing & Review", type: "video" },
      { id: "p3", url: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-makeup-applying-lipstick-34441-large.mp4", title: "Summer Evening Makeup Tutorial", type: "video" }
    ],
    lvl: 8,
    exp: 4200,
    vettingStatus: "approved"
  },
  {
    id: "creator_fahad",
    name: "Fahad Al-Otaibi",
    handle: "@fahad_style",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    country: "KSA",
    city: "Riyadh",
    rating: 4.90,
    reviewCount: 185,
    verified: true,
    niches: ["Fashion", "Tech & Gadgets", "Fitness"],
    languages: ["Arabic", "English"],
    followerCount: 189000,
    onTimeRate: 100,
    revisionRate: 1.0,
    repeatClients: 35,
    bio: "Premium men's fashion, fitness and high-tech UGC reviewer based in Riyadh. Providing sleek, dynamic content that converts Gen-Z & Millennial audiences in Saudi Arabia.",
    portfolio: [
      { id: "p4", url: "https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-dumbbells-in-gym-42263-large.mp4", title: "Saudi Premium Activewear Test", type: "video" },
      { id: "p5", url: "https://assets.mixkit.co/videos/preview/mixkit-unboxing-a-new-premium-smartphone-40201-large.mp4", title: "Flagship Phone Unboxing & Specs", type: "video" }
    ],
    lvl: 5,
    exp: 2100,
    vettingStatus: "approved"
  },
  {
    id: "creator_mariam",
    name: "Mariam Hassan",
    handle: "@mariam_reviews",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    country: "Egypt",
    city: "Cairo",
    rating: 4.85,
    reviewCount: 210,
    verified: true,
    niches: ["Tech & Gadgets", "Home & Smart Devices", "Food & F&B"],
    languages: ["Arabic", "English"],
    followerCount: 312000,
    onTimeRate: 95,
    revisionRate: 1.5,
    repeatClients: 38,
    bio: "Passionate Cairo-based UGC creator reviewing home lifestyle tech and F&B brands. I turn complex products into engaging daily-use stories.",
    portfolio: [
      { id: "p6", url: "https://assets.mixkit.co/videos/preview/mixkit-making-espresso-coffee-with-machine-42419-large.mp4", title: "Smart Espresso Maker In Action", type: "video" }
    ],
    lvl: 6,
    exp: 2950,
    vettingStatus: "approved"
  },
  {
    id: "creator_zainab",
    name: "Zainab Al-Kandari",
    handle: "@zainab_kitchen",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    country: "Kuwait",
    city: "Kuwait City",
    rating: 4.95,
    reviewCount: 94,
    verified: false,
    niches: ["Food & F&B", "Lifestyle"],
    languages: ["Arabic"],
    followerCount: 75000,
    onTimeRate: 92,
    revisionRate: 1.8,
    repeatClients: 30,
    bio: "Kuwaiti culinary storyteller. Creating warm, engaging home cooking, recipe hacks, and restaurant review style UGC videos.",
    portfolio: [
      { id: "p7", url: "https://assets.mixkit.co/videos/preview/mixkit-serving-freshly-baked-pizza-43034-large.mp4", title: "Artisanal Olive Oil Drizzle", type: "video" }
    ],
    lvl: 3,
    exp: 1100,
    vettingStatus: "pending_review"
  }
];

const initialBrands: BrandProfile[] = [
  {
    id: "brand_novaskin",
    name: "NovaSkin Co.",
    industry: "Beauty & Skincare",
    city: "Dubai",
    country: "UAE",
    logo: "✨",
    budgetLeft: 12450,
    totalSpent: 48000
  },
  {
    id: "brand_fitfuel",
    name: "FitFuel KSA",
    industry: "Fitness & Nutrition",
    city: "Riyadh",
    country: "KSA",
    logo: "🔋",
    budgetLeft: 8900,
    totalSpent: 19500
  },
  {
    id: "brand_gulf_gadgets",
    name: "Gulf Gadgetry",
    industry: "Consumer Electronics",
    city: "Kuwait City",
    country: "Kuwait",
    logo: "🔌",
    budgetLeft: 22000,
    totalSpent: 5000
  }
];

const initialCampaigns: CampaignBrief[] = [
  {
    id: "campaign_1",
    brandId: "brand_novaskin",
    brandName: "NovaSkin Co.",
    brandLogo: "✨",
    title: "Glow Serum Summer Campaign",
    productName: "Glow Hydra-Serum",
    category: "Beauty & Skincare",
    description: "Looking for authentic female lifestyle and beauty creators to demonstrate our Glow Hydra-Serum. Show application routine, highlight the natural non-greasy texture, and express the dewy end-result.",
    referenceAssets: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400"],
    scriptText: "Hook: 'Is your skin screaming for hydration in this Gulf summer heat?'\nBody: Show product texture, applying drops on cheekbones. Explain that it is packed with hyaluronic acid and rose water. Highlight that it's locally crafted for our region's specific humidity.\nCTA: 'Grab your glow at 20% off using code GLOWSUMMER!'",
    videoTypes: ["Before/After", "GRWM", "Testimonial"],
    targetDemographics: {
      gender: "Female",
      ageRange: "18-34",
      countries: ["UAE", "KSA", "Egypt"]
    },
    budgetPerCreator: 480,
    creatorCountWanted: 3,
    deadline: "2026-08-15",
    revisionRounds: 5,
    status: "active",
    physicalProduct: true,
    shippingMethod: "Aramex Express",
    shippingWindow: "2-3 business days"
  },
  {
    id: "campaign_2",
    brandId: "brand_fitfuel",
    brandName: "FitFuel KSA",
    brandLogo: "🔋",
    title: "Super-Protein Shaker Challenge",
    productName: "FitFuel Super Whey",
    category: "Fitness & Nutrition",
    description: "Athletes and fitness enthusiasts wanted in Riyadh, Jeddah, or Dubai to demonstrate the instant mixability of Super Whey with a beautiful blender-bottle shake aesthetic. Must show the active scoop, water mix, and post-workout gulp.",
    referenceAssets: ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400"],
    scriptText: "Hook: 'No more protein clumps! Watch this.'\nBody: Scoop 1 scoop of Super Whey, pour water, shake for 3 seconds. Show crystal clear resolution. Sip and react genuinely.\nCTA: 'Available at all Gulf Nutrition stores. Try it now!'",
    videoTypes: ["Testimonial", "Tutorial"],
    targetDemographics: {
      gender: "All",
      ageRange: "18-45",
      countries: ["KSA", "UAE"]
    },
    budgetPerCreator: 300,
    creatorCountWanted: 5,
    deadline: "2026-08-30",
    revisionRounds: 5,
    status: "active",
    physicalProduct: true,
    shippingMethod: "DHL Express",
    shippingWindow: "1-2 business days"
  }
];

const initialProjects: ActiveProject[] = [
  {
    id: "project_1",
    campaignId: "campaign_1",
    campaignTitle: "Glow Serum Summer Campaign",
    brandId: "brand_novaskin",
    brandName: "NovaSkin Co.",
    brandLogo: "✨",
    creatorId: "creator_sofia",
    creatorName: "Sofia Reyes",
    creatorHandle: "@sofiareyes",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    pitchNote: "Would love to shoot this in my aesthetic vanity in Dubai Marina! Ready to showcase the ultimate summer glowing skin.",
    status: "in_review",
    submissions: [
      {
        version: 1,
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-skincare-product-to-her-face-34440-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
        timestamp: "2026-07-16T10:30:00Z",
        notes: "Here is my Draft V1! Clean lens, full focus on serum texture. Let me know what you think!"
      }
    ],
    revisionComments: [],
    escrowStatus: "held",
    amountHeld: 480,
    trackingNumber: "AMX-9381-029",
    trackingStatus: "Delivered",
    dueDate: "2026-08-15"
  },
  {
    id: "project_2",
    campaignId: "campaign_2",
    campaignTitle: "Super-Protein Shaker Challenge",
    brandId: "brand_fitfuel",
    brandName: "FitFuel KSA",
    brandLogo: "🔋",
    creatorId: "creator_fahad",
    creatorName: "Fahad Al-Otaibi",
    creatorHandle: "@fahad_style",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    pitchNote: "Will show high intensity gym workout in Riyadh followed by the protein shake mix in my shaker bottle. Dynamic transition included!",
    status: "revision_needed",
    submissions: [
      {
        version: 1,
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-dumbbells-in-gym-42263-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
        timestamp: "2026-07-15T14:20:00Z",
        notes: "Hi guys, uploaded V1! Showed the gym workout and mixing. Cheers!"
      }
    ],
    revisionComments: [
      {
        sender: "brand",
        text: "Love the gym aesthetics, Fahad! But could you please film the close-up of the shaker bottle with better lighting? The brand label was slightly in shadow.",
        timestamp: "2026-07-16T11:00:00Z",
        version: 1
      }
    ],
    escrowStatus: "held",
    amountHeld: 300,
    trackingNumber: "DHL-8472-910",
    trackingStatus: "Delivered",
    dueDate: "2026-08-30"
  },
  {
    id: "project_3",
    campaignId: "campaign_1",
    campaignTitle: "Glow Serum Summer Campaign",
    brandId: "brand_novaskin",
    brandName: "NovaSkin Co.",
    brandLogo: "✨",
    creatorId: "creator_mariam",
    creatorName: "Mariam Hassan",
    creatorHandle: "@mariam_reviews",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    pitchNote: "Perfect fit for Cairo humidity! I'll outline why a lightweight serum is key for Egyptian summers.",
    status: "accepted",
    submissions: [],
    revisionComments: [],
    escrowStatus: "held",
    amountHeld: 480,
    trackingNumber: "AMX-1122-443",
    trackingStatus: "In Transit",
    dueDate: "2026-08-15"
  }
];

const initialDisputes: Dispute[] = [
  {
    id: "dispute_1",
    projectId: "project_2",
    campaignTitle: "Super-Protein Shaker Challenge",
    brandId: "brand_fitfuel",
    brandName: "FitFuel KSA",
    creatorId: "creator_fahad",
    creatorName: "Fahad Al-Otaibi",
    amount: 300,
    reason: "Creator did not complete requested close-up adjustments in a timely manner. Deadline is approaching and we need alternative content.",
    status: "open",
    comments: [
      {
        sender: "brand",
        text: "We requested a bright, well-lit re-shoot of the shaker bottle 3 days ago. No response from the creator and we need our marketing assets immediately.",
        timestamp: "2026-07-17T09:00:00Z"
      },
      {
        sender: "creator",
        text: "Apologies, I was traveling to Jeddah for a shoot. I have the footage ready now and am uploading V2 right away. Please don't cancel!",
        timestamp: "2026-07-17T15:00:00Z"
      }
    ],
    timestamp: "2026-07-17T09:00:00Z"
  }
];

const initialTransactions: SpotlessPayTransaction[] = [
  {
    id: "tx_1",
    brandId: "brand_novaskin",
    creatorId: "creator_sofia",
    brandName: "NovaSkin Co.",
    creatorName: "Sofia Reyes",
    campaignTitle: "Glow Serum Summer Campaign",
    amount: 480,
    type: "escrow_hold",
    timestamp: "2026-07-14T08:00:00Z",
    status: "completed"
  },
  {
    id: "tx_2",
    brandId: "brand_fitfuel",
    creatorId: "creator_fahad",
    brandName: "FitFuel KSA",
    creatorName: "Fahad Al-Otaibi",
    campaignTitle: "Super-Protein Shaker Challenge",
    amount: 300,
    type: "escrow_hold",
    timestamp: "2026-07-14T11:30:00Z",
    status: "completed"
  },
  {
    id: "tx_3",
    brandId: "brand_novaskin",
    creatorId: "creator_mariam",
    brandName: "NovaSkin Co.",
    creatorName: "Mariam Hassan",
    campaignTitle: "Glow Serum Summer Campaign",
    amount: 480,
    type: "escrow_hold",
    timestamp: "2026-07-15T09:15:00Z",
    status: "completed"
  },
  {
    id: "tx_4",
    brandId: "brand_novaskin",
    creatorId: "creator_sofia",
    brandName: "NovaSkin Co.",
    creatorName: "Sofia Reyes",
    campaignTitle: "Hydrating Cleanser Video (Completed)",
    amount: 350,
    type: "escrow_release",
    timestamp: "2026-07-10T14:00:00Z",
    status: "completed"
  }
];

const initialGigs: CollabGig[] = [
  {
    id: "gig_1",
    posterId: "creator_mariam",
    posterName: "Mariam Hassan",
    posterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    posterType: "creator",
    title: "Urgent: Professional Arabic Video Editor with CapCut/Premiere",
    role: "editor",
    description: "Looking for an experienced editor to edit 3 lifestyle beauty UGC videos. I have raw reels filmed in Dubai and Cairo. Needs engaging zoom-ins, Gulf dialect captions in Arabic, and trending aesthetic sound effects.",
    budget: 150,
    country: "UAE",
    dialect: "Khaliji",
    requirements: ["Deliver within 48 hours", "Experience with UGC beauty formatting", "Proficient in modern capcut transitions"],
    status: "open",
    applicantCount: 3,
    createdAt: "2026-07-17T12:00:00Z"
  },
  {
    id: "gig_2",
    posterId: "brand_fitfuel",
    posterName: "FitFuel KSA",
    posterAvatar: "🔋",
    posterType: "brand",
    title: "Native Saudi Script Writer (Riyadh Dialect) for Supplement Launch",
    role: "scriptwriter",
    description: "We are an agency/brand looking for a copywriter to craft 5 high-converting TikTok UGC scripts in native Riyadh dialect. Must understand local fitness jokes and KSA trends.",
    budget: 250,
    country: "KSA",
    dialect: "Khaliji (Saudi)",
    requirements: ["Native Saudi speaker", "Understand hooks that convert on TikTok", "Provide visual direction alongside script"],
    status: "open",
    applicantCount: 5,
    createdAt: "2026-07-16T15:30:00Z"
  },
  {
    id: "gig_3",
    posterId: "creator_fahad",
    posterName: "Fahad Al-Otaibi",
    posterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    posterType: "creator",
    title: "Looking for UAE Female Co-Creator for Duet/Casting Lifestyle Ads",
    role: "model",
    description: "Looking for a female creator based in Dubai to record reaction clips to match my Saudi lifestyle reviews. We will combine them into high-converting split-screen ads.",
    budget: 350,
    country: "UAE",
    dialect: "Khaliji",
    requirements: ["Aesthetic high-key lighting", "Comfortable with energetic facial expressions", "Capable of high-quality audio recording"],
    status: "open",
    applicantCount: 2,
    createdAt: "2026-07-18T09:00:00Z"
  }
];

const initialServices: CreatorService[] = [
  {
    id: "service_1",
    creatorId: "creator_sofia",
    creatorName: "Sofia Reyes",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    title: "Premium Beauty UGC Package (3 High-Aesthetic Videos)",
    description: "Get 3 fully-edited premium vertical videos (reels/TikTok) filmed in luxury Dubai locations. Includes custom trending text overlays, voiceover in English or sweet Arabic, and background audio curation.",
    deliveryDays: 5,
    price: 450,
    niche: "Beauty & Skincare",
    includesRawFiles: true,
    revisionCount: 3,
    activeOrdersCount: 1
  },
  {
    id: "service_2",
    creatorId: "creator_fahad",
    creatorName: "Fahad Al-Otaibi",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    title: "Saudi Men's Fashion & Styling Reels (2 Videos)",
    description: "I will film 2 high-converting men's styling or unboxing vertical videos from my professional Riyadh studio. Tailored specifically for Saudi youth with premium local dialects.",
    deliveryDays: 4,
    price: 350,
    niche: "Fashion",
    includesRawFiles: false,
    revisionCount: 2,
    activeOrdersCount: 0
  },
  {
    id: "service_3",
    creatorId: "creator_mariam",
    creatorName: "Mariam Hassan",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    title: "Cinematic Product B-Roll & Smart Home UGC Video",
    description: "1 detailed high-production unboxing and demonstration video of your smart device, home tool, or kitchen appliance with crispy close-ups, macro b-roll, and rich audio.",
    deliveryDays: 3,
    price: 200,
    niche: "Tech & Gadgets",
    includesRawFiles: true,
    revisionCount: 2,
    activeOrdersCount: 2
  }
];

const initialCollaborations: ActiveCollab[] = [
  {
    id: "collab_1",
    gigId: "gig_1",
    title: "UGC Video Editing Project (Beauty)",
    hirerId: "creator_mariam",
    hirerName: "Mariam Hassan",
    hirerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    providerId: "creator_sofia",
    providerName: "Sofia Reyes",
    providerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    status: "active",
    contractSignedHirer: true,
    contractSignedProvider: true,
    milestones: [
      { id: "m1", title: "Review Raw Footage & Outline Script", amount: 50, status: "released" },
      { id: "m2", title: "Deliver Draft V1 with Subtitles", amount: 100, status: "funded" }
    ],
    draftVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-skincare-product-to-her-face-34440-large.mp4",
    draftVideoComments: [
      { id: "fc1", timestamp: "00:02", milliseconds: 2000, commenterName: "Mariam Hassan", commenterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200", text: "Please add a subtitle zoom-in transition exactly here!", createdAt: "2026-07-18T10:00:00Z" }
    ],
    escrowStatus: "funded",
    totalPrice: 150,
    createdAt: "2026-07-17T14:00:00Z"
  }
];

// Server state (in-memory persistent state)
let dbState: AppState = {
  creators: [...initialCreators],
  brands: [...initialBrands],
  campaigns: [...initialCampaigns],
  projects: [...initialProjects],
  disputes: [...initialDisputes],
  transactions: [...initialTransactions],
  gigs: [...initialGigs],
  services: [...initialServices],
  collaborations: [...initialCollaborations]
};

// Reset database helper
function resetDatabase() {
  dbState = {
    creators: JSON.parse(JSON.stringify(initialCreators)),
    brands: JSON.parse(JSON.stringify(initialBrands)),
    campaigns: JSON.parse(JSON.stringify(initialCampaigns)),
    projects: JSON.parse(JSON.stringify(initialProjects)),
    disputes: JSON.parse(JSON.stringify(initialDisputes)),
    transactions: JSON.parse(JSON.stringify(initialTransactions)),
    gigs: JSON.parse(JSON.stringify(initialGigs)),
    services: JSON.parse(JSON.stringify(initialServices)),
    collaborations: JSON.parse(JSON.stringify(initialCollaborations))
  };
}

// REST endpoints for data sync
app.get("/api/state", (req, res) => {
  res.json(dbState);
});

app.post("/api/reset", (req, res) => {
  resetDatabase();
  res.json({ message: "Database reset successful", state: dbState });
});

// Gigs and Collaboration API (Contra style)
app.post("/api/gigs/create", (req, res) => {
  const { posterId, posterName, posterAvatar, posterType, title, role, description, budget, country, dialect, requirements } = req.body;
  const newGig: CollabGig = {
    id: `gig_${Date.now()}`,
    posterId,
    posterName,
    posterAvatar,
    posterType,
    title,
    role,
    description,
    budget: Number(budget) || 100,
    country,
    dialect,
    requirements: requirements || [],
    status: 'open',
    applicantCount: 0,
    createdAt: new Date().toISOString()
  };
  dbState.gigs?.push(newGig);
  res.json({ success: true, gig: newGig });
});

app.post("/api/gigs/apply", (req, res) => {
  const { gigId, applicantId, applicantName, applicantAvatar } = req.body;
  const gig = dbState.gigs?.find(g => g.id === gigId);
  if (!gig) return res.status(404).json({ error: "Gig not found" });

  gig.applicantCount += 1;

  // Auto-generate a beautiful custom active collaboration contract
  const newCollab: ActiveCollab = {
    id: `collab_${Date.now()}`,
    gigId: gig.id,
    title: gig.title,
    hirerId: gig.posterId,
    hirerName: gig.posterName,
    hirerAvatar: gig.posterAvatar,
    providerId: applicantId,
    providerName: applicantName,
    providerAvatar: applicantAvatar,
    status: 'draft',
    contractSignedHirer: gig.posterType === 'brand', // Auto sign if poster was brand
    contractSignedProvider: true, // applicant automatically signs
    milestones: [
      { id: `m_${Date.now()}_1`, title: "Milestone 1: Progress Draft Video & Script", amount: Math.floor(gig.budget * 0.4), status: 'pending' },
      { id: `m_${Date.now()}_2`, title: "Milestone 2: Final Approved Edit & Delivery", amount: Math.ceil(gig.budget * 0.6), status: 'pending' }
    ],
    escrowStatus: 'none',
    totalPrice: gig.budget,
    createdAt: new Date().toISOString()
  };

  dbState.collaborations?.unshift(newCollab);
  res.json({ success: true, collaboration: newCollab });
});

app.post("/api/services/create", (req, res) => {
  const { creatorId, creatorName, creatorAvatar, title, description, deliveryDays, price, niche, includesRawFiles, revisionCount } = req.body;
  const newService: CreatorService = {
    id: `service_${Date.now()}`,
    creatorId,
    creatorName,
    creatorAvatar,
    title,
    description,
    deliveryDays: Number(deliveryDays) || 3,
    price: Number(price) || 150,
    niche: niche || "Lifestyle",
    includesRawFiles: !!includesRawFiles,
    revisionCount: Number(revisionCount) || 2,
    activeOrdersCount: 0
  };
  dbState.services?.push(newService);
  res.json({ success: true, service: newService });
});

app.post("/api/collab/order", (req, res) => {
  const { serviceId, hirerId, hirerName, hirerAvatar } = req.body;
  const service = dbState.services?.find(s => s.id === serviceId);
  if (!service) return res.status(404).json({ error: "Service package not found" });

  service.activeOrdersCount += 1;

  // Create active collaboration contract for service book
  const newCollab: ActiveCollab = {
    id: `collab_${Date.now()}`,
    serviceId: service.id,
    title: service.title,
    hirerId,
    hirerName,
    hirerAvatar,
    providerId: service.creatorId,
    providerName: service.creatorName,
    providerAvatar: service.creatorAvatar,
    status: 'draft',
    contractSignedHirer: true,
    contractSignedProvider: false,
    milestones: [
      { id: `m_${Date.now()}_1`, title: "Deliver Raw Outtakes & Initial Script", amount: Math.floor(service.price * 0.3), status: 'pending' },
      { id: `m_${Date.now()}_2`, title: "Complete Dynamic Vertical Video Draft", amount: Math.ceil(service.price * 0.7), status: 'pending' }
    ],
    escrowStatus: 'none',
    totalPrice: service.price,
    createdAt: new Date().toISOString()
  };

  dbState.collaborations?.unshift(newCollab);
  res.json({ success: true, collaboration: newCollab });
});

app.post("/api/collab/sign", (req, res) => {
  const { collabId, role } = req.body; // role can be 'hirer' or 'provider'
  const collab = dbState.collaborations?.find(c => c.id === collabId);
  if (!collab) return res.status(404).json({ error: "Collaboration not found" });

  if (role === 'hirer') collab.contractSignedHirer = true;
  if (role === 'provider') collab.contractSignedProvider = true;

  if (collab.contractSignedHirer && collab.contractSignedProvider) {
    collab.status = 'signed';
  }
  res.json({ success: true, collaboration: collab });
});

app.post("/api/collab/milestone/fund", (req, res) => {
  const { collabId, milestoneId } = req.body;
  const collab = dbState.collaborations?.find(c => c.id === collabId);
  if (!collab) return res.status(404).json({ error: "Collaboration not found" });

  const mstone = collab.milestones.find(m => m.id === milestoneId);
  if (!mstone) return res.status(404).json({ error: "Milestone not found" });

  mstone.status = 'funded';
  collab.status = 'active';
  collab.escrowStatus = 'funded';

  // Log in transaction
  dbState.transactions.unshift({
    id: `tx_${Date.now()}`,
    brandId: collab.hirerId,
    creatorId: collab.providerId,
    brandName: collab.hirerName,
    creatorName: collab.providerName,
    campaignTitle: `${collab.title} (Milestone Funded: ${mstone.title})`,
    amount: mstone.amount,
    type: 'escrow_hold',
    timestamp: new Date().toISOString(),
    status: 'completed'
  });

  res.json({ success: true, collaboration: collab });
});

app.post("/api/collab/milestone/submit", (req, res) => {
  const { collabId, milestoneId, deliverableUrl } = req.body;
  const collab = dbState.collaborations?.find(c => c.id === collabId);
  if (!collab) return res.status(404).json({ error: "Collaboration not found" });

  const mstone = collab.milestones.find(m => m.id === milestoneId);
  if (!mstone) return res.status(404).json({ error: "Milestone not found" });

  mstone.status = 'submitted';
  mstone.deliverableUrl = deliverableUrl || "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-skincare-product-to-her-face-34440-large.mp4";
  mstone.submittedAt = new Date().toISOString();
  collab.status = 'in_review';
  collab.draftVideoUrl = mstone.deliverableUrl; // Make it active draft video

  res.json({ success: true, collaboration: collab });
});

app.post("/api/collab/milestone/approve", (req, res) => {
  const { collabId, milestoneId } = req.body;
  const collab = dbState.collaborations?.find(c => c.id === collabId);
  if (!collab) return res.status(404).json({ error: "Collaboration not found" });

  const mstone = collab.milestones.find(m => m.id === milestoneId);
  if (!mstone) return res.status(404).json({ error: "Milestone not found" });

  mstone.status = 'released';

  // Log escrow release
  dbState.transactions.unshift({
    id: `tx_${Date.now()}`,
    brandId: collab.hirerId,
    creatorId: collab.providerId,
    brandName: collab.hirerName,
    creatorName: collab.providerName,
    campaignTitle: `${collab.title} (Milestone Released: ${mstone.title})`,
    amount: mstone.amount,
    type: 'escrow_release',
    timestamp: new Date().toISOString(),
    status: 'completed'
  });

  // Credit provider level and exp points
  const provider = dbState.creators.find(c => c.id === collab.providerId);
  if (provider) {
    provider.exp += 250;
    if (provider.exp % 1000 < 250) {
      provider.lvl += 1;
    }
  }

  // Check if all milestones are released, if so set collaboration completed
  const allCompleted = collab.milestones.every(m => m.status === 'released');
  if (allCompleted) {
    collab.status = 'completed';
    collab.escrowStatus = 'released';
  } else {
    collab.status = 'active';
  }

  res.json({ success: true, collaboration: collab });
});

app.post("/api/collab/feedback/add", (req, res) => {
  const { collabId, timestamp, milliseconds, commenterName, commenterAvatar, text } = req.body;
  const collab = dbState.collaborations?.find(c => c.id === collabId);
  if (!collab) return res.status(404).json({ error: "Collaboration not found" });

  if (!collab.draftVideoComments) {
    collab.draftVideoComments = [];
  }

  const newComment: FrameComment = {
    id: `fc_${Date.now()}`,
    timestamp: timestamp || "00:00",
    milliseconds: Number(milliseconds) || 0,
    commenterName,
    commenterAvatar,
    text,
    createdAt: new Date().toISOString()
  };

  collab.draftVideoComments.push(newComment);
  res.json({ success: true, collaboration: collab });
});

// AI Script suggestions
app.post("/api/campaigns/generate-brief", async (req, res) => {
  const { title, productName, category, description, videoType, tone } = req.body;

  const prompt = `Write a high-converting UGC (User Generated Content) video script and detailed shot-list for:
Product Name: ${productName}
Campaign: ${title}
Category: ${category}
Core Description: ${description}
Requested Video Type: ${videoType}
Tone: ${tone}

Format the response cleanly as Markdown with:
1. An attention-grabbing hook (0-3s)
2. Body demonstration steps (3-25s) with specific camera cues (e.g., 'Wipe lens', 'Keep product in focus')
3. A compelling Call to Action (25-30s)
Keep it optimized for Gulf audiences in KSA, UAE, and Egypt. Include short Arabic phrases or translation alternatives if applicable. Make sure it stays within a 30-second runtime limit. Do not include excessive extra chat, just output the script content directly in a clean format.`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are UGC GULF's expert AI scriptwriting assistant. You specialize in high-converting video structures, camera instruction cues, and Gulf consumer behavior.",
          temperature: 0.7,
        }
      });
      res.json({ script: response.text || "Failed to generate script text." });
    } else {
      // Fallback rule-based creative script generation if Gemini API key isn't provided yet
      const fallbackScript = `### AI Script & Shot-List (Local Fallback)
*No GEMINI_API_KEY detected in Secrets panel. Here is a high-converting template:*

#### 🎬 Phase 1: The Hook (0-3s)
* **Visual:** Close-up of your face looking exhausted/disappointed, then smiling as you reveal the **${productName}** container.
* **Script (EN):** *"If you live in the Gulf, you know the summer humidity absolutely ruins your styling. Until I tried this!"*
* **Script (AR):** *"إذا كنت تعيش في الخليج، فأنت تعرف كيف تسبب رطوبة الصيف مشاكل لبشرتك وشعرك. حتى جربت هذا!"*

#### 🧴 Phase 2: Demonstration (3-25s)
* **Visual [Wipe Lens cue]:** Start with a crystal clear frame. Apply a small drop of **${productName}** on your skin/hair.
* **Visual [Keep Product in Frame cue]:** Rotate product 360° to show the beautiful packaging label.
* **Script (EN):** *"It feels super lightweight, absorbs in literally three seconds, and gives this perfect dewy glow without any stickiness. It's fully crafted for our regional climate!"*

#### 🚀 Phase 3: Call to Action (25-30s)
* **Visual:** Pointing down to a discount code banner on the screen.
* **Script (EN):** *"Treat your skin today! Head to UGC GULF or use code GULF20 for 20% off with Spotless Pay safety!"*
* **Script (AR):** *"دللي بشرتك اليوم! استخدمي الكود GULF20 للحصول على خصم 20% مع حماية الدفع الكاملة!"*`;
      res.json({ script: fallbackScript });
    }
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ error: error?.message || "Internal generation error" });
  }
});

// Brand: Post Campaign
app.post("/api/campaigns", (req, res) => {
  const { 
    brandId, 
    title, 
    productName, 
    category, 
    description, 
    videoTypes, 
    targetDemographics, 
    budgetPerCreator, 
    creatorCountWanted, 
    deadline, 
    physicalProduct, 
    shippingMethod, 
    shippingWindow,
    scriptText 
  } = req.body;

  const brand = dbState.brands.find(b => b.id === brandId);
  if (!brand) {
    return res.status(404).json({ error: "Brand not found" });
  }

  const totalCost = budgetPerCreator * creatorCountWanted;
  if (brand.budgetLeft < totalCost) {
    return res.status(400).json({ error: "Insufficient Campaign Budget Left" });
  }

  // Deduct budget
  brand.budgetLeft -= totalCost;
  brand.totalSpent += totalCost;

  const newCampaign: CampaignBrief = {
    id: `campaign_${Date.now()}`,
    brandId,
    brandName: brand.name,
    brandLogo: brand.logo,
    title,
    productName,
    category,
    description,
    referenceAssets: ["https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=400"],
    scriptText: scriptText || "No script provided.",
    videoTypes: videoTypes || ["Testimonial"],
    targetDemographics: targetDemographics || { gender: "All", ageRange: "18-35", countries: ["UAE"] },
    budgetPerCreator,
    creatorCountWanted,
    deadline,
    revisionRounds: 5,
    status: "active",
    physicalProduct: !!physicalProduct,
    shippingMethod,
    shippingWindow
  };

  dbState.campaigns.unshift(newCampaign);

  // Generate automated transactions for the escrow hold
  const newTransaction: SpotlessPayTransaction = {
    id: `tx_${Date.now()}`,
    brandId,
    creatorId: "multiple",
    brandName: brand.name,
    creatorName: "Pending Hires",
    campaignTitle: title,
    amount: totalCost,
    type: "escrow_hold",
    timestamp: new Date().toISOString(),
    status: "completed"
  };
  dbState.transactions.unshift(newTransaction);

  // Simulate automated AI creator recommendations based on category
  const matchingCreators = dbState.creators.filter(c => 
    c.vettingStatus === "approved" && 
    c.niches.some(n => n.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(n.toLowerCase()))
  );

  res.json({ campaign: newCampaign, matchedCreators: matchingCreators.map(c => c.id) });
});

// Creator: Apply to Gig
app.post("/api/projects/apply", (req, res) => {
  const { campaignId, creatorId, pitchNote } = req.body;

  const campaign = dbState.campaigns.find(c => c.id === campaignId);
  const creator = dbState.creators.find(c => c.id === creatorId);

  if (!campaign || !creator) {
    return res.status(404).json({ error: "Campaign or Creator not found" });
  }

  // Avoid duplication
  const existing = dbState.projects.find(p => p.campaignId === campaignId && p.creatorId === creatorId);
  if (existing) {
    return res.status(400).json({ error: "Already applied or hired for this campaign" });
  }

  const newProject: ActiveProject = {
    id: `project_${Date.now()}`,
    campaignId,
    campaignTitle: campaign.title,
    brandId: campaign.brandId,
    brandName: campaign.brandName,
    brandLogo: campaign.brandLogo,
    creatorId,
    creatorName: creator.name,
    creatorHandle: creator.handle,
    creatorAvatar: creator.avatar,
    pitchNote,
    status: "applied",
    submissions: [],
    revisionComments: [],
    escrowStatus: "none",
    amountHeld: campaign.budgetPerCreator,
    dueDate: campaign.deadline,
    trackingNumber: campaign.physicalProduct ? `AMX-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}` : undefined,
    trackingStatus: campaign.physicalProduct ? "Awaiting Shipment" : undefined
  };

  dbState.projects.unshift(newProject);
  res.json({ project: newProject });
});

// Brand: Accept Creator Application
app.post("/api/projects/accept", (req, res) => {
  const { projectId } = req.body;
  const project = dbState.projects.find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  project.status = "accepted";
  project.escrowStatus = "held";
  if (project.trackingStatus) {
    project.trackingStatus = "In Transit";
  }

  // Create an individual completed escrow hold transaction
  const holdTx: SpotlessPayTransaction = {
    id: `tx_${Date.now()}`,
    brandId: project.brandId,
    creatorId: project.creatorId,
    brandName: project.brandName,
    creatorName: project.creatorName,
    campaignTitle: project.campaignTitle,
    amount: project.amountHeld,
    type: "escrow_hold",
    timestamp: new Date().toISOString(),
    status: "completed"
  };
  dbState.transactions.unshift(holdTx);

  res.json({ project });
});

// Creator: Submit Draft / Video
app.post("/api/projects/submit", (req, res) => {
  const { projectId, videoUrl, notes } = req.body;
  const project = dbState.projects.find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const newVersion = project.submissions.length + 1;
  const newSubmission = {
    version: newVersion,
    videoUrl: videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-girl-applying-skincare-product-to-her-face-34440-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
    timestamp: new Date().toISOString(),
    notes: notes || `Submission draft v${newVersion}`
  };

  project.submissions.push(newSubmission);
  project.status = "in_review";

  res.json({ project });
});

// Brand: Request Revision
app.post("/api/projects/revision", (req, res) => {
  const { projectId, commentText } = req.body;
  const project = dbState.projects.find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const currentVersion = project.submissions.length;
  const newComment = {
    sender: "brand" as const,
    text: commentText || "Please refine the video lighting.",
    timestamp: new Date().toISOString(),
    version: currentVersion
  };

  project.revisionComments.push(newComment);
  project.status = "revision_needed";

  res.json({ project });
});

// Brand: Approve Deliverable (Releases Spotless Pay Escrow)
app.post("/api/projects/approve", (req, res) => {
  const { projectId } = req.body;
  const project = dbState.projects.find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  project.status = "approved";
  project.escrowStatus = "released";

  // Transfer funds to creator
  const creator = dbState.creators.find(c => c.id === project.creatorId);
  if (creator) {
    // Award experience points for gamification!
    creator.exp += 500;
    if (creator.exp >= creator.lvl * 1000) {
      creator.lvl += 1;
    }
  }

  // Create release transaction
  const releaseTx: SpotlessPayTransaction = {
    id: `tx_${Date.now()}`,
    brandId: project.brandId,
    creatorId: project.creatorId,
    brandName: project.brandName,
    creatorName: project.creatorName,
    campaignTitle: project.campaignTitle,
    amount: project.amountHeld,
    type: "escrow_release",
    timestamp: new Date().toISOString(),
    status: "completed"
  };
  dbState.transactions.unshift(releaseTx);

  res.json({ project, creator });
});

// Disputes: File a Dispute
app.post("/api/disputes/create", (req, res) => {
  const { projectId, reason } = req.body;
  const project = dbState.projects.find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  project.status = "revision_needed"; // freeze state
  project.escrowStatus = "disputed";

  const newDispute: Dispute = {
    id: `dispute_${Date.now()}`,
    projectId,
    campaignTitle: project.campaignTitle,
    brandId: project.brandId,
    brandName: project.brandName,
    creatorId: project.creatorId,
    creatorName: project.creatorName,
    amount: project.amountHeld,
    reason,
    status: "open",
    comments: [
      {
        sender: "brand",
        text: `Dispute filed. Reason: ${reason}`,
        timestamp: new Date().toISOString()
      }
    ],
    timestamp: new Date().toISOString()
  };

  dbState.disputes.unshift(newDispute);
  res.json({ dispute: newDispute, project });
});

// Disputes: Comment on Dispute
app.post("/api/disputes/comment", (req, res) => {
  const { disputeId, sender, text } = req.body;
  const dispute = dbState.disputes.find(d => d.id === disputeId);

  if (!dispute) {
    return res.status(404).json({ error: "Dispute not found" });
  }

  dispute.comments.push({
    sender,
    text,
    timestamp: new Date().toISOString()
  });

  res.json({ dispute });
});

// Admin: Approve / Reject Creator Vetting Queue
app.post("/api/admin/vetting", (req, res) => {
  const { creatorId, action, reason } = req.body; // action: 'approve' | 'reject'
  const creator = dbState.creators.find(c => c.id === creatorId);

  if (!creator) {
    return res.status(404).json({ error: "Creator not found" });
  }

  if (action === "approve") {
    creator.vettingStatus = "approved";
    creator.verified = true;
  } else {
    creator.vettingStatus = "rejected";
    creator.verified = false;
  }

  res.json({ creator });
});

// Admin: Resolve Dispute (escrow payouts)
app.post("/api/admin/resolve-dispute", (req, res) => {
  const { disputeId, resolution, splitCreatorAmount, splitBrandAmount } = req.body; 
  // resolution: 'released_to_creator' | 'refunded_to_brand' | 'split'
  const dispute = dbState.disputes.find(d => d.id === disputeId);

  if (!dispute) {
    return res.status(404).json({ error: "Dispute not found" });
  }

  const project = dbState.projects.find(p => p.id === dispute.projectId);
  if (!project) {
    return res.status(404).json({ error: "Associated project not found" });
  }

  dispute.status = "resolved";
  dispute.resolution = resolution;

  if (resolution === "released_to_creator") {
    project.status = "approved";
    project.escrowStatus = "released";
    dispute.comments.push({
      sender: "admin",
      text: "Resolution: Escrow fully released to the creator.",
      timestamp: new Date().toISOString()
    });

    const creator = dbState.creators.find(c => c.id === project.creatorId);
    if (creator) {
      creator.exp += 300;
    }

    dbState.transactions.unshift({
      id: `tx_${Date.now()}`,
      brandId: project.brandId,
      creatorId: project.creatorId,
      brandName: project.brandName,
      creatorName: project.creatorName,
      campaignTitle: project.campaignTitle,
      amount: dispute.amount,
      type: "escrow_release",
      timestamp: new Date().toISOString(),
      status: "completed"
    });

  } else if (resolution === "refunded_to_brand") {
    project.status = "rejected";
    project.escrowStatus = "refunded";
    dispute.comments.push({
      sender: "admin",
      text: "Resolution: Escrow fully refunded to the brand.",
      timestamp: new Date().toISOString()
    });

    const brand = dbState.brands.find(b => b.id === project.brandId);
    if (brand) {
      brand.budgetLeft += dispute.amount;
    }

    dbState.transactions.unshift({
      id: `tx_${Date.now()}`,
      brandId: project.brandId,
      creatorId: project.creatorId,
      brandName: project.brandName,
      creatorName: project.creatorName,
      campaignTitle: project.campaignTitle,
      amount: dispute.amount,
      type: "refund",
      timestamp: new Date().toISOString(),
      status: "completed"
    });

  } else if (resolution === "split") {
    const creatorAmt = Number(splitCreatorAmount) || 0;
    const brandAmt = Number(splitBrandAmount) || 0;

    project.status = "approved";
    project.escrowStatus = "released"; // marking released for the split portion
    dispute.splitCreatorAmount = creatorAmt;
    dispute.splitBrandAmount = brandAmt;

    dispute.comments.push({
      sender: "admin",
      text: `Resolution: Escrow split resolved. Released $${creatorAmt} to Creator, Refunded $${brandAmt} to Brand.`,
      timestamp: new Date().toISOString()
    });

    const creator = dbState.creators.find(c => c.id === project.creatorId);
    if (creator) {
      creator.exp += 150;
    }

    const brand = dbState.brands.find(b => b.id === project.brandId);
    if (brand) {
      brand.budgetLeft += brandAmt;
    }

    dbState.transactions.unshift({
      id: `tx_split_c_${Date.now()}`,
      brandId: project.brandId,
      creatorId: project.creatorId,
      brandName: project.brandName,
      creatorName: project.creatorName,
      campaignTitle: project.campaignTitle + " (Dispute Split - Creator)",
      amount: creatorAmt,
      type: "dispute_payout",
      timestamp: new Date().toISOString(),
      status: "completed"
    });

    dbState.transactions.unshift({
      id: `tx_split_b_${Date.now()}`,
      brandId: project.brandId,
      creatorId: project.creatorId,
      brandName: project.brandName,
      creatorName: project.creatorName,
      campaignTitle: project.campaignTitle + " (Dispute Split - Brand Refund)",
      amount: brandAmt,
      type: "refund",
      timestamp: new Date().toISOString(),
      status: "completed"
    });
  }

  res.json({ dispute, project });
});

// Configure Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UGC GULF server successfully listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export type ImageResolution = '1K' | '2K' | '4K';
export type AspectRatio = '3:4' | '1:1';
export type AgeGroup = '2-4' | '5-8' | '9+';

export type ArtStyle =
  | 'storybook'
  | 'toddler-chunky'
  | 'kawaii'
  | 'mandala'
  | 'comic'
  | 'wildlife';

export interface ColoringPage {
  pageNumber: number;
  title: string;
  caption: string;
  coloringTip: string;
  prompt: string;
  imageUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  errorMessage?: string;
  userColoredDataUrl?: string; // If colored inside the app
  sceneCategory?: string;
}

export interface ColoringBook {
  id: string;
  childName: string;
  theme: string;
  ageGroup: AgeGroup;
  artStyle: ArtStyle;
  imageResolution: ImageResolution;
  aspectRatio: AspectRatio;
  bookTitle: string;
  bookSubtitle: string;
  dedication: string;
  coverPrompt: string;
  coverImageUrl?: string;
  createdAt: string;
  pages: ColoringPage[];
  isProBook?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface ProSubscriptionState {
  isPro: boolean;
  tier: 'free' | 'pro';
  activatedAt?: string;
  planName: string;
  price: string;
}

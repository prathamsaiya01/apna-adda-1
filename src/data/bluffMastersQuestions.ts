export interface BluffQuestionPair {
  id: number;
  category: string;
  regularQuestion: string;
  blufferQuestion: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export const BLUFF_CATEGORIES = [
  "All Categories",
  "College & Student Life",
  "Friends & Group Chaos",
  "Bollywood & Entertainment",
  "Cricket & Sports",
  "Food & Everyday Life",
  "Relationships & Social Life",
  "Absurd & Random Chaos",
  "Apna Adda Special"
] as const;

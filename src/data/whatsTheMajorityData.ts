// src/data/whatsTheMajorityData.ts

export interface CrowdOption {
  id: string;
  text: string;
  rank: 1 | 2 | 3 | 4;
  points: number;
  percentage?: number;
  keywords?: string[];
  acceptedPhrases?: string[];
  aliases?: string[];
}

export interface CrowdQuestion {
  id: string;
  category: string;
  question: string;
  audience: string;
  answerFormat?: "FIXED_OPTIONS" | "OPEN_ENDED";
  options: CrowdOption[];
}

export interface FriendsQuestion {
  id: string;
  category: string;
  prompt: string;
  followUp?: string;
}

export const CATEGORIES = [
  "Bollywood & Cinema",
  "Indian Street Food & Chai",
  "College & Hostel Life",
  "Cricket & IPL",
  "Daily Desi Life & Habits",
  "Social Media & Dating",
  "Weddings & Family Drama",
  "Work & Corporate Mazdoor",
  "Apna Adda Chaos",
  "Travel & Train Journeys"
];

export const PASS_AND_PLAY_CROWD_QUESTIONS: CrowdQuestion[] = [
  {
    id: "classic_friendship_001",
    category: "Social Media & Dating",
    question: "What is the biggest red flag in a friendship?",
    audience: "1,000 Indian college students",
    answerFormat: "OPEN_ENDED",
    options: [
      {
        id: "ans_1",
        text: "Lying",
        rank: 1,
        points: 40,
        percentage: 48,
        keywords: ["lying", "lie", "lies", "dishonest", "dishonesty", "being dishonest", "liar"],
        acceptedPhrases: ["they keep lying", "always lying", "telling lies"]
      },
      {
        id: "ans_2",
        text: "Backstabbing",
        rank: 2,
        points: 30,
        percentage: 26,
        keywords: ["backstabbing", "backstab", "betrayal", "betray", "bitching"],
        acceptedPhrases: ["talking behind my back", "backstab a friend"]
      },
      {
        id: "ans_3",
        text: "Sharing Secrets",
        rank: 3,
        points: 20,
        percentage: 16,
        keywords: ["sharing secrets", "exposing secrets", "leaking secrets", "gossiping"],
        acceptedPhrases: ["telling others my secrets", "exposing personal information"]
      },
      {
        id: "ans_4",
        text: "Being Fake",
        rank: 4,
        points: 10,
        percentage: 10,
        keywords: ["fake", "fake friend", "two faced", "pretending"],
        acceptedPhrases: ["acting fake", "pretending to be a friend"]
      }
    ]
  },
  {
    id: "classic_college_002",
    category: "College & Hostel Life",
    question: "What is the #1 reason students give for bunking an 8:00 AM lecture?",
    audience: "1,000 engineering and commerce students",
    answerFormat: "OPEN_ENDED",
    options: [
      {
        id: "ans_col_1",
        text: "Overslept (Neend nahi khuli)",
        rank: 1,
        points: 40,
        percentage: 52,
        keywords: ["overslept", "oversleeping", "neend", "sleep", "so gaya", "woke up late"],
        acceptedPhrases: ["neend nahi khuli", "so raha tha", "slept through alarm"]
      },
      {
        id: "ans_col_2",
        text: "Safe Attendance (Above 75%)",
        rank: 2,
        points: 30,
        percentage: 24,
        keywords: ["attendance", "75%", "safe attendance", "attendance full"],
        acceptedPhrases: ["attendance safe hai", "above 75 percent"]
      },
      {
        id: "ans_col_3",
        text: "Hangout at Canteen / Chai Tapri",
        rank: 3,
        points: 20,
        percentage: 14,
        keywords: ["chai", "canteen", "tapri", "sutta", "hangout", "friends"],
        acceptedPhrases: ["chai peena tha", "canteen mein baithe the"]
      },
      {
        id: "ans_col_4",
        text: "Boring Professor",
        rank: 4,
        points: 10,
        percentage: 10,
        keywords: ["boring", "boring professor", "professor", "teacher", "boring class"],
        acceptedPhrases: ["professor is boring", "boring lecture"]
      }
    ]
  },
  {
    id: "classic_street_007",
    category: "Indian Street Food & Chai",
    question: "Which Indian street food reigns supreme as #1 across the country?",
    audience: "1,000 street food enthusiasts across India",
    answerFormat: "OPEN_ENDED",
    options: [
      {
        id: "ans_st_1",
        text: "Pani Puri / Golgappa",
        rank: 1,
        points: 40,
        percentage: 51,
        keywords: ["pani puri", "golgappa", "puchka", "batashe", "gupchup"],
        acceptedPhrases: ["teekha pani puri", "pani puri golgappa"]
      },
      {
        id: "ans_st_2",
        text: "Samosa",
        rank: 2,
        points: 30,
        percentage: 25,
        keywords: ["samosa", "samosas", "singhara"],
        acceptedPhrases: ["garam samosa", "chai samosa"]
      },
      {
        id: "ans_st_3",
        text: "Vada Pav",
        rank: 3,
        points: 20,
        percentage: 15,
        keywords: ["vada pav", "wada pav", "batata vada"],
        acceptedPhrases: ["mumbai vada pav", "garam vada pav"]
      },
      {
        id: "ans_st_4",
        text: "Pav Bhaji",
        rank: 4,
        points: 10,
        percentage: 9,
        keywords: ["pav bhaji", "paav bhaji", "bhaji pav"],
        acceptedPhrases: ["amul butter pav bhaji", "hot pav bhaji"]
      }
    ]
  },
  {
    id: "classic_ipl_004",
    category: "Cricket & IPL",
    question: "Which IPL team has the most loyal & passionate fanbase?",
    audience: "1,000 active Indian cricket followers",
    answerFormat: "FIXED_OPTIONS",
    options: [
      { id: "o1", text: "Royal Challengers Bengaluru (RCB)", rank: 1, points: 40, percentage: 48 },
      { id: "o2", text: "Chennai Super Kings (CSK)", rank: 2, points: 30, percentage: 33 },
      { id: "o3", text: "Mumbai Indians (MI)", rank: 3, points: 20, percentage: 13 },
      { id: "o4", text: "Kolkata Knight Riders (KKR)", rank: 4, points: 10, percentage: 6 }
    ]
  },
  {
    id: "c1",
    category: "Bollywood & Cinema",
    question: "Who is the ultimate Badshah / King of Bollywood?",
    audience: "1,000 Indian moviegoers across Mumbai, Delhi & Bangalore",
    answerFormat: "OPEN_ENDED",
    options: [
      {
        id: "o1",
        text: "Shah Rukh Khan (SRK)",
        rank: 1,
        points: 40,
        percentage: 56,
        keywords: ["srk", "shah rukh", "shahrukh", "shah rukh khan", "badshah", "king khan"]
      },
      {
        id: "o2",
        text: "Amitabh Bachchan",
        rank: 2,
        points: 30,
        percentage: 24,
        keywords: ["amitabh", "bachchan", "big b", "shehenshah"]
      },
      {
        id: "o3",
        text: "Salman Khan",
        rank: 3,
        points: 20,
        percentage: 14,
        keywords: ["salman", "bhai", "sallu", "salman khan", "bhaijaan"]
      },
      {
        id: "o4",
        text: "Aamir Khan",
        rank: 4,
        points: 10,
        percentage: 6,
        keywords: ["aamir", "aamir khan", "perfectionist"]
      }
    ]
  },
  {
    id: "c6",
    category: "Indian Street Food & Chai",
    question: "What is the best biscuit to dip in hot cutting chai?",
    audience: "1,000 daily tea tapri regulars across India",
    answerFormat: "OPEN_ENDED",
    options: [
      {
        id: "o1",
        text: "Parle-G",
        rank: 1,
        points: 40,
        percentage: 61,
        keywords: ["parle g", "parle-g", "parleg"]
      },
      {
        id: "o2",
        text: "Rusk / Toast",
        rank: 2,
        points: 30,
        percentage: 21,
        keywords: ["rusk", "toast"]
      },
      {
        id: "o3",
        text: "Bourbon",
        rank: 3,
        points: 20,
        percentage: 11,
        keywords: ["bourbon", "chocolate biscuit"]
      },
      {
        id: "o4",
        text: "Good Day",
        rank: 4,
        points: 10,
        percentage: 7,
        keywords: ["good day", "goodday", "butter biscuit"]
      }
    ]
  }
];

export const PASS_AND_PLAY_FRIENDS_QUESTIONS: FriendsQuestion[] = [
  {
    id: "f1",
    category: "Apna Adda Chaos",
    prompt: "Who in this room is most likely to become a crorepati first?",
    followUp: "Did the money change them, or were they always greedy?"
  },
  {
    id: "f2",
    category: "Apna Adda Chaos",
    prompt: "Who takes the longest to reply on WhatsApp (leaves on delivered for 3 business days)?",
    followUp: "Tag them right now and ask for an explanation!"
  },
  {
    id: "f3",
    category: "Apna Adda Chaos",
    prompt: "Who is the secret 'Mom / Dad' of this group who makes sure everyone reaches home safely?",
    followUp: "The person carrying wet wipes, band-aids and common sense."
  },
  {
    id: "f4",
    category: "Apna Adda Chaos",
    prompt: "Who would die first in a Zombie Apocalypse because they stopped to take a selfie?",
    followUp: "Or because they tried to negotiate with the zombie."
  },
  {
    id: "f5",
    category: "Apna Adda Chaos",
    prompt: "Who spends the most ridiculous amount of money on Swiggy / Zomato every month?",
    followUp: "Check their phone right now, they have Gold/One membership."
  },
  {
    id: "f6",
    category: "Apna Adda Chaos",
    prompt: "Who has the wildest, most unbelievable excuses for being late?",
    followUp: "'Bhai bas 2 minute mein pohoch raha hu' (Still in bathroom)."
  },
  {
    id: "f7",
    category: "Apna Adda Chaos",
    prompt: "Who in this room is the biggest drama queen when slightly sick?",
    followUp: "Sneezes once and prepares their last will and testament."
  },
  {
    id: "f13",
    category: "Apna Adda Chaos",
    prompt: "Who is the most competitive person in this Adda (gets genuinely mad if they lose)?",
    followUp: "Look at their face right now, they're plotting revenge."
  }
];

/**
 * Client-side normalized matcher for offline Pass & Play
 */
export function clientMatchAnswer(rawInput: string, options: CrowdOption[]) {
  if (!rawInput || typeof rawInput !== "string") return null;
  const normalized = rawInput
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  for (const opt of options) {
    const optNorm = opt.text.toLowerCase().trim();
    if (normalized === optNorm) return opt;

    if (opt.acceptedPhrases) {
      for (const phrase of opt.acceptedPhrases) {
        if (normalized === phrase.toLowerCase().trim() || normalized.includes(phrase.toLowerCase().trim())) {
          return opt;
        }
      }
    }

    if (opt.keywords) {
      for (const kw of opt.keywords) {
        const regex = new RegExp(`(^|\\b)${kw.toLowerCase().trim()}(\\b|$)`, "i");
        if (regex.test(normalized)) {
          return opt;
        }
      }
    }
  }

  return null;
}

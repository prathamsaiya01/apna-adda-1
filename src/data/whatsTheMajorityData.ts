// src/data/whatsTheMajorityData.ts

export interface CrowdOption {
  id: string;
  text: string;
  rank: 1 | 2 | 3 | 4;
  points: number;
  percentage: number;
  aliases?: string[];
}

export interface CrowdQuestion {
  id: string;
  category: string;
  question: string;
  audience: string;
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
    id: "c1",
    category: "Bollywood & Cinema",
    question: "We surveyed 1,000 Indians: Who is the ultimate Badshah / King of Bollywood?",
    audience: "1,000 Indian moviegoers across Mumbai, Delhi & Bangalore",
    options: [
      { id: "o1", text: "Shah Rukh Khan (SRK)", rank: 1, points: 40, percentage: 56 },
      { id: "o2", text: "Amitabh Bachchan", rank: 2, points: 30, percentage: 24 },
      { id: "o3", text: "Salman Khan", rank: 3, points: 20, percentage: 14 },
      { id: "o4", text: "Aamir Khan", rank: 4, points: 10, percentage: 6 }
    ]
  },
  {
    id: "c2",
    category: "Bollywood & Cinema",
    question: "We surveyed 1,000 people: Which Bollywood dialogue is quoted the most in daily life?",
    audience: "1,000 cinephiles across India",
    options: [
      { id: "o1", text: "Mogambo Khush Hua", rank: 1, points: 40, percentage: 42 },
      { id: "o2", text: "Kitne Aadmi The?", rank: 2, points: 30, percentage: 31 },
      { id: "o3", text: "Bade bade deshon mein aisi chhoti chhoti baatein...", rank: 3, points: 20, percentage: 18 },
      { id: "o4", text: "Picture abhi baaki hai mere dost", rank: 4, points: 10, percentage: 9 }
    ]
  },
  {
    id: "c5",
    category: "Indian Street Food & Chai",
    question: "We surveyed 1,000 street food lovers: What is India's undisputed #1 street food snack?",
    audience: "1,000 foodies across Delhi, Mumbai, Kolkata & Indore",
    options: [
      { id: "o1", text: "Pani Puri / Golgappa / Puchka", rank: 1, points: 40, percentage: 51 },
      { id: "o2", text: "Samosa", rank: 2, points: 30, percentage: 25 },
      { id: "o3", text: "Vada Pav", rank: 3, points: 20, percentage: 15 },
      { id: "o4", text: "Pav Bhaji", rank: 4, points: 10, percentage: 9 }
    ]
  },
  {
    id: "c6",
    category: "Indian Street Food & Chai",
    question: "We surveyed 1,000 chai drinkers: What is the best biscuit to dip in hot cutting chai?",
    audience: "1,000 daily tea tapri regulars across India",
    options: [
      { id: "o1", text: "Parle-G", rank: 1, points: 40, percentage: 61 },
      { id: "o2", text: "Rusk / Toast", rank: 2, points: 30, percentage: 21 },
      { id: "o3", text: "Bourbon", rank: 3, points: 20, percentage: 11 },
      { id: "o4", text: "Good Day (Butter/Cashew)", rank: 4, points: 10, percentage: 7 }
    ]
  },
  {
    id: "c12",
    category: "Cricket & IPL",
    question: "We surveyed 1,000 cricket fans: Who is India's greatest captain in history?",
    audience: "1,000 active Indian cricket followers",
    options: [
      { id: "o1", text: "MS Dhoni (Mahi)", rank: 1, points: 40, percentage: 55 },
      { id: "o2", text: "Rohit Sharma (Hitman)", rank: 2, points: 30, percentage: 21 },
      { id: "o3", text: "Sourav Ganguly (Dada)", rank: 3, points: 20, percentage: 14 },
      { id: "o4", text: "Kapil Dev", rank: 4, points: 10, percentage: 10 }
    ]
  },
  {
    id: "c15",
    category: "Daily Desi Life & Habits",
    question: "We surveyed 1,000 Indian families: What is stored inside the Royal Dansk blue Danish Cookie tin in Indian homes?",
    audience: "1,000 Indian households",
    options: [
      { id: "o1", text: "Sewing kit (Sui-Dhaaga, buttons & scissors)", rank: 1, points: 40, percentage: 74 },
      { id: "o2", text: "Old medicine strips & band-aids", rank: 2, points: 30, percentage: 13 },
      { id: "o3", text: "Foreign coins & old currency notes", rank: 3, points: 20, percentage: 8 },
      { id: "o4", text: "Actual Danish Butter Cookies (Miracle!)", rank: 4, points: 10, percentage: 5 }
    ]
  },
  {
    id: "c17",
    category: "Daily Desi Life & Habits",
    question: "We surveyed 1,000 shoppers: What free item do Indians always demand from the sabzi-wala?",
    audience: "1,000 Indian vegetable market shoppers",
    options: [
      { id: "o1", text: "Dhaniya & Mirchi (Coriander & Green Chilies)", rank: 1, points: 40, percentage: 82 },
      { id: "o2", text: "Extra Nimbu (Lemon)", rank: 2, points: 30, percentage: 10 },
      { id: "o3", text: "Kari Patta (Curry leaves)", rank: 3, points: 20, percentage: 5 },
      { id: "o4", text: "Extra plastic bag / Theli", rank: 4, points: 10, percentage: 3 }
    ]
  },
  {
    id: "c20",
    category: "Travel & Train Journeys",
    question: "We surveyed 1,000 IRCTC train travelers: What is the most popular berth to fight for on Indian Railways?",
    audience: "1,000 sleeper and 3AC train passengers",
    options: [
      { id: "o1", text: "Side Lower (Window + Bed combo)", rank: 1, points: 40, percentage: 68 },
      { id: "o2", text: "Upper Berth (Total peace & zero disturbance)", rank: 2, points: 30, percentage: 18 },
      { id: "o3", text: "Side Upper", rank: 3, points: 20, percentage: 9 },
      { id: "o4", text: "Middle Berth (Literally nobody wants this)", rank: 4, points: 10, percentage: 5 }
    ]
  },
  {
    id: "c21",
    category: "Travel & Train Journeys",
    question: "We surveyed 1,000 road-trippers: What is the dream road trip destination that friends always plan but cancel?",
    audience: "1,000 college squads and travel planners",
    options: [
      { id: "o1", text: "Goa (The eternal cancelled plan)", rank: 1, points: 40, percentage: 72 },
      { id: "o2", text: "Ladakh / Leh bike trip", rank: 2, points: 30, percentage: 16 },
      { id: "o3", text: "Manali / Kasol", rank: 3, points: 20, percentage: 8 },
      { id: "o4", text: "Rishikesh river rafting", rank: 4, points: 10, percentage: 4 }
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

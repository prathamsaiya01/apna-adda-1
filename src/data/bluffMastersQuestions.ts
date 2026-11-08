// src/data/bluffMastersQuestions.ts

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

export type BluffCategory = typeof BLUFF_CATEGORIES[number];

export const BLUFF_MASTERS_QUESTIONS: BluffQuestionPair[] = [
  {
    "id": 1,
    "category": "College & Student Life",
    "regularQuestion": "What is the worst excuse for bunking college?",
    "blufferQuestion": "What is the worst excuse for being late to a wedding?",
    "difficulty": "easy",
    "tags": [
      "college",
      "bunking",
      "excuses",
      "relatable"
    ]
  },
  {
    "id": 2,
    "category": "College & Student Life",
    "regularQuestion": "What is the most useless thing a student can learn?",
    "blufferQuestion": "What is the most useless thing a teacher can teach?",
    "difficulty": "easy",
    "tags": [
      "college",
      "learning",
      "useless",
      "study"
    ]
  },
  {
    "id": 3,
    "category": "College & Student Life",
    "regularQuestion": "What would you do if you woke up and realized you had an exam today?",
    "blufferQuestion": "What would you do if you realized your train was leaving in 2 minutes?",
    "difficulty": "medium",
    "tags": [
      "panic",
      "exam",
      "morning",
      "rush"
    ]
  },
  {
    "id": 4,
    "category": "College & Student Life",
    "regularQuestion": "What is the funniest thing that can happen during a lecture?",
    "blufferQuestion": "What is the funniest thing that can happen during a job interview?",
    "difficulty": "easy",
    "tags": [
      "lecture",
      "funny",
      "interview",
      "classroom"
    ]
  },
  {
    "id": 5,
    "category": "College & Student Life",
    "regularQuestion": "What is the worst thing to write in an exam answer sheet?",
    "blufferQuestion": "What is the worst thing to say during a job interview?",
    "difficulty": "medium",
    "tags": [
      "exam",
      "answers",
      "blunders",
      "interview"
    ]
  },
  {
    "id": 6,
    "category": "College & Student Life",
    "regularQuestion": "What is the most suspicious thing a student can do in class?",
    "blufferQuestion": "What is the most suspicious thing a teacher can do in class?",
    "difficulty": "medium",
    "tags": [
      "suspicious",
      "classroom",
      "student",
      "teacher"
    ]
  },
  {
    "id": 7,
    "category": "College & Student Life",
    "regularQuestion": "What is the best excuse for not submitting an assignment?",
    "blufferQuestion": "What is the best excuse for not paying someone back?",
    "difficulty": "easy",
    "tags": [
      "assignment",
      "excuses",
      "money",
      "college"
    ]
  },
  {
    "id": 8,
    "category": "College & Student Life",
    "regularQuestion": "What would you name a college subject that teaches absolutely nothing?",
    "blufferQuestion": "What would you name a TV show that teaches absolutely nothing?",
    "difficulty": "hard",
    "tags": [
      "names",
      "college",
      "tv",
      "satire"
    ]
  },
  {
    "id": 9,
    "category": "College & Student Life",
    "regularQuestion": "What is the worst thing to happen during a college presentation?",
    "blufferQuestion": "What is the worst thing to happen during a wedding speech?",
    "difficulty": "medium",
    "tags": [
      "presentation",
      "public speaking",
      "embarrassing",
      "fail"
    ]
  },
  {
    "id": 10,
    "category": "College & Student Life",
    "regularQuestion": "What is the most embarrassing thing to happen during attendance?",
    "blufferQuestion": "What is the most embarrassing thing to happen during a family function?",
    "difficulty": "easy",
    "tags": [
      "attendance",
      "embarrassing",
      "proxy",
      "family"
    ]
  },
  {
    "id": 11,
    "category": "College & Student Life",
    "regularQuestion": "What is the most ridiculous reason to get suspended from college?",
    "blufferQuestion": "What is the most ridiculous reason to get fired from a job?",
    "difficulty": "medium",
    "tags": [
      "trouble",
      "suspended",
      "fired",
      "college"
    ]
  },
  {
    "id": 12,
    "category": "College & Student Life",
    "regularQuestion": "What is the best way to secretly pass time during a boring lecture?",
    "blufferQuestion": "What is the best way to secretly pass time during a boring meeting?",
    "difficulty": "easy",
    "tags": [
      "boring",
      "pass time",
      "lecture",
      "stealth"
    ]
  },
  {
    "id": 13,
    "category": "College & Student Life",
    "regularQuestion": "What would make a professor instantly lose their job?",
    "blufferQuestion": "What would make a principal instantly lose their job?",
    "difficulty": "medium",
    "tags": [
      "professor",
      "chaos",
      "fired",
      "college"
    ]
  },
  {
    "id": 14,
    "category": "College & Student Life",
    "regularQuestion": "What is the worst thing to hear before an exam?",
    "blufferQuestion": "What is the worst thing to hear before a surgery?",
    "difficulty": "hard",
    "tags": [
      "fear",
      "exam",
      "dark humor",
      "shocker"
    ]
  },
  {
    "id": 15,
    "category": "College & Student Life",
    "regularQuestion": "What is the funniest thing to write on a college notice board?",
    "blufferQuestion": "What is the funniest thing to write on a society notice board?",
    "difficulty": "medium",
    "tags": [
      "notice board",
      "prank",
      "society",
      "humor"
    ]
  },
  {
    "id": 16,
    "category": "College & Student Life",
    "regularQuestion": "What is the most unbelievable excuse for missing a practical?",
    "blufferQuestion": "What is the most unbelievable excuse for missing a flight?",
    "difficulty": "easy",
    "tags": [
      "lab",
      "practical",
      "flight",
      "excuses"
    ]
  },
  {
    "id": 17,
    "category": "College & Student Life",
    "regularQuestion": "What would make a college canteen famous overnight?",
    "blufferQuestion": "What would make a roadside food stall famous overnight?",
    "difficulty": "easy",
    "tags": [
      "canteen",
      "food",
      "viral",
      "college"
    ]
  },
  {
    "id": 18,
    "category": "College & Student Life",
    "regularQuestion": "What is the worst thing to happen on your first day of college?",
    "blufferQuestion": "What is the worst thing to happen on your first day at work?",
    "difficulty": "medium",
    "tags": [
      "first day",
      "awkward",
      "new beginnings",
      "anxiety"
    ]
  },
  {
    "id": 19,
    "category": "College & Student Life",
    "regularQuestion": "What is the most chaotic thing to do during a college fest?",
    "blufferQuestion": "What is the most chaotic thing to do during a family wedding?",
    "difficulty": "easy",
    "tags": [
      "chaos",
      "fest",
      "wedding",
      "crowd"
    ]
  },
  {
    "id": 20,
    "category": "College & Student Life",
    "regularQuestion": "What is the funniest thing a student can say to a strict teacher?",
    "blufferQuestion": "What is the funniest thing a customer can say to a strict manager?",
    "difficulty": "medium",
    "tags": [
      "comeback",
      "teacher",
      "strict",
      "savage"
    ]
  },
  {
    "id": 21,
    "category": "Friends & Group Chaos",
    "regularQuestion": "Who in your friend group would survive a zombie apocalypse?",
    "blufferQuestion": "Who in your friend group would accidentally start a zombie apocalypse?",
    "difficulty": "medium",
    "tags": [
      "friends",
      "zombie",
      "survival",
      "group"
    ]
  },
  {
    "id": 22,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the most embarrassing thing a friend can do in public?",
    "blufferQuestion": "What is the most embarrassing thing a sibling can do in public?",
    "difficulty": "easy",
    "tags": [
      "embarrassing",
      "public",
      "friends",
      "siblings"
    ]
  },
  {
    "id": 23,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the worst reason to block your best friend?",
    "blufferQuestion": "What is the worst reason to unfollow your best friend?",
    "difficulty": "easy",
    "tags": [
      "drama",
      "social media",
      "blocking",
      "petty"
    ]
  },
  {
    "id": 24,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the most suspicious thing a friend can say?",
    "blufferQuestion": "What is the most suspicious thing a roommate can say?",
    "difficulty": "medium",
    "tags": [
      "suspicious",
      "secrets",
      "roommate",
      "mystery"
    ]
  },
  {
    "id": 25,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the funniest way to ruin a group photo?",
    "blufferQuestion": "What is the funniest way to ruin a birthday party?",
    "difficulty": "easy",
    "tags": [
      "photo",
      "party",
      "ruined",
      "humor"
    ]
  },
  {
    "id": 26,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the worst thing to borrow from a friend?",
    "blufferQuestion": "What is the worst thing to borrow from a neighbour?",
    "difficulty": "easy",
    "tags": [
      "borrow",
      "neighbour",
      "boundaries",
      "friends"
    ]
  },
  {
    "id": 27,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the most ridiculous thing to fight about in a friend group?",
    "blufferQuestion": "What is the most ridiculous thing to fight about in a family?",
    "difficulty": "medium",
    "tags": [
      "fights",
      "petty",
      "family",
      "arguments"
    ]
  },
  {
    "id": 28,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the funniest excuse for leaving a group chat?",
    "blufferQuestion": "What is the funniest excuse for leaving a party?",
    "difficulty": "easy",
    "tags": [
      "group chat",
      "ghosting",
      "party",
      "excuses"
    ]
  },
  {
    "id": 29,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the worst secret a friend could reveal about you?",
    "blufferQuestion": "What is the worst secret a sibling could reveal about you?",
    "difficulty": "hard",
    "tags": [
      "secrets",
      "betrayal",
      "siblings",
      "gossip"
    ]
  },
  {
    "id": 30,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What would make you immediately suspect your best friend is lying?",
    "blufferQuestion": "What would make you immediately suspect your boss is lying?",
    "difficulty": "medium",
    "tags": [
      "lying",
      "tell",
      "boss",
      "instinct"
    ]
  },
  {
    "id": 31,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the most annoying habit of a friend?",
    "blufferQuestion": "What is the most annoying habit of a roommate?",
    "difficulty": "easy",
    "tags": [
      "annoying",
      "habits",
      "roommate",
      "quirks"
    ]
  },
  {
    "id": 32,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the funniest thing to do when a friend falls asleep first?",
    "blufferQuestion": "What is the funniest thing to do when a friend gets distracted first?",
    "difficulty": "easy",
    "tags": [
      "sleepover",
      "prank",
      "humor",
      "mischief"
    ]
  },
  {
    "id": 33,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the worst person to get stuck in a lift with?",
    "blufferQuestion": "What is the worst person to get stuck on a road trip with?",
    "difficulty": "medium",
    "tags": [
      "lift",
      "road trip",
      "awkward",
      "nightmare"
    ]
  },
  {
    "id": 34,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the most chaotic thing your friend group could do together?",
    "blufferQuestion": "What is the most chaotic thing your family could do together?",
    "difficulty": "medium",
    "tags": [
      "chaos",
      "adventure",
      "friendship",
      "family"
    ]
  },
  {
    "id": 35,
    "category": "Friends & Group Chaos",
    "regularQuestion": "What is the funniest reason to cancel a plan?",
    "blufferQuestion": "What is the funniest reason to cancel a date?",
    "difficulty": "easy",
    "tags": [
      "cancelling",
      "laziness",
      "introvert",
      "date"
    ]
  },
  {
    "id": 36,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "Which Bollywood character would make the worst roommate?",
    "blufferQuestion": "Which Bollywood character would make the worst boss?",
    "difficulty": "easy",
    "tags": [
      "bollywood",
      "characters",
      "roommate",
      "boss"
    ]
  },
  {
    "id": 37,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "What is the most dramatic way to enter a room?",
    "blufferQuestion": "What is the most dramatic way to leave a room?",
    "difficulty": "easy",
    "tags": [
      "drama",
      "entry",
      "exit",
      "bollywood"
    ]
  },
  {
    "id": 38,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "Which Bollywood villain would be the funniest school principal?",
    "blufferQuestion": "Which Bollywood hero would be the funniest school principal?",
    "difficulty": "medium",
    "tags": [
      "villains",
      "heroes",
      "principal",
      "school"
    ]
  },
  {
    "id": 39,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "What is the worst song to play at a wedding?",
    "blufferQuestion": "What is the worst song to play at a funeral?",
    "difficulty": "hard",
    "tags": [
      "music",
      "wedding",
      "inappropriate",
      "funeral"
    ]
  },
  {
    "id": 40,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "Which movie title best describes your college life?",
    "blufferQuestion": "Which movie title best describes your love life?",
    "difficulty": "easy",
    "tags": [
      "movie titles",
      "college",
      "love",
      "relatable"
    ]
  },
  {
    "id": 41,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "What is the most ridiculous reason for a Bollywood hero to fight someone?",
    "blufferQuestion": "What is the most ridiculous reason for a Bollywood villain to turn evil?",
    "difficulty": "medium",
    "tags": [
      "bollywood tropes",
      "hero",
      "villain",
      "fight"
    ]
  },
  {
    "id": 42,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "Which actor would be the worst cricket commentator?",
    "blufferQuestion": "Which cricketer would be the worst Bollywood actor?",
    "difficulty": "medium",
    "tags": [
      "crossover",
      "actor",
      "cricket",
      "commentary"
    ]
  },
  {
    "id": 43,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "What is the funniest thing a Bollywood hero could say during an exam?",
    "blufferQuestion": "What is the funniest thing a Bollywood villain could say during an exam?",
    "difficulty": "easy",
    "tags": [
      "dialogue",
      "exam",
      "hero",
      "villain"
    ]
  },
  {
    "id": 44,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "What is the worst superpower for a Bollywood hero?",
    "blufferQuestion": "What is the worst superpower for a Bollywood villain?",
    "difficulty": "medium",
    "tags": [
      "superpower",
      "useless",
      "bollywood",
      "comedy"
    ]
  },
  {
    "id": 45,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "Which fictional character would be the worst politician?",
    "blufferQuestion": "Which fictional character would be the worst teacher?",
    "difficulty": "medium",
    "tags": [
      "fiction",
      "politician",
      "teacher",
      "satire"
    ]
  },
  {
    "id": 46,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "What is the most dramatic excuse to miss a movie?",
    "blufferQuestion": "What is the most dramatic excuse to miss a wedding?",
    "difficulty": "easy",
    "tags": [
      "excuse",
      "drama",
      "movie",
      "wedding"
    ]
  },
  {
    "id": 47,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "What is the funniest name for a Bollywood movie about college?",
    "blufferQuestion": "What is the funniest name for a Bollywood movie about cricket?",
    "difficulty": "medium",
    "tags": [
      "movie name",
      "creativity",
      "bollywood",
      "humor"
    ]
  },
  {
    "id": 48,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "Which movie character would be the worst person to go on a trip with?",
    "blufferQuestion": "Which movie character would be the worst person to go on a date with?",
    "difficulty": "easy",
    "tags": [
      "trip",
      "date",
      "movies",
      "nightmare"
    ]
  },
  {
    "id": 49,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "What is the most ridiculous thing a movie hero could do to impress someone?",
    "blufferQuestion": "What is the most ridiculous thing a movie villain could do to impress someone?",
    "difficulty": "medium",
    "tags": [
      "impress",
      "romance",
      "tropes",
      "cliche"
    ]
  },
  {
    "id": 50,
    "category": "Bollywood & Entertainment",
    "regularQuestion": "What is the worst dialogue to say during a romantic scene?",
    "blufferQuestion": "What is the worst dialogue to say during an action scene?",
    "difficulty": "easy",
    "tags": [
      "dialogue",
      "awkward",
      "romance",
      "action"
    ]
  },
  {
    "id": 51,
    "category": "Cricket & Sports",
    "regularQuestion": "What is the worst excuse for dropping a catch?",
    "blufferQuestion": "What is the worst excuse for missing a penalty?",
    "difficulty": "easy",
    "tags": [
      "cricket",
      "football",
      "catch",
      "excuses"
    ]
  },
  {
    "id": 52,
    "category": "Cricket & Sports",
    "regularQuestion": "What is the funniest thing a cricket captain could say at the toss?",
    "blufferQuestion": "What is the funniest thing a football captain could say before a match?",
    "difficulty": "easy",
    "tags": [
      "captain",
      "toss",
      "cricket",
      "sports"
    ]
  },
  {
    "id": 53,
    "category": "Cricket & Sports",
    "regularQuestion": "What is the worst thing to happen during the final over of a match?",
    "blufferQuestion": "What is the worst thing to happen during the final minute of a football match?",
    "difficulty": "medium",
    "tags": [
      "final over",
      "pressure",
      "choke",
      "thriller"
    ]
  },
  {
    "id": 54,
    "category": "Cricket & Sports",
    "regularQuestion": "Which cricketer would make the funniest school principal?",
    "blufferQuestion": "Which cricketer would make the funniest college professor?",
    "difficulty": "medium",
    "tags": [
      "cricketer",
      "principal",
      "professor",
      "imagination"
    ]
  },
  {
    "id": 55,
    "category": "Cricket & Sports",
    "regularQuestion": "What is the most ridiculous reason for a player to get banned?",
    "blufferQuestion": "What is the most ridiculous reason for a referee to get fired?",
    "difficulty": "medium",
    "tags": [
      "banned",
      "referee",
      "sports drama",
      "rules"
    ]
  },
  {
    "id": 56,
    "category": "Cricket & Sports",
    "regularQuestion": "What is the funniest thing to shout from the cricket boundary?",
    "blufferQuestion": "What is the funniest thing to shout from the football stands?",
    "difficulty": "easy",
    "tags": [
      "crowd",
      "banter",
      "stadium",
      "heckling"
    ]
  },
  {
    "id": 57,
    "category": "Cricket & Sports",
    "regularQuestion": "What is the worst cricket team name ever?",
    "blufferQuestion": "What is the worst football team name ever?",
    "difficulty": "easy",
    "tags": [
      "team name",
      "sports",
      "cringe",
      "naming"
    ]
  },
  {
    "id": 58,
    "category": "Cricket & Sports",
    "regularQuestion": "What is the most embarrassing way to lose a cricket match?",
    "blufferQuestion": "What is the most embarrassing way to lose a football match?",
    "difficulty": "medium",
    "tags": [
      "lose",
      "blunder",
      "run out",
      "own goal"
    ]
  },
  {
    "id": 59,
    "category": "Cricket & Sports",
    "regularQuestion": "What would make an IPL auction completely chaotic?",
    "blufferQuestion": "What would make a football transfer window completely chaotic?",
    "difficulty": "medium",
    "tags": [
      "ipl",
      "auction",
      "money",
      "chaos"
    ]
  },
  {
    "id": 60,
    "category": "Cricket & Sports",
    "regularQuestion": "What is the funniest thing a commentator could say after a six?",
    "blufferQuestion": "What is the funniest thing a commentator could say after a goal?",
    "difficulty": "easy",
    "tags": [
      "commentary",
      "six",
      "goal",
      "hype"
    ]
  },
  {
    "id": 61,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the worst topping to put on a pizza?",
    "blufferQuestion": "What is the worst ingredient to put in a biryani?",
    "difficulty": "easy",
    "tags": [
      "pizza",
      "biryani",
      "food crimes",
      "taste"
    ]
  },
  {
    "id": 62,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the most ridiculous name for a restaurant?",
    "blufferQuestion": "What is the most ridiculous name for a gym?",
    "difficulty": "easy",
    "tags": [
      "restaurant",
      "gym",
      "funny names",
      "business"
    ]
  },
  {
    "id": 63,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the worst food to eat on a first date?",
    "blufferQuestion": "What is the worst food to eat during a job interview?",
    "difficulty": "medium",
    "tags": [
      "messy food",
      "first date",
      "interview",
      "awkward"
    ]
  },
  {
    "id": 64,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the funniest thing to say to a street food vendor?",
    "blufferQuestion": "What is the funniest thing to say to a restaurant waiter?",
    "difficulty": "easy",
    "tags": [
      "street food",
      "pani puri",
      "waiter",
      "ordering"
    ]
  },
  {
    "id": 65,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the worst thing to find inside your lunchbox?",
    "blufferQuestion": "What is the worst thing to find inside your school bag?",
    "difficulty": "easy",
    "tags": [
      "lunchbox",
      "school bag",
      "surprise",
      "disgusting"
    ]
  },
  {
    "id": 66,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the most suspicious thing someone can order at 3 AM?",
    "blufferQuestion": "What is the most suspicious thing someone can search at 3 AM?",
    "difficulty": "medium",
    "tags": [
      "midnight",
      "food",
      "search history",
      "creepy"
    ]
  },
  {
    "id": 67,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the worst food combination that should be illegal?",
    "blufferQuestion": "What is the worst fashion combination that should be illegal?",
    "difficulty": "easy",
    "tags": [
      "food crimes",
      "fashion",
      "cursed",
      "cringe"
    ]
  },
  {
    "id": 68,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the funniest excuse for not sharing your food?",
    "blufferQuestion": "What is the funniest excuse for not sharing your Wi-Fi?",
    "difficulty": "easy",
    "tags": [
      "sharing",
      "foodie",
      "wifi",
      "selfish"
    ]
  },
  {
    "id": 69,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the most ridiculous thing to name a sandwich?",
    "blufferQuestion": "What is the most ridiculous thing to name a burger?",
    "difficulty": "easy",
    "tags": [
      "sandwich",
      "burger",
      "food names",
      "creative"
    ]
  },
  {
    "id": 70,
    "category": "Food & Everyday Life",
    "regularQuestion": "What is the worst thing to happen while cooking for guests?",
    "blufferQuestion": "What is the worst thing to happen while hosting a party?",
    "difficulty": "medium",
    "tags": [
      "cooking",
      "guests",
      "disaster",
      "party"
    ]
  },
  {
    "id": 71,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the worst opening line on a dating app?",
    "blufferQuestion": "What is the worst opening line at a wedding?",
    "difficulty": "easy",
    "tags": [
      "dating app",
      "pickup lines",
      "wedding",
      "cringe"
    ]
  },
  {
    "id": 72,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the most ridiculous reason to break up with someone?",
    "blufferQuestion": "What is the most ridiculous reason to reject a friend?",
    "difficulty": "medium",
    "tags": [
      "breakup",
      "petty",
      "rejection",
      "relationships"
    ]
  },
  {
    "id": 73,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the worst thing to accidentally send to your crush?",
    "blufferQuestion": "What is the worst thing to accidentally send to your boss?",
    "difficulty": "medium",
    "tags": [
      "wrong chat",
      "crush",
      "boss",
      "horror"
    ]
  },
  {
    "id": 74,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the funniest way to get caught lying on a date?",
    "blufferQuestion": "What is the funniest way to get caught lying to your parents?",
    "difficulty": "easy",
    "tags": [
      "lies",
      "caught",
      "parents",
      "date"
    ]
  },
  {
    "id": 75,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the most awkward thing to say on a first date?",
    "blufferQuestion": "What is the most awkward thing to say at a family dinner?",
    "difficulty": "easy",
    "tags": [
      "awkward",
      "first date",
      "family dinner",
      "foot in mouth"
    ]
  },
  {
    "id": 76,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the worst gift to give your crush?",
    "blufferQuestion": "What is the worst gift to give your teacher?",
    "difficulty": "medium",
    "tags": [
      "gifts",
      "crush",
      "teacher",
      "clueless"
    ]
  },
  {
    "id": 77,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the most ridiculous reason to get jealous?",
    "blufferQuestion": "What is the most ridiculous reason to get angry?",
    "difficulty": "medium",
    "tags": [
      "jealousy",
      "anger",
      "overthinking",
      "irrational"
    ]
  },
  {
    "id": 78,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the funniest excuse for not replying to a message?",
    "blufferQuestion": "What is the funniest excuse for not answering a phone call?",
    "difficulty": "easy",
    "tags": [
      "ghosting",
      "replies",
      "phone call",
      "lazy"
    ]
  },
  {
    "id": 79,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the worst thing to put in your dating profile?",
    "blufferQuestion": "What is the worst thing to put in your resume?",
    "difficulty": "medium",
    "tags": [
      "dating profile",
      "bio",
      "resume",
      "red flags"
    ]
  },
  {
    "id": 80,
    "category": "Relationships & Social Life",
    "regularQuestion": "What is the most embarrassing thing to happen during a proposal?",
    "blufferQuestion": "What is the most embarrassing thing to happen during a wedding?",
    "difficulty": "hard",
    "tags": [
      "proposal",
      "wedding",
      "cringe",
      "romance"
    ]
  },
  {
    "id": 81,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "If animals could talk, which animal would be the rudest?",
    "blufferQuestion": "If vehicles could talk, which vehicle would be the rudest?",
    "difficulty": "easy",
    "tags": [
      "animals",
      "vehicles",
      "rude",
      "imagination"
    ]
  },
  {
    "id": 82,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "What would be the worst thing to discover on Mars?",
    "blufferQuestion": "What would be the worst thing to discover at the bottom of the ocean?",
    "difficulty": "medium",
    "tags": [
      "mars",
      "space",
      "ocean",
      "sci-fi"
    ]
  },
  {
    "id": 83,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "What is the worst thing aliens could learn about humans?",
    "blufferQuestion": "What is the worst thing robots could learn about humans?",
    "difficulty": "medium",
    "tags": [
      "aliens",
      "robots",
      "humanity",
      "embarrassing"
    ]
  },
  {
    "id": 84,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "What is the most ridiculous thing to become illegal overnight?",
    "blufferQuestion": "What is the most ridiculous thing to become compulsory overnight?",
    "difficulty": "hard",
    "tags": [
      "laws",
      "bizarre",
      "dystopia",
      "rules"
    ]
  },
  {
    "id": 85,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "What would be the worst name for a superhero?",
    "blufferQuestion": "What would be the worst name for a supervillain?",
    "difficulty": "easy",
    "tags": [
      "superhero",
      "villain",
      "names",
      "funny"
    ]
  },
  {
    "id": 86,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "What is the funniest thing to say to a ghost?",
    "blufferQuestion": "What is the funniest thing to say to an alien?",
    "difficulty": "easy",
    "tags": [
      "ghost",
      "alien",
      "dialogue",
      "paranormal"
    ]
  },
  {
    "id": 87,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "What would be the worst thing to happen if everyone could read minds?",
    "blufferQuestion": "What would be the worst thing to happen if everyone could become invisible?",
    "difficulty": "hard",
    "tags": [
      "mind reading",
      "invisibility",
      "superpower",
      "chaos"
    ]
  },
  {
    "id": 88,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "What is the most useless invention humanity could create?",
    "blufferQuestion": "What is the most dangerous invention humanity could create?",
    "difficulty": "medium",
    "tags": [
      "inventions",
      "science",
      "useless",
      "dangerous"
    ]
  },
  {
    "id": 89,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "What would make a dinosaur instantly regret coming back to life?",
    "blufferQuestion": "What would make a zombie instantly regret coming back to life?",
    "difficulty": "easy",
    "tags": [
      "dinosaur",
      "zombie",
      "modern world",
      "regret"
    ]
  },
  {
    "id": 90,
    "category": "Absurd & Random Chaos",
    "regularQuestion": "What is the worst thing to hear from an AI assistant?",
    "blufferQuestion": "What is the worst thing to hear from a robot doctor?",
    "difficulty": "medium",
    "tags": [
      "ai",
      "robots",
      "future",
      "creepy"
    ]
  },
  {
    "id": 91,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the funniest thing to happen in a WhatsApp group?",
    "blufferQuestion": "What is the funniest thing to happen in a Discord server?",
    "difficulty": "easy",
    "tags": [
      "whatsapp",
      "discord",
      "group chat",
      "internet"
    ]
  },
  {
    "id": 92,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the worst thing to accidentally reveal during a game?",
    "blufferQuestion": "What is the worst thing to accidentally reveal during a livestream?",
    "difficulty": "medium",
    "tags": [
      "secrets",
      "gaming",
      "stream",
      "accidental"
    ]
  },
  {
    "id": 93,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the funniest excuse for losing a multiplayer game?",
    "blufferQuestion": "What is the funniest excuse for winning a multiplayer game?",
    "difficulty": "easy",
    "tags": [
      "multiplayer",
      "losing",
      "winning",
      "gamer excuses"
    ]
  },
  {
    "id": 94,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the most suspicious thing a game host could do?",
    "blufferQuestion": "What is the most suspicious thing a game moderator could do?",
    "difficulty": "medium",
    "tags": [
      "host",
      "moderator",
      "suspicious",
      "party game"
    ]
  },
  {
    "id": 95,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the worst punishment for losing a party game?",
    "blufferQuestion": "What is the worst reward for winning a party game?",
    "difficulty": "easy",
    "tags": [
      "dares",
      "punishment",
      "rewards",
      "party"
    ]
  },
  {
    "id": 96,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the funniest thing to name a multiplayer room?",
    "blufferQuestion": "What is the funniest thing to name a gaming team?",
    "difficulty": "easy",
    "tags": [
      "room name",
      "team name",
      "gaming",
      "creative"
    ]
  },
  {
    "id": 97,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the most ridiculous reason to kick someone out of a game?",
    "blufferQuestion": "What is the most ridiculous reason to ban someone from a group chat?",
    "difficulty": "easy",
    "tags": [
      "kicked",
      "banned",
      "moderation",
      "petty"
    ]
  },
  {
    "id": 98,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the funniest thing to say after getting eliminated?",
    "blufferQuestion": "What is the funniest thing to say after winning?",
    "difficulty": "easy",
    "tags": [
      "elimination",
      "victory",
      "one-liners",
      "comeback"
    ]
  },
  {
    "id": 99,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the worst secret for a Mafia player to reveal?",
    "blufferQuestion": "What is the worst secret for a Detective to reveal?",
    "difficulty": "medium",
    "tags": [
      "mafia",
      "detective",
      "social deduction",
      "spoilers"
    ]
  },
  {
    "id": 100,
    "category": "Apna Adda Special",
    "regularQuestion": "What is the funniest thing that can happen when an Indian family gathers for a party?",
    "blufferQuestion": "What is the funniest thing that can happen when friends play Bluff Masters on Apna Adda?",
    "difficulty": "easy",
    "tags": [
      "indian family",
      "party",
      "bluff masters",
      "apna adda"
    ]
  }
];

export function getQuestionsByCategory(category?: string): BluffQuestionPair[] {
  if (!category || category === 'All Categories') {
    return BLUFF_MASTERS_QUESTIONS;
  }
  return BLUFF_MASTERS_QUESTIONS.filter(
    q => q.category.toLowerCase() === category.toLowerCase()
  );
}

// apna-adda-backend/games/whatsTheMajorityQuestions.js

/**
 * Question Bank for "What's the Majority?" (Apna Adda)
 * Contains:
 *  1. Classic Crowd Mode (1,000 people surveyed with ranks 1-4, 40/30/20/10 points)
 *  2. Friends Mode (Adda member prompts)
 *  3. Schema validator & JSON batch importer
 */

const CATEGORIES = [
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

const CLASSIC_CROWD_QUESTIONS = [
  // --- Bollywood & Cinema ---
  {
    id: "c1",
    category: "Bollywood & Cinema",
    question: "We surveyed 1,000 Indians: Who is the ultimate Badshah / King of Bollywood?",
    audience: "1,000 Indian moviegoers across Mumbai, Delhi & Bangalore",
    options: [
      { id: "o1", text: "Shah Rukh Khan (SRK)", rank: 1, points: 40, percentage: 56, aliases: ["srk", "shah rukh", "shahrukh"] },
      { id: "o2", text: "Amitabh Bachchan", rank: 2, points: 30, percentage: 24, aliases: ["big b", "amitabh", "bachchan"] },
      { id: "o3", text: "Salman Khan", rank: 3, points: 20, percentage: 14, aliases: ["bhai", "salman", "sallu"] },
      { id: "o4", text: "Aamir Khan", rank: 4, points: 10, percentage: 6, aliases: ["aamir", "perfectionist"] }
    ]
  },
  {
    id: "c2",
    category: "Bollywood & Cinema",
    question: "We surveyed 1,000 people: Which Bollywood movie dialogue is quoted the most in daily life?",
    audience: "1,000 college students and cinephiles",
    options: [
      { id: "o1", text: "Mogambo Khush Hua", rank: 1, points: 40, percentage: 42, aliases: ["mogambo", "mr india"] },
      { id: "o2", text: "Kitne Aadmi The?", rank: 2, points: 30, percentage: 31, aliases: ["sholay", "gabbar", "kitne aadmi the"] },
      { id: "o3", text: "Bade bade deshon mein aisi chhoti chhoti baatein...", rank: 3, points: 20, percentage: 18, aliases: ["ddlj", "senorita", "bade bade deshon mein"] },
      { id: "o4", text: "Picture abhi baaki hai mere dost", rank: 4, points: 10, percentage: 9, aliases: ["om shanti om", "picture abhi baaki hai"] }
    ]
  },
  {
    id: "c3",
    category: "Bollywood & Cinema",
    question: "We surveyed 1,000 Bollywood fans: What is the most iconic friendship film of all time?",
    audience: "1,000 Hindi cinema lovers",
    options: [
      { id: "o1", text: "3 Idiots", rank: 1, points: 40, percentage: 46, aliases: ["three idiots", "raju farhan rancho"] },
      { id: "o2", text: "Yeh Jawaani Hai Deewani (YJHD)", rank: 2, points: 30, percentage: 29, aliases: ["yjhd", "bunny", "kabir naina"] },
      { id: "o3", text: "Sholay (Jai-Veeru)", rank: 3, points: 20, percentage: 16, aliases: ["sholay", "jai veeru"] },
      { id: "o4", text: "Dil Chahta Hai", rank: 4, points: 10, percentage: 9, aliases: ["dch", "dil chahta hai"] }
    ]
  },
  {
    id: "c4",
    category: "Bollywood & Cinema",
    question: "We surveyed 1,000 music listeners: Who is India's most beloved playback singer of the modern era?",
    audience: "1,000 Spotify & YouTube Music listeners in India",
    options: [
      { id: "o1", text: "Arijit Singh", rank: 1, points: 40, percentage: 58, aliases: ["arijit", "arijit singh"] },
      { id: "o2", text: "Sonu Nigam", rank: 2, points: 30, percentage: 22, aliases: ["sonu", "sonu nigam"] },
      { id: "o3", text: "KK (Krishnakumar Kunnath)", rank: 3, points: 20, percentage: 13, aliases: ["kk", "krishnakumar kunnath"] },
      { id: "o4", text: "Shreya Ghoshal", rank: 4, points: 10, percentage: 7, aliases: ["shreya", "shreya ghoshal"] }
    ]
  },

  // --- Indian Street Food & Chai ---
  {
    id: "c5",
    category: "Indian Street Food & Chai",
    question: "We surveyed 1,000 street food lovers: What is India's undisputed #1 street food snack?",
    audience: "1,000 foodies across Delhi, Mumbai, Kolkata & Indore",
    options: [
      { id: "o1", text: "Pani Puri / Golgappa / Puchka", rank: 1, points: 40, percentage: 51, aliases: ["pani puri", "golgappa", "puchka", "gol gappe"] },
      { id: "o2", text: "Samosa", rank: 2, points: 30, percentage: 25, aliases: ["samosa", "samosas"] },
      { id: "o3", text: "Vada Pav", rank: 3, points: 20, percentage: 15, aliases: ["vada pav", "wada pav"] },
      { id: "o4", text: "Pav Bhaji", rank: 4, points: 10, percentage: 9, aliases: ["pav bhaji", "paav bhaji"] }
    ]
  },
  {
    id: "c6",
    category: "Indian Street Food & Chai",
    question: "We surveyed 1,000 chai drinkers: What is the best biscuit to dip in hot cutting chai?",
    audience: "1,000 daily tea tapri regulars across India",
    options: [
      { id: "o1", text: "Parle-G", rank: 1, points: 40, percentage: 61, aliases: ["parle g", "parle-g", "parleg"] },
      { id: "o2", text: "Rusk / Toast", rank: 2, points: 30, percentage: 21, aliases: ["rusk", "toast"] },
      { id: "o3", text: "Bourbon", rank: 3, points: 20, percentage: 11, aliases: ["bourbon", "chocolate biscuit"] },
      { id: "o4", text: "Good Day (Butter/Cashew)", rank: 4, points: 10, percentage: 7, aliases: ["good day", "goodday"] }
    ]
  },
  {
    id: "c7",
    category: "Indian Street Food & Chai",
    question: "We surveyed 1,000 foodies: Which city serves the absolute best Biryani?",
    audience: "1,000 biryani connoisseurs across India",
    options: [
      { id: "o1", text: "Hyderabad", rank: 1, points: 40, percentage: 54, aliases: ["hyderabad", "hyderabadi"] },
      { id: "o2", text: "Lucknow / Awadh", rank: 2, points: 30, percentage: 23, aliases: ["lucknow", "lucknowi", "awadhi"] },
      { id: "o3", text: "Kolkata (with potato & egg)", rank: 3, points: 20, percentage: 14, aliases: ["kolkata", "calcutta"] },
      { id: "o4", text: "Moradabad / Delhi", rank: 4, points: 10, percentage: 9, aliases: ["delhi", "moradabad"] }
    ]
  },
  {
    id: "c8",
    category: "Indian Street Food & Chai",
    question: "We surveyed 1,000 midnight snackers: What is the supreme late-night craving food?",
    audience: "1,000 hostelers and late-night engineers",
    options: [
      { id: "o1", text: "Maggi 2-Minute Noodles", rank: 1, points: 40, percentage: 67, aliases: ["maggi", "noodles", "maggie"] },
      { id: "o2", text: "Midnight Swiggy Biryani", rank: 2, points: 30, percentage: 17, aliases: ["biryani", "swiggy", "zomato"] },
      { id: "o3", text: "Leftover Mummy's Food from Fridge", rank: 3, points: 20, percentage: 10, aliases: ["leftovers", "fridge food", "ghar ka khana"] },
      { id: "o4", text: "Bread Butter / Toast", rank: 4, points: 10, percentage: 6, aliases: ["bread butter", "toast", "sandwich"] }
    ]
  },

  // --- College & Hostel Life ---
  {
    id: "c9",
    category: "College & Hostel Life",
    question: "We surveyed 1,000 college students: What is the most common reason for bunking an 8:00 AM lecture?",
    audience: "1,000 undergraduate engineering, commerce & arts students",
    options: [
      { id: "o1", text: "Neend nahi khuli (Overslept)", rank: 1, points: 40, percentage: 53, aliases: ["overslept", "neend", "sleep", "so gaya"] },
      { id: "o2", text: "Attendance is already above 75%", rank: 2, points: 30, percentage: 24, aliases: ["attendance", "safe attendance", "75%"] },
      { id: "o3", text: "Tapri pe chai sutta / hangout with friends", rank: 3, points: 20, percentage: 15, aliases: ["chai", "canteen", "friends", "hangout"] },
      { id: "o4", text: "The professor's lecture is unbearable", rank: 4, points: 10, percentage: 8, aliases: ["boring professor", "boring class"] }
    ]
  },
  {
    id: "c10",
    category: "College & Hostel Life",
    question: "We surveyed 1,000 hostelers: What is the most borrowed item that is never returned?",
    audience: "1,000 hostel and PG residents",
    options: [
      { id: "o1", text: "Phone Charger / Cable", rank: 1, points: 40, percentage: 48, aliases: ["charger", "phone charger", "cable"] },
      { id: "o2", text: "₹50 - ₹200 UPI / Cash", rank: 2, points: 30, percentage: 26, aliases: ["money", "cash", "upi", "50 rupay", "100"] },
      { id: "o3", text: "T-shirt / Hoodie / Clothes", rank: 3, points: 20, percentage: 16, aliases: ["clothes", "tshirt", "hoodie", "shirt"] },
      { id: "o4", text: "Kettle / Maggi bowl / Utensils", rank: 4, points: 10, percentage: 10, aliases: ["kettle", "bowl", "utensil", "plate"] }
    ]
  },
  {
    id: "c11",
    category: "College & Hostel Life",
    question: "We surveyed 1,000 students: When do you actually start studying for semester exams?",
    audience: "1,000 university students",
    options: [
      { id: "o1", text: "One night before the exam at 11 PM", rank: 1, points: 40, percentage: 62, aliases: ["one night before", "night before", "last night"] },
      { id: "o2", text: "2 to 3 days before exam", rank: 2, points: 30, percentage: 22, aliases: ["few days before", "2 days before", "3 days"] },
      { id: "o3", text: "In the morning outside the exam hall", rank: 3, points: 20, percentage: 11, aliases: ["exam morning", "hall", "outside hall"] },
      { id: "o4", text: "From day 1 of the semester (Nerds)", rank: 4, points: 10, percentage: 5, aliases: ["regularly", "day 1", "nerds"] }
    ]
  },

  // --- Cricket & IPL ---
  {
    id: "c12",
    category: "Cricket & IPL",
    question: "We surveyed 1,000 cricket fans: Who is India's greatest captain in history?",
    audience: "1,000 active Indian cricket followers",
    options: [
      { id: "o1", text: "MS Dhoni (Mahi)", rank: 1, points: 40, percentage: 55, aliases: ["msd", "dhoni", "mahi", "captain cool"] },
      { id: "o2", text: "Rohit Sharma (Hitman)", rank: 2, points: 30, percentage: 21, aliases: ["rohit", "hitman", "rohit sharma"] },
      { id: "o3", text: "Sourav Ganguly (Dada)", rank: 3, points: 20, percentage: 14, aliases: ["ganguly", "dada", "sourav"] },
      { id: "o4", text: "Kapil Dev", rank: 4, points: 10, percentage: 10, aliases: ["kapil dev", "kapil paaji", "1983"] }
    ]
  },
  {
    id: "c13",
    category: "Cricket & IPL",
    question: "We surveyed 1,000 cricket enthusiasts: What is the most heartbreaking cricket moment for India?",
    audience: "1,000 Indian sports fans",
    options: [
      { id: "o1", text: "19th Nov 2023 World Cup Final (vs Australia)", rank: 1, points: 40, percentage: 64, aliases: ["nov 19", "2023 world cup final", "ahmedabad", "2023 final"] },
      { id: "o2", text: "Dhoni's Run Out vs NZ in 2019 Semi-Final", rank: 2, points: 30, percentage: 22, aliases: ["dhoni run out", "2019 semi final", "guptill"] },
      { id: "o3", text: "2003 World Cup Final vs Australia", rank: 3, points: 20, percentage: 9, aliases: ["2003 final", "ponting"] },
      { id: "o4", text: "Champions Trophy 2017 Final vs Pakistan", rank: 4, points: 10, percentage: 5, aliases: ["2017 champions trophy", "pakistan 2017"] }
    ]
  },
  {
    id: "c14",
    category: "Cricket & IPL",
    question: "We surveyed 1,000 IPL viewers: Which IPL franchise has the most loyal & passionate fanbase?",
    audience: "1,000 IPL viewers across India",
    options: [
      { id: "o1", text: "Royal Challengers Bengaluru (RCB)", rank: 1, points: 40, percentage: 47, aliases: ["rcb", "bengaluru", "royal challengers"] },
      { id: "o2", text: "Chennai Super Kings (CSK)", rank: 2, points: 30, percentage: 34, aliases: ["csk", "chennai", "super kings", "whistle podu"] },
      { id: "o3", text: "Mumbai Indians (MI)", rank: 3, points: 20, percentage: 13, aliases: ["mi", "mumbai indians"] },
      { id: "o4", text: "Kolkata Knight Riders (KKR)", rank: 4, points: 10, percentage: 6, aliases: ["kkr", "kolkata"] }
    ]
  },

  // --- Daily Desi Life & Habits ---
  {
    id: "c15",
    category: "Daily Desi Life & Habits",
    question: "We surveyed 1,000 Indian families: What is stored inside the Royal Dansk blue Danish Cookie tin in Indian homes?",
    audience: "1,000 Indian households",
    options: [
      { id: "o1", text: "Sewing kit (Sui-Dhaaga, buttons & scissors)", rank: 1, points: 40, percentage: 74, aliases: ["sewing kit", "sui dhaaga", "threads", "buttons"] },
      { id: "o2", text: "Old medicine strips & band-aids", rank: 2, points: 30, percentage: 13, aliases: ["medicines", "dawa", "tablets"] },
      { id: "o3", text: "Foreign coins & old currency notes", rank: 3, points: 20, percentage: 8, aliases: ["coins", "old currency", "sikke"] },
      { id: "o4", text: "Actual Danish Butter Cookies (Miracle!)", rank: 4, points: 10, percentage: 5, aliases: ["actual cookies", "biscuits", "cookies"] }
    ]
  },
  {
    id: "c16",
    category: "Daily Desi Life & Habits",
    question: "We surveyed 1,000 people: What is the most universally hated household chore in India?",
    audience: "1,000 young adults & homeowners",
    options: [
      { id: "o1", text: "Bartan dhona (Washing dishes)", rank: 1, points: 40, percentage: 49, aliases: ["bartan", "dishes", "washing dishes"] },
      { id: "o2", text: "Jhaadu-Pochha (Sweeping & mopping)", rank: 2, points: 30, percentage: 27, aliases: ["pochha", "jhaadu", "mopping"] },
      { id: "o3", text: "Folding dry clothes & ironing", rank: 3, points: 20, percentage: 15, aliases: ["folding clothes", "kapde fold karna", "ironing"] },
      { id: "o4", text: "Sabzi kaatna (Chopping vegetables / onions)", rank: 4, points: 10, percentage: 9, aliases: ["chopping onions", "sabzi kaatna", "peeling garlic"] }
    ]
  },
  {
    id: "c17",
    category: "Daily Desi Life & Habits",
    question: "We surveyed 1,000 shoppers: What free item do Indians always demand from the sabzi-wala?",
    audience: "1,000 Indian vegetable market shoppers",
    options: [
      { id: "o1", text: "Dhaniya & Mirchi (Coriander & Green Chilies)", rank: 1, points: 40, percentage: 82, aliases: ["dhaniya", "mirchi", "dhaniya mirchi", "free dhaniya"] },
      { id: "o2", text: "Extra Nimbu (Lemon)", rank: 2, points: 30, percentage: 10, aliases: ["nimbu", "lemon"] },
      { id: "o3", text: "Kari Patta (Curry leaves)", rank: 3, points: 20, percentage: 5, aliases: ["kari patta", "curry leaves"] },
      { id: "o4", text: "Extra plastic bag / Theli", rank: 4, points: 10, percentage: 3, aliases: ["bag", "theli", "carry bag"] }
    ]
  },

  // --- Social Media & Dating ---
  {
    id: "c18",
    category: "Social Media & Dating",
    question: "We surveyed 1,000 young Indians: What is the biggest red flag on a dating profile?",
    audience: "1,000 Gen Z and millennial daters across Indian metros",
    options: [
      { id: "o1", text: "'Fluent in Sarcasm' / 'Sapio-sexual' bio", rank: 1, points: 40, percentage: 41, aliases: ["sarcasm", "sapiosexual", "cringe bio"] },
      { id: "o2", text: "Gym mirror selfie covering the face with iPhone", rank: 2, points: 30, percentage: 32, aliases: ["gym selfie", "mirror selfie", "iphone covering face"] },
      { id: "o3", text: "Lists Instagram handle directly in the first line", rank: 3, points: 20, percentage: 17, aliases: ["insta handle", "follower begging", "ig handle"] },
      { id: "o4", text: "Only group photos (can't tell who they are)", rank: 4, points: 10, percentage: 10, aliases: ["group photos", "which one is you"] }
    ]
  },
  {
    id: "c19",
    category: "Social Media & Dating",
    question: "We surveyed 1,000 WhatsApp users: What is the most annoying thing received on WhatsApp?",
    audience: "1,000 daily smartphone users in India",
    options: [
      { id: "o1", text: "Good Morning images with glittering roses & sunrise", rank: 1, points: 40, percentage: 53, aliases: ["good morning", "suvichar", "flower image"] },
      { id: "o2", text: "Fake WhatsApp forward rumors ('Forward to 10 groups')", rank: 2, points: 30, percentage: 28, aliases: ["fake forward", "rumors", "forward to 10"] },
      { id: "o3", text: "Unprompted 4-minute voice notes", rank: 3, points: 20, percentage: 12, aliases: ["voice notes", "audio message"] },
      { id: "o4", text: "Added to a random wedding or batch group without permission", rank: 4, points: 10, percentage: 7, aliases: ["random group", "added to group"] }
    ]
  },

  // --- Travel & Train Journeys ---
  {
    id: "c20",
    category: "Travel & Train Journeys",
    question: "We surveyed 1,000 IRCTC train travelers: What is the most popular berth to fight for on Indian Railways?",
    audience: "1,000 sleeper and 3AC train passengers",
    options: [
      { id: "o1", text: "Side Lower (Window + Bed combo)", rank: 1, points: 40, percentage: 68, aliases: ["side lower", "sl", "window seat"] },
      { id: "o2", text: "Upper Berth (Total peace & zero disturbance)", rank: 2, points: 30, percentage: 18, aliases: ["upper berth", "upper", "top berth"] },
      { id: "o3", text: "Side Upper", rank: 3, points: 20, percentage: 9, aliases: ["side upper", "su"] },
      { id: "o4", text: "Middle Berth (Literally nobody wants this)", rank: 4, points: 10, percentage: 5, aliases: ["middle berth", "middle", "mb"] }
    ]
  },
  {
    id: "c21",
    category: "Travel & Train Journeys",
    question: "We surveyed 1,000 road-trippers: What is the dream road trip destination that friends always plan but cancel?",
    audience: "1,000 college squads and travel planners",
    options: [
      { id: "o1", text: "Goa (The eternal cancelled plan)", rank: 1, points: 40, percentage: 72, aliases: ["goa", "goa trip"] },
      { id: "o2", text: "Ladakh / Leh bike trip", rank: 2, points: 30, percentage: 16, aliases: ["ladakh", "leh", "manali ladakh"] },
      { id: "o3", text: "Manali / Kasol", rank: 3, points: 20, percentage: 8, aliases: ["manali", "kasol", "himachal"] },
      { id: "o4", text: "Rishikesh river rafting", rank: 4, points: 10, percentage: 4, aliases: ["rishikesh", "rafting"] }
    ]
  },

  // --- Work & Corporate Mazdoor ---
  {
    id: "c22",
    category: "Work & Corporate Mazdoor",
    question: "We surveyed 1,000 corporate employees: What is the most passive-aggressive phrase in corporate email?",
    audience: "1,000 IT, consulting and startup employees",
    options: [
      { id: "o1", text: "'As per my previous email...'", rank: 1, points: 40, percentage: 46, aliases: ["as per my previous email", "as per previous email"] },
      { id: "o2", text: "'Just following up on this / Gentle reminder'", rank: 2, points: 30, percentage: 29, aliases: ["gentle reminder", "following up"] },
      { id: "o3", text: "'Hope this email finds you well' (It never does)", rank: 3, points: 20, percentage: 16, aliases: ["hope this finds you well", "finds you well"] },
      { id: "o4", text: "'Looping in my manager for visibility'", rank: 4, points: 10, percentage: 9, aliases: ["looping in manager", "manager visibility", "cc'ing manager"] }
    ]
  },
  {
    id: "c23",
    category: "Work & Corporate Mazdoor",
    question: "We surveyed 1,000 remote workers: What is the real reason your camera stays off during Zoom calls?",
    audience: "1,000 WFH employees",
    options: [
      { id: "o1", text: "Lying in bed in pajamas with messy hair", rank: 1, points: 40, percentage: 56, aliases: ["in bed", "pajamas", "messy hair", "sleeping"] },
      { id: "o2", text: "Eating breakfast / lunch secretly", rank: 2, points: 30, percentage: 23, aliases: ["eating", "food", "lunch", "breakfast"] },
      { id: "o3", text: "Using phone / scrolling Instagram reels", rank: 3, points: 20, percentage: 14, aliases: ["phone", "scrolling", "instagram", "reels"] },
      { id: "o4", text: "'Bandwidth issue' excuse (pure lie)", rank: 4, points: 10, percentage: 7, aliases: ["bandwidth", "poor connection", "wifi slow"] }
    ]
  },

  // --- Weddings & Family Drama ---
  {
    id: "c24",
    category: "Weddings & Family Drama",
    question: "We surveyed 1,000 wedding guests: Why do you really attend distant relatives' weddings?",
    audience: "1,000 Indian wedding attendees",
    options: [
      { id: "o1", text: "Free Unlimited Food & Live Counters", rank: 1, points: 40, percentage: 66, aliases: ["food", "buffet", "live counter", "free food"] },
      { id: "o2", text: "Dressing up in ethnic wear for Instagram photos", rank: 2, points: 30, percentage: 18, aliases: ["instagram", "photos", "ethnic wear", "dressing up"] },
      { id: "o3", text: "Baraat dancing with friends like crazy", rank: 3, points: 20, percentage: 11, aliases: ["baraat", "dance", "dancing", "dj"] },
      { id: "o4", text: "Parents forced me to show face (Attendance)", rank: 4, points: 10, percentage: 5, aliases: ["parents forced", "attendance", "family pressure"] }
    ]
  },
  {
    id: "c25",
    category: "Weddings & Family Drama",
    question: "We surveyed 1,000 wedding attendees: Who is always the most offended person at an Indian wedding?",
    audience: "1,000 shaadi veterans",
    options: [
      { id: "o1", text: "Fufa-ji (The eternal offended uncle)", rank: 1, points: 40, percentage: 58, aliases: ["fufa", "fufaji", "fufa ji"] },
      { id: "o2", text: "Mausa-ji", rank: 2, points: 30, percentage: 22, aliases: ["mausa", "mausaji", "mausa ji"] },
      { id: "o3", text: "Sharma-ji from neighbourhood", rank: 3, points: 20, percentage: 12, aliases: ["neighbour", "sharma ji"] },
      { id: "o4", text: "The groom's distant NRI cousin", rank: 4, points: 10, percentage: 8, aliases: ["nri cousin", "cousin", "nri"] }
    ]
  }
];

const FRIENDS_MODE_QUESTIONS = [
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
    id: "f8",
    category: "Apna Adda Chaos",
    prompt: "Who in this group is most likely to accidentally join a cult or pyramid scheme?",
    followUp: "'Guys, if each of us introduces 3 friends, we get free cruise!'"
  },
  {
    id: "f9",
    category: "Apna Adda Chaos",
    prompt: "Who stalk-researches people on Instagram the most aggressively like an FBI agent?",
    followUp: "Knows who their crush's third cousin followed in 2018."
  },
  {
    id: "f10",
    category: "Apna Adda Chaos",
    prompt: "Who is most likely to forget someone's birthday despite getting 5 reminders?",
    followUp: "'Oh wait, today is the 12th?! Happy birthday yaar!'"
  },
  {
    id: "f11",
    category: "Apna Adda Chaos",
    prompt: "Who is most likely to marry a wealthy NRI and move abroad without warning?",
    followUp: "Sends wedding invites directly from Toronto/London."
  },
  {
    id: "f12",
    category: "Apna Adda Chaos",
    prompt: "Who in this room cannot keep a secret to save their life?",
    followUp: "'I promise I won't tell anyone... (calls best friend 12 seconds later)'"
  },
  {
    id: "f13",
    category: "Apna Adda Chaos",
    prompt: "Who is the most competitive person in this Adda (gets genuinely mad if they lose)?",
    followUp: "Look at their face right now, they're plotting revenge."
  },
  {
    id: "f14",
    category: "Apna Adda Chaos",
    prompt: "Who is most likely to cry during a slightly emotional Bollywood movie?",
    followUp: "Wiping tears during the interval of Kabhi Khushi Kabhie Gham."
  },
  {
    id: "f15",
    category: "Apna Adda Chaos",
    prompt: "Who is most likely to disappear in a crowded mall / market?",
    followUp: "Found 45 minutes later eating pani puri at the opposite gate."
  }
];

/**
 * Validate and import questions from raw JSON or array.
 * Ensures questions conform to Apna Adda "What's the Majority?" schema.
 */
function validateAndImportQuestions(rawInput) {
  let list = rawInput;
  if (typeof rawInput === "string") {
    try {
      list = JSON.parse(rawInput);
    } catch (err) {
      return { valid: false, error: "Invalid JSON format: " + err.message, importedCount: 0 };
    }
  }

  if (!Array.isArray(list)) {
    return { valid: false, error: "Import data must be a JSON array of questions.", importedCount: 0 };
  }

  const validated = [];
  for (let i = 0; i < list.length; i++) {
    const q = list[i];
    if (!q || typeof q !== "object") {
      return { valid: false, error: `Item at index ${i} is not a valid question object.`, importedCount: 0 };
    }

    // Classic Crowd Question validation
    if (q.options && Array.isArray(q.options)) {
      if (!q.question || typeof q.question !== "string" || !q.question.trim()) {
        return { valid: false, error: `Item ${i} is missing 'question' text.`, importedCount: 0 };
      }
      if (q.options.length !== 4) {
        return { valid: false, error: `Item ${i} must have exactly 4 ranked options (has ${q.options.length}).`, importedCount: 0 };
      }
      const ranksSeen = new Set();
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.text || typeof opt.text !== "string") {
          return { valid: false, error: `Item ${i}, Option ${j} is missing 'text'.`, importedCount: 0 };
        }
        const rank = Number(opt.rank);
        if (![1, 2, 3, 4].includes(rank)) {
          return { valid: false, error: `Item ${i}, Option ${j} has invalid rank ${opt.rank}. Must be 1, 2, 3, or 4.`, importedCount: 0 };
        }
        ranksSeen.add(rank);
      }
      if (ranksSeen.size !== 4) {
        return { valid: false, error: `Item ${i} options must contain distinct ranks 1, 2, 3, and 4.`, importedCount: 0 };
      }
      validated.push({
        id: q.id || `custom_${Date.now()}_${i}`,
        category: q.category || "General Adda",
        question: q.question.trim(),
        audience: q.audience || "1,000 Adda members surveyed",
        options: q.options.map(o => ({
          id: o.id || `opt_${o.rank}`,
          text: o.text.trim(),
          rank: Number(o.rank),
          points: Number(o.points) || (o.rank === 1 ? 40 : o.rank === 2 ? 30 : o.rank === 3 ? 20 : 10),
          percentage: Number(o.percentage) || (o.rank === 1 ? 45 : o.rank === 2 ? 30 : o.rank === 3 ? 15 : 10),
          aliases: Array.isArray(o.aliases) ? o.aliases : []
        }))
      });
    } else if (q.prompt && typeof q.prompt === "string") {
      // Friends Mode Question validation
      validated.push({
        id: q.id || `custom_friend_${Date.now()}_${i}`,
        category: q.category || "Apna Adda Chaos",
        prompt: q.prompt.trim(),
        followUp: q.followUp ? String(q.followUp).trim() : ""
      });
    } else {
      return { valid: false, error: `Item ${i} does not conform to Classic Crowd or Friends Mode schema.`, importedCount: 0 };
    }
  }

  return {
    valid: true,
    error: null,
    importedCount: validated.length,
    questions: validated
  };
}

module.exports = {
  CATEGORIES,
  CLASSIC_CROWD_QUESTIONS,
  FRIENDS_MODE_QUESTIONS,
  validateAndImportQuestions
};

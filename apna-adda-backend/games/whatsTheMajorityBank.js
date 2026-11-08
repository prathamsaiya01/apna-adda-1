// apna-adda-backend/games/whatsTheMajorityBank.js

/**
 * Batched Question Bank Architecture for "What's the Majority?"
 * Supports both FIXED_OPTIONS and OPEN_ENDED questions.
 * Divided into batches of 15 questions.
 */

/**
 * Schema Validator for Question Batches
 * Validates batches of 15 questions, checking schema integrity, ranks, points, and unique IDs.
 */
function validateQuestionBatch(batch) {
  if (!batch || typeof batch !== "object") {
    return { valid: false, error: "Batch must be a valid JSON object." };
  }

  if (typeof batch.batchId !== "number" || batch.batchId <= 0) {
    return { valid: false, error: "Batch must contain a positive numeric 'batchId'." };
  }

  if (!Array.isArray(batch.questions)) {
    return { valid: false, error: "Batch 'questions' must be an array." };
  }

  if (batch.questions.length !== 15) {
    return {
      valid: false,
      error: `Batch ${batch.batchId} must contain exactly 15 questions (found ${batch.questions.length}).`
    };
  }

  const seenQuestionIds = new Set();

  for (let i = 0; i < batch.questions.length; i++) {
    const q = batch.questions[i];
    const qIndex = i + 1;

    if (!q.id || typeof q.id !== "string" || !q.id.trim()) {
      return { valid: false, error: `Question ${qIndex} in Batch ${batch.batchId} is missing 'id'.` };
    }

    if (seenQuestionIds.has(q.id)) {
      return { valid: false, error: `Duplicate question id "${q.id}" in Batch ${batch.batchId}.` };
    }
    seenQuestionIds.add(q.id);

    if (!q.question || typeof q.question !== "string" || !q.question.trim()) {
      return { valid: false, error: `Question "${q.id}" is missing 'question' prompt text.` };
    }

    if (!["FIXED_OPTIONS", "OPEN_ENDED"].includes(q.answerFormat)) {
      return {
        valid: false,
        error: `Question "${q.id}" has invalid answerFormat "${q.answerFormat}". Must be FIXED_OPTIONS or OPEN_ENDED.`
      };
    }

    if (!Array.isArray(q.answers) || q.answers.length !== 4) {
      return {
        valid: false,
        error: `Question "${q.id}" must contain exactly 4 answer categories.`
      };
    }

    const seenRanks = new Set();
    for (let j = 0; j < q.answers.length; j++) {
      const ans = q.answers[j];
      const rank = Number(ans.rank);

      if (![1, 2, 3, 4].includes(rank)) {
        return {
          valid: false,
          error: `Question "${q.id}", answer index ${j} has invalid rank ${ans.rank}. Must be 1, 2, 3, or 4.`
        };
      }
      seenRanks.add(rank);

      if (!ans.canonicalAnswer || typeof ans.canonicalAnswer !== "string") {
        return {
          valid: false,
          error: `Question "${q.id}", rank ${rank} is missing 'canonicalAnswer'.`
        };
      }

      if (!Array.isArray(ans.keywords) || ans.keywords.length === 0) {
        return {
          valid: false,
          error: `Question "${q.id}", rank ${rank} must contain at least 1 keyword.`
        };
      }
    }

    if (seenRanks.size !== 4) {
      return {
        valid: false,
        error: `Question "${q.id}" answers must contain distinct ranks 1, 2, 3, and 4.`
      };
    }
  }

  return { valid: true, error: null, batchId: batch.batchId, count: batch.questions.length };
}

// ============================================================================
// BATCH 1: Questions 1–15 (College, Friendship, Habits, Cinema)
// ============================================================================
const BATCH_1 = {
  batchId: 1,
  batchName: "College, Friendship & Daily Habits",
  questions: [
    {
      id: "classic_friendship_001",
      batchId: 1,
      questionNumber: 1,
      question: "What is the biggest red flag in a friendship?",
      category: "Friendship & Social Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 Indian college students aged 16-24",
      answers: [
        {
          id: "ans_f1_1",
          rank: 1,
          canonicalAnswer: "Lying",
          points: 40,
          keywords: ["lying", "lie", "lies", "dishonest", "dishonesty", "being dishonest", "liar"],
          acceptedPhrases: ["they keep lying", "always lying", "telling lies", "speaking lies"]
        },
        {
          id: "ans_f1_2",
          rank: 2,
          canonicalAnswer: "Backstabbing",
          points: 30,
          keywords: ["backstabbing", "backstab", "betrayal", "betray", "bitching", "backbiter"],
          acceptedPhrases: ["talking behind my back", "backstab a friend", "bitching behind back"]
        },
        {
          id: "ans_f1_3",
          rank: 3,
          canonicalAnswer: "Sharing Secrets",
          points: 20,
          keywords: ["sharing secrets", "exposing secrets", "leaking secrets", "spilling tea", "gossiping"],
          acceptedPhrases: ["telling others my secrets", "exposing personal information", "sharing private things"]
        },
        {
          id: "ans_f1_4",
          rank: 4,
          canonicalAnswer: "Being Fake",
          points: 10,
          keywords: ["fake", "fake friend", "two faced", "pretending", "superficial"],
          acceptedPhrases: ["acting fake", "pretending to be a friend", "double face", "two face"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_college_002",
      batchId: 1,
      questionNumber: 2,
      question: "What is the #1 reason students give for bunking an 8:00 AM lecture?",
      category: "College & Student Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 engineering and commerce students",
      answers: [
        {
          id: "ans_col2_1",
          rank: 1,
          canonicalAnswer: "Overslept (Neend nahi khuli)",
          points: 40,
          keywords: ["overslept", "oversleeping", "neend", "sleep", "sleeping", "so gaya", "woke up late", "couldnt wake up"],
          acceptedPhrases: ["neend nahi khuli", "so raha tha", "slept through alarm", "missed alarm"]
        },
        {
          id: "ans_col2_2",
          rank: 2,
          canonicalAnswer: "Safe Attendance (Above 75%)",
          points: 30,
          keywords: ["attendance", "75%", "safe attendance", "attendance full", "attendance quota"],
          acceptedPhrases: ["attendance safe hai", "above 75 percent", "attendance quota is full"]
        },
        {
          id: "ans_col2_3",
          rank: 3,
          canonicalAnswer: "Hangout at Canteen / Chai Tapri",
          points: 20,
          keywords: ["chai", "canteen", "tapri", "sutta", "hangout", "friends", "coffee"],
          acceptedPhrases: ["chai peena tha", "canteen mein baithe the", "hanging out with friends"]
        },
        {
          id: "ans_col2_4",
          rank: 4,
          canonicalAnswer: "Boring Professor",
          points: 10,
          keywords: ["boring", "boring professor", "professor", "teacher", "boring lecture", "useless lecture"],
          acceptedPhrases: ["professor is boring", "teacher is boring", "boring class"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_food_003",
      batchId: 1,
      questionNumber: 3,
      question: "What is India's supreme late-night midnight snack?",
      category: "Food & Late Night",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 midnight snackers and hostelers",
      answers: [
        {
          id: "ans_food3_1",
          rank: 1,
          canonicalAnswer: "Maggi",
          points: 40,
          keywords: ["maggi", "maggie", "noodles", "2 minute noodles", "instant noodles"],
          acceptedPhrases: ["2 minute maggi", "midnight maggi", "bowl of maggi"]
        },
        {
          id: "ans_food3_2",
          rank: 2,
          canonicalAnswer: "Biryani",
          points: 30,
          keywords: ["biryani", "midnight biryani", "swiggy biryani", "zomato biryani", "chicken biryani"],
          acceptedPhrases: ["ordering biryani", "late night biryani", "swiggying biryani"]
        },
        {
          id: "ans_food3_3",
          rank: 3,
          canonicalAnswer: "Leftover Mummy's Food from Fridge",
          points: 20,
          keywords: ["leftovers", "fridge", "mummy", "ghar ka khana", "roti", "sabzi", "leftover food"],
          acceptedPhrases: ["fridge leftovers", "mummy ka khana", "leftover sabzi"]
        },
        {
          id: "ans_food3_4",
          rank: 4,
          canonicalAnswer: "Bread Butter / Toast",
          points: 10,
          keywords: ["bread butter", "toast", "sandwich", "bread jam", "bread"],
          acceptedPhrases: ["bread and butter", "toasted bread", "bread butter sandwich"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_ipl_004",
      batchId: 1,
      questionNumber: 4,
      question: "Which IPL team has the most loyal & passionate fanbase?",
      category: "Cricket & Sports",
      answerFormat: "FIXED_OPTIONS",
      audienceProfile: "1,000 active Indian cricket followers",
      answers: [
        {
          id: "ans_ipl4_1",
          rank: 1,
          canonicalAnswer: "Royal Challengers Bengaluru (RCB)",
          points: 40,
          keywords: ["rcb", "bengaluru", "royal challengers", "bangalore"],
          acceptedPhrases: ["royal challengers bangalore", "rcb fans", "ee sala cup namde"]
        },
        {
          id: "ans_ipl4_2",
          rank: 2,
          canonicalAnswer: "Chennai Super Kings (CSK)",
          points: 30,
          keywords: ["csk", "chennai", "super kings", "whistle podu"],
          acceptedPhrases: ["chennai super kings", "csk whistle podu", "dhoni army"]
        },
        {
          id: "ans_ipl4_3",
          rank: 3,
          canonicalAnswer: "Mumbai Indians (MI)",
          points: 20,
          keywords: ["mi", "mumbai", "mumbai indians", "paltan"],
          acceptedPhrases: ["mumbai indians", "mi paltan", "mumbai army"]
        },
        {
          id: "ans_ipl4_4",
          rank: 4,
          canonicalAnswer: "Kolkata Knight Riders (KKR)",
          points: 10,
          keywords: ["kkr", "kolkata", "knight riders", "korbo lorbo"],
          acceptedPhrases: ["kolkata knight riders", "kkr army"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_desi_005",
      batchId: 1,
      questionNumber: 5,
      question: "What free item do Indians always demand from the sabzi-wala?",
      category: "Daily Desi Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 vegetable market shoppers across India",
      answers: [
        {
          id: "ans_desi5_1",
          rank: 1,
          canonicalAnswer: "Dhaniya & Mirchi",
          points: 40,
          keywords: ["dhaniya", "mirchi", "coriander", "green chilli", "chilies", "chilli", "mirch"],
          acceptedPhrases: ["free dhaniya mirchi", "dhaniya aur mirchi", "extra mirchi"]
        },
        {
          id: "ans_desi5_2",
          rank: 2,
          canonicalAnswer: "Extra Nimbu (Lemon)",
          points: 30,
          keywords: ["nimbu", "lemon", "lemons", "limbu"],
          acceptedPhrases: ["ek nimbu daal do", "extra lemon", "free nimbu"]
        },
        {
          id: "ans_desi5_3",
          rank: 3,
          canonicalAnswer: "Kadi Patta (Curry Leaves)",
          points: 20,
          keywords: ["kadi patta", "curry leaves", "curry leaf", "patta", "meetha neem"],
          acceptedPhrases: ["thoda kadi patta", "free curry leaves"]
        },
        {
          id: "ans_desi5_4",
          rank: 4,
          canonicalAnswer: "Extra Plastic Bag (Theli)",
          points: 10,
          keywords: ["theli", "plastic bag", "bag", "carry bag", "cover"],
          acceptedPhrases: ["ek aur theli do", "extra carry bag", "double theli"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_travel_006",
      batchId: 1,
      questionNumber: 6,
      question: "What is the most popular berth to fight for on Indian Railways trains?",
      category: "Travel & Train Journeys",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 IRCTC train travelers",
      answers: [
        {
          id: "ans_tr6_1",
          rank: 1,
          canonicalAnswer: "Side Lower (SL)",
          points: 40,
          keywords: ["side lower", "sl", "window seat", "lower window", "side window"],
          acceptedPhrases: ["side lower berth", "side lower seat", "window side lower"]
        },
        {
          id: "ans_tr6_2",
          rank: 2,
          canonicalAnswer: "Upper Berth",
          points: 30,
          keywords: ["upper", "upper berth", "top berth", "top seat", "ub"],
          acceptedPhrases: ["upper berth seat", "peaceful upper berth", "top berth"]
        },
        {
          id: "ans_tr6_3",
          rank: 3,
          canonicalAnswer: "Side Upper (SU)",
          points: 20,
          keywords: ["side upper", "su", "side top"],
          acceptedPhrases: ["side upper berth", "side upper seat"]
        },
        {
          id: "ans_tr6_4",
          rank: 4,
          canonicalAnswer: "Middle Berth",
          points: 10,
          keywords: ["middle", "middle berth", "mb", "center berth"],
          acceptedPhrases: ["middle berth seat", "folded middle berth"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_street_007",
      batchId: 1,
      questionNumber: 7,
      question: "Which Indian street snack reigns supreme as #1 across the nation?",
      category: "Indian Street Food",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 street food enthusiasts in metros and tier-2 cities",
      answers: [
        {
          id: "ans_st7_1",
          rank: 1,
          canonicalAnswer: "Pani Puri / Golgappa",
          points: 40,
          keywords: ["pani puri", "golgappa", "gol gappa", "puchka", "batashe", "gupchup", "pani patasha"],
          acceptedPhrases: ["teekha pani puri", "pani puri golgappa", "puchka water"]
        },
        {
          id: "ans_st7_2",
          rank: 2,
          canonicalAnswer: "Samosa",
          points: 30,
          keywords: ["samosa", "samosas", "singhara", "aloo samosa"],
          acceptedPhrases: ["garam samosa", "chai samosa", "crispy samosa"]
        },
        {
          id: "ans_st7_3",
          rank: 3,
          canonicalAnswer: "Vada Pav",
          points: 20,
          keywords: ["vada pav", "wada pav", "batata vada", "vada pao"],
          acceptedPhrases: ["mumbai vada pav", "garam vada pav"]
        },
        {
          id: "ans_st7_4",
          rank: 4,
          canonicalAnswer: "Pav Bhaji",
          points: 10,
          keywords: ["pav bhaji", "paav bhaji", "bhaji pav", "butter pav bhaji"],
          acceptedPhrases: ["amul butter pav bhaji", "hot pav bhaji"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_corporate_008",
      batchId: 1,
      questionNumber: 8,
      question: "What is the most passive-aggressive phrase used in corporate work emails?",
      category: "Work & Corporate Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 Indian corporate, tech and consulting employees",
      answers: [
        {
          id: "ans_corp8_1",
          rank: 1,
          canonicalAnswer: "As per my previous email",
          points: 40,
          keywords: ["previous email", "as per previous", "as stated earlier", "as discussed earlier", "per my email"],
          acceptedPhrases: ["as per my previous email", "as per my last email", "referring to my previous email"]
        },
        {
          id: "ans_corp8_2",
          rank: 2,
          canonicalAnswer: "Gentle reminder / Following up",
          points: 30,
          keywords: ["gentle reminder", "following up", "reminder", "just following up", "bumping this"],
          acceptedPhrases: ["just a gentle reminder", "following up on this thread", "bumping to top of inbox"]
        },
        {
          id: "ans_corp8_3",
          rank: 3,
          canonicalAnswer: "Hope this email finds you well",
          points: 20,
          keywords: ["finds you well", "hope this email finds you well", "hope you are well"],
          acceptedPhrases: ["hope this finds you well", "hope all is well"]
        },
        {
          id: "ans_corp8_4",
          rank: 4,
          canonicalAnswer: "Looping in my manager for visibility",
          points: 10,
          keywords: ["looping", "cc'ing manager", "manager", "visibility", "adding manager"],
          acceptedPhrases: ["looping in my manager", "ccing manager for visibility", "adding manager for visibility"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_whatsapp_009",
      batchId: 1,
      questionNumber: 9,
      question: "What is the most universally annoying thing received on WhatsApp?",
      category: "Social Media & Messaging",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 daily smartphone users in India",
      answers: [
        {
          id: "ans_wa9_1",
          rank: 1,
          canonicalAnswer: "Good Morning Images with Roses & Suvichar",
          points: 40,
          keywords: ["good morning", "suvichar", "roses", "flowers", "morning images", "good morning gif"],
          acceptedPhrases: ["glittering good morning image", "family group good morning", "rose flower good morning"]
        },
        {
          id: "ans_wa9_2",
          rank: 2,
          canonicalAnswer: "Fake Forwarded Rumors",
          points: 30,
          keywords: ["fake news", "forward to 10", "rumors", "whatsapp university", "fake forwards", "forwards"],
          acceptedPhrases: ["fake whatsapp forwards", "forward to 10 people or bad luck", "whatsapp university rumors"]
        },
        {
          id: "ans_wa9_3",
          rank: 3,
          canonicalAnswer: "Unprompted Long Voice Notes",
          points: 20,
          keywords: ["voice note", "audio message", "voice memo", "long audio", "voice message"],
          acceptedPhrases: ["4 minute voice note", "long unprompted voice note", "listening to voice notes"]
        },
        {
          id: "ans_wa9_4",
          rank: 4,
          canonicalAnswer: "Added to Random Groups Without Permission",
          points: 10,
          keywords: ["random group", "added to group", "group invite", "unwanted group"],
          acceptedPhrases: ["added to family group", "added to random wedding group"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_shaadi_010",
      batchId: 1,
      questionNumber: 10,
      question: "Why do young Indians really attend distant relatives' weddings?",
      category: "Weddings & Family Drama",
      answerFormat: "FIXED_OPTIONS",
      audienceProfile: "1,000 Indian wedding guests",
      answers: [
        {
          id: "ans_sh10_1",
          rank: 1,
          canonicalAnswer: "Free Unlimited Food & Live Counters",
          points: 40,
          keywords: ["food", "buffet", "live counter", "unlimited food", "chaat", "dessert"],
          acceptedPhrases: ["shaadi ka khana", "free wedding food", "buffet and live counter"]
        },
        {
          id: "ans_sh10_2",
          rank: 2,
          canonicalAnswer: "Dressing Up for Instagram Photos",
          points: 30,
          keywords: ["photos", "instagram", "ethnic wear", "dressing up", "lehenga", "sherwani"],
          acceptedPhrases: ["photos for instagram", "wearing ethnic clothes", "wedding photoshoot"]
        },
        {
          id: "ans_sh10_3",
          rank: 3,
          canonicalAnswer: "Baraat Dancing with Friends",
          points: 20,
          keywords: ["baraat", "dancing", "dance", "dj", "naagin dance"],
          acceptedPhrases: ["dancing in baraat", "naagin dance with friends", "dj floor dancing"]
        },
        {
          id: "ans_sh10_4",
          rank: 4,
          canonicalAnswer: "Parents Forced Me (Attendance)",
          points: 10,
          keywords: ["parents", "forced", "family pressure", "attendance", "mom said so"],
          acceptedPhrases: ["parents forced attendance", "mummy papa bole jaana padega"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_chai_011",
      batchId: 1,
      questionNumber: 11,
      question: "What is the best biscuit to dip into hot cutting chai?",
      category: "Indian Street Food & Chai",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 daily tea tapri regulars across India",
      answers: [
        {
          id: "ans_chai11_1",
          rank: 1,
          canonicalAnswer: "Parle-G",
          points: 40,
          keywords: ["parle g", "parleg", "parle-g", "g mane genius"],
          acceptedPhrases: ["parle g biscuit", "dipping parle g in chai"]
        },
        {
          id: "ans_chai11_2",
          rank: 2,
          canonicalAnswer: "Rusk / Toast",
          points: 30,
          keywords: ["rusk", "toast", "rusks", "crispy toast"],
          acceptedPhrases: ["chai rusk", "cutting chai with toast"]
        },
        {
          id: "ans_chai11_3",
          rank: 3,
          canonicalAnswer: "Bourbon",
          points: 20,
          keywords: ["bourbon", "chocolate bourbon", "cream biscuit"],
          acceptedPhrases: ["bourbon biscuit", "chocolate cream bourbon"]
        },
        {
          id: "ans_chai11_4",
          rank: 4,
          canonicalAnswer: "Good Day",
          points: 10,
          keywords: ["good day", "goodday", "butter biscuit", "cashew biscuit"],
          acceptedPhrases: ["good day butter", "good day cashew"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_trip_012",
      batchId: 1,
      questionNumber: 12,
      question: "What is the dream destination friends always plan in group chats but never visit?",
      category: "Travel & Vacation",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 college squads and vacation planners",
      answers: [
        {
          id: "ans_tr12_1",
          rank: 1,
          canonicalAnswer: "Goa",
          points: 40,
          keywords: ["goa", "goa trip", "baga", "calangute"],
          acceptedPhrases: ["cancelled goa plan", "goa trip with friends", "dil chahta hai goa"]
        },
        {
          id: "ans_tr12_2",
          rank: 2,
          canonicalAnswer: "Ladakh / Leh",
          points: 30,
          keywords: ["ladakh", "leh", "leh ladakh", "bike trip", "pangong"],
          acceptedPhrases: ["ladakh bike trip", "leh ladakh plan"]
        },
        {
          id: "ans_tr12_3",
          rank: 3,
          canonicalAnswer: "Manali / Kasol",
          points: 20,
          keywords: ["manali", "kasol", "himachal", "tosh", "parvati valley"],
          acceptedPhrases: ["kasol trip", "himachal manali trip"]
        },
        {
          id: "ans_tr12_4",
          rank: 4,
          canonicalAnswer: "Rishikesh",
          points: 10,
          keywords: ["rishikesh", "rafting", "river rafting", "bungee jumping"],
          acceptedPhrases: ["rishikesh river rafting", "camping in rishikesh"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_dating_013",
      batchId: 1,
      questionNumber: 13,
      question: "What is the biggest red flag on an Indian dating app profile?",
      category: "Social Media & Dating",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 Gen Z and millennial dating app users in Indian metros",
      answers: [
        {
          id: "ans_dat13_1",
          rank: 1,
          canonicalAnswer: "Fluent in Sarcasm / Sapiosexual Bio",
          points: 40,
          keywords: ["sarcasm", "sapiosexual", "fluent in sarcasm", "cringe bio", "wanderlust"],
          acceptedPhrases: ["writing fluent in sarcasm", "calling themselves sapiosexual", "cliche bio"]
        },
        {
          id: "ans_dat13_2",
          rank: 2,
          canonicalAnswer: "Gym Mirror Selfie Covering Face with iPhone",
          points: 30,
          keywords: ["gym selfie", "mirror selfie", "iphone covering face", "gym photo", "abs photo"],
          acceptedPhrases: ["covering face with phone", "gym mirror selfie", "shirtless mirror selfie"]
        },
        {
          id: "ans_dat13_3",
          rank: 3,
          canonicalAnswer: "Instagram Handle in First Line",
          points: 20,
          keywords: ["insta handle", "instagram handle", "ig", "follow me", "follower farming"],
          acceptedPhrases: ["putting ig handle directly in bio", "begging for followers", "hit me up on insta"]
        },
        {
          id: "ans_dat13_4",
          rank: 4,
          canonicalAnswer: "Only Group Photos",
          points: 10,
          keywords: ["group photos", "group pic", "which one are you", "squad photos"],
          acceptedPhrases: ["all pictures are group photos", "cant tell who the person is"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_exam_014",
      batchId: 1,
      questionNumber: 14,
      question: "When do Indian university students actually start studying for semester exams?",
      category: "College & Student Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 college and university students",
      answers: [
        {
          id: "ans_ex14_1",
          rank: 1,
          canonicalAnswer: "Night Before the Exam at 11 PM",
          points: 40,
          keywords: ["night before", "one night before", "last night", "11 pm", "overnight", "one night stand with books"],
          acceptedPhrases: ["one night before exam", "kal exam hai aaj raat", "studying at 11pm before exam"]
        },
        {
          id: "ans_ex14_2",
          rank: 2,
          canonicalAnswer: "2 to 3 Days Before Exam",
          points: 30,
          keywords: ["2 days before", "3 days before", "few days before", "prep leave", "study break"],
          acceptedPhrases: ["during prep leave", "2 3 days before exam"]
        },
        {
          id: "ans_ex14_3",
          rank: 3,
          canonicalAnswer: "Outside Exam Hall in the Morning",
          points: 20,
          keywords: ["exam morning", "outside hall", "exam hall", "morning before", "last 30 minutes"],
          acceptedPhrases: ["standing outside exam hall", "reading notes outside exam hall"]
        },
        {
          id: "ans_ex14_4",
          rank: 4,
          canonicalAnswer: "From Day 1 of Semester",
          points: 10,
          keywords: ["day 1", "first day", "regularly", "nerds", "from beginning", "start of semester"],
          acceptedPhrases: ["studying from day 1", "regular daily studying", "toppers from day 1"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_house_015",
      batchId: 1,
      questionNumber: 15,
      question: "What is stored inside the Royal Dansk Danish Butter Cookie tin in Indian homes?",
      category: "Daily Desi Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 Indian households",
      answers: [
        {
          id: "ans_tin15_1",
          rank: 1,
          canonicalAnswer: "Sewing Kit (Sui-Dhaaga)",
          points: 40,
          keywords: ["sewing kit", "sui dhaaga", "sui dhaga", "threads", "needles", "buttons", "tailoring"],
          acceptedPhrases: ["sui and dhaaga", "sewing thread and needles", "mummy's sewing kit"]
        },
        {
          id: "ans_tin15_2",
          rank: 2,
          canonicalAnswer: "Old Medicine Strips & Band-aids",
          points: 30,
          keywords: ["medicines", "dawa", "tablets", "band aids", "first aid", "strips", "ointment"],
          acceptedPhrases: ["old medicine tablets", "first aid band aids", "dawa ki goliya"]
        },
        {
          id: "ans_tin15_3",
          rank: 3,
          canonicalAnswer: "Foreign Coins & Old Currency Notes",
          points: 20,
          keywords: ["coins", "foreign currency", "sikke", "old notes", "change", "currency"],
          acceptedPhrases: ["old coins and notes", "foreign coins collection", "purane sikke"]
        },
        {
          id: "ans_tin15_4",
          rank: 4,
          canonicalAnswer: "Actual Butter Cookies",
          points: 10,
          keywords: ["cookies", "butter cookies", "actual cookies", "real biscuits", "biscuits"],
          acceptedPhrases: ["actual butter cookies", "real danish cookies", "actual biscuits"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    }
  ]
};

// ============================================================================
// BATCH 2: Questions 16–30 (Bollywood, Food, Travel, Work, Pop Culture)
// ============================================================================
const BATCH_2 = {
  batchId: 2,
  batchName: "Bollywood, Food Cravings & Pop Culture",
  questions: [
    {
      id: "classic_bollywood_016",
      batchId: 2,
      questionNumber: 16,
      question: "Who is the undisputed Badshah / King of Bollywood?",
      category: "Bollywood & Cinema",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 Indian cinephiles across Mumbai, Delhi & Bangalore",
      answers: [
        {
          id: "ans_b16_1",
          rank: 1,
          canonicalAnswer: "Shah Rukh Khan (SRK)",
          points: 40,
          keywords: ["srk", "shah rukh", "shahrukh", "shah rukh khan", "badshah", "king khan"],
          acceptedPhrases: ["king khan srk", "shah rukh khan badshah"]
        },
        {
          id: "ans_b16_2",
          rank: 2,
          canonicalAnswer: "Amitabh Bachchan",
          points: 30,
          keywords: ["amitabh", "bachchan", "big b", "shehenshah", "angry young man"],
          acceptedPhrases: ["amitabh bachchan big b", "legend amitabh bachchan"]
        },
        {
          id: "ans_b16_3",
          rank: 3,
          canonicalAnswer: "Salman Khan",
          points: 20,
          keywords: ["salman", "bhai", "sallu", "salman khan", "bhaijaan"],
          acceptedPhrases: ["salman khan bhai", "bhaijaan sallu"]
        },
        {
          id: "ans_b16_4",
          rank: 4,
          canonicalAnswer: "Aamir Khan",
          points: 10,
          keywords: ["aamir", "aamir khan", "perfectionist", "mr perfectionist"],
          acceptedPhrases: ["mr perfectionist aamir", "aamir khan dangal"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_biryani_017",
      batchId: 2,
      questionNumber: 17,
      question: "Which Indian city serves the absolute best Biryani?",
      category: "Food & Cuisine",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 biryani connoisseurs across India",
      answers: [
        {
          id: "ans_bir17_1",
          rank: 1,
          canonicalAnswer: "Hyderabad",
          points: 40,
          keywords: ["hyderabad", "hyderabadi", "dum biryani", "paradise"],
          acceptedPhrases: ["hyderabadi dum biryani", "hyderabad biryani"]
        },
        {
          id: "ans_bir17_2",
          rank: 2,
          canonicalAnswer: "Lucknow",
          points: 30,
          keywords: ["lucknow", "lucknowi", "awadh", "awadhi", "nawabi"],
          acceptedPhrases: ["lucknowi biryani", "awadhi dum pukht"]
        },
        {
          id: "ans_bir17_3",
          rank: 3,
          canonicalAnswer: "Kolkata",
          points: 20,
          keywords: ["kolkata", "calcutta", "potato biryani", "aloo biryani", "bengali"],
          acceptedPhrases: ["kolkata biryani with aloo", "calcutta biryani"]
        },
        {
          id: "ans_bir17_4",
          rank: 4,
          canonicalAnswer: "Delhi",
          points: 10,
          keywords: ["delhi", "dilli", "moradabad", "jama masjid", "purani dilli"],
          acceptedPhrases: ["purani dilli biryani", "moradabadi biryani"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_music_018",
      batchId: 2,
      questionNumber: 18,
      question: "Who is India's most beloved playback singer of the modern era?",
      category: "Music & Artists",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 Spotify & YouTube Music listeners in India",
      answers: [
        {
          id: "ans_mus18_1",
          rank: 1,
          canonicalAnswer: "Arijit Singh",
          points: 40,
          keywords: ["arijit", "arijit singh", "arijeet"],
          acceptedPhrases: ["arijit singh romantic songs", "the goat arijit singh"]
        },
        {
          id: "ans_mus18_2",
          rank: 2,
          canonicalAnswer: "Sonu Nigam",
          points: 30,
          keywords: ["sonu", "sonu nigam", "sonu ji"],
          acceptedPhrases: ["legend sonu nigam", "sonu nigam kal ho naa ho"]
        },
        {
          id: "ans_mus18_3",
          rank: 3,
          canonicalAnswer: "KK (Krishnakumar Kunnath)",
          points: 20,
          keywords: ["kk", "krishnakumar kunnath", "kay kay"],
          acceptedPhrases: ["kk yaaron", "legendary singer kk"]
        },
        {
          id: "ans_mus18_4",
          rank: 4,
          canonicalAnswer: "Shreya Ghoshal",
          points: 10,
          keywords: ["shreya", "shreya ghoshal", "ghoshal"],
          acceptedPhrases: ["melody queen shreya ghoshal", "shreya ghoshal voice"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_dialogue_019",
      batchId: 2,
      questionNumber: 19,
      question: "Which Bollywood movie dialogue is quoted the most in daily conversations?",
      category: "Bollywood & Cinema",
      answerFormat: "FIXED_OPTIONS",
      audienceProfile: "1,000 college students and Hindi cinema fans",
      answers: [
        {
          id: "ans_dia19_1",
          rank: 1,
          canonicalAnswer: "Mogambo Khush Hua",
          points: 40,
          keywords: ["mogambo", "mogambo khush hua", "mr india"],
          acceptedPhrases: ["mogambo khush hua dialogue", "amrish puri mogambo"]
        },
        {
          id: "ans_dia19_2",
          rank: 2,
          canonicalAnswer: "Kitne Aadmi The?",
          points: 30,
          keywords: ["kitne aadmi the", "sholay", "gabbar", "kitne aadmi"],
          acceptedPhrases: ["gabbar kitne aadmi the", "sholay dialogue"]
        },
        {
          id: "ans_dia19_3",
          rank: 3,
          canonicalAnswer: "Bade bade deshon mein aisi chhoti chhoti baatein...",
          points: 20,
          keywords: ["ddlj", "senorita", "bade bade deshon mein", "chhoti chhoti baatein"],
          acceptedPhrases: ["bade bade deshon mein senorita", "ddlj dialogue"]
        },
        {
          id: "ans_dia19_4",
          rank: 4,
          canonicalAnswer: "Picture abhi baaki hai mere dost",
          points: 10,
          keywords: ["picture abhi baaki hai", "om shanti om", "mere dost"],
          acceptedPhrases: ["picture abhi baaki hai dialogue"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_chore_020",
      batchId: 2,
      questionNumber: 20,
      question: "What is the most universally hated household chore in Indian homes?",
      category: "Daily Desi Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 young adults and homeowners",
      answers: [
        {
          id: "ans_ch20_1",
          rank: 1,
          canonicalAnswer: "Bartan Dhona (Washing Dishes)",
          points: 40,
          keywords: ["bartan", "dishes", "washing dishes", "bartan dhona", "doing dishes", "sink"],
          acceptedPhrases: ["washing bartan", "doing the dishes", "bartan manjhna"]
        },
        {
          id: "ans_ch20_2",
          rank: 2,
          canonicalAnswer: "Jhaadu Pochha (Sweeping & Mopping)",
          points: 30,
          keywords: ["pochha", "jhaadu", "mopping", "sweeping", "jhaadu pochha", "cleaning floor"],
          acceptedPhrases: ["jhaadu and pochha", "mopping the floor", "doing jhaadu"]
        },
        {
          id: "ans_ch20_3",
          rank: 3,
          canonicalAnswer: "Folding Clothes & Ironing",
          points: 20,
          keywords: ["folding clothes", "kapde fold karna", "ironing", "clothes", "laundry fold"],
          acceptedPhrases: ["folding dried clothes", "ironing shirts", "kapde fold"]
        },
        {
          id: "ans_ch20_4",
          rank: 4,
          canonicalAnswer: "Chopping Vegetables (Sabzi Kaatna)",
          points: 10,
          keywords: ["chopping", "sabzi kaatna", "onions", "cutting vegetables", "peeling garlic"],
          acceptedPhrases: ["chopping onions and crying", "cutting sabzi", "peeling garlic cloves"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_captain_021",
      batchId: 2,
      questionNumber: 21,
      question: "Who is celebrated as India's greatest cricket captain of all time?",
      category: "Cricket & Sports",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 Indian sports fans",
      answers: [
        {
          id: "ans_cap21_1",
          rank: 1,
          canonicalAnswer: "MS Dhoni (Captain Cool)",
          points: 40,
          keywords: ["dhoni", "msd", "ms dhoni", "mahi", "captain cool", "thala"],
          acceptedPhrases: ["mahendra singh dhoni", "captain cool msd", "thala for a reason"]
        },
        {
          id: "ans_cap21_2",
          rank: 2,
          canonicalAnswer: "Rohit Sharma (Hitman)",
          points: 30,
          keywords: ["rohit", "rohit sharma", "hitman", "rohit captain"],
          acceptedPhrases: ["hitman rohit sharma", "rohit sharma t20 captain"]
        },
        {
          id: "ans_cap21_3",
          rank: 3,
          canonicalAnswer: "Sourav Ganguly (Dada)",
          points: 20,
          keywords: ["ganguly", "dada", "sourav", "sourav ganguly", "prince of kolkata"],
          acceptedPhrases: ["dada sourav ganguly", "captain ganguly lord's"]
        },
        {
          id: "ans_cap21_4",
          rank: 4,
          canonicalAnswer: "Kapil Dev",
          points: 10,
          keywords: ["kapil", "kapil dev", "kapil paaji", "1983 captain"],
          acceptedPhrases: ["kapil dev 1983", "world cup winner kapil dev"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_breakheart_022",
      batchId: 2,
      questionNumber: 22,
      question: "What is the most heartbreaking cricket moment in Indian cricket history?",
      category: "Cricket & Sports",
      answerFormat: "FIXED_OPTIONS",
      audienceProfile: "1,000 Indian cricket spectators",
      answers: [
        {
          id: "ans_bh22_1",
          rank: 1,
          canonicalAnswer: "19th Nov 2023 World Cup Final (vs Australia)",
          points: 40,
          keywords: ["19 nov", "2023 final", "world cup final 2023", "ahmedabad", "cummins"],
          acceptedPhrases: ["19 november 2023", "world cup 2023 defeat to australia"]
        },
        {
          id: "ans_bh22_2",
          rank: 2,
          canonicalAnswer: "Dhoni's Run Out vs NZ (2019 Semi-Final)",
          points: 30,
          keywords: ["dhoni run out", "2019 semi final", "guptill throw", "2019 world cup"],
          acceptedPhrases: ["guptill direct hit dhoni", "dhoni crying walking off 2019"]
        },
        {
          id: "ans_bh22_3",
          rank: 3,
          canonicalAnswer: "2003 World Cup Final vs Australia",
          points: 20,
          keywords: ["2003 final", "ponting spring bat", "2003 world cup", "johannesburg"],
          acceptedPhrases: ["2003 final loss to australia", "ricky ponting 140"]
        },
        {
          id: "ans_bh22_4",
          rank: 4,
          canonicalAnswer: "Champions Trophy 2017 Final vs Pakistan",
          points: 10,
          keywords: ["champions trophy 2017", "2017 final", "pakistan 2017", "fakhar zaman"],
          acceptedPhrases: ["2017 oval final against pakistan"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_borrow_023",
      batchId: 2,
      questionNumber: 23,
      question: "What is the most borrowed item in college hostels that is never returned?",
      category: "College & Hostel Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 hostel and PG residents",
      answers: [
        {
          id: "ans_bor23_1",
          rank: 1,
          canonicalAnswer: "Phone Charger / Cable",
          points: 40,
          keywords: ["charger", "phone charger", "cable", "type c", "iphone charger", "charging cable"],
          acceptedPhrases: ["phone charging cable", "type c charger", "fast charger"]
        },
        {
          id: "ans_bor23_2",
          rank: 2,
          canonicalAnswer: "₹50 - ₹200 UPI / Cash",
          points: 30,
          keywords: ["money", "cash", "upi", "50 rs", "100 rs", "gpay", "phonepe", "udhaar"],
          acceptedPhrases: ["100 rupay udhaar", "upi transfer", "small cash borrow"]
        },
        {
          id: "ans_bor23_3",
          rank: 3,
          canonicalAnswer: "T-shirt / Hoodie / Clothes",
          points: 20,
          keywords: ["tshirt", "hoodie", "clothes", "shirt", "jacket", "kapde"],
          acceptedPhrases: ["borrowed hoodie", "oversized tshirt", "party clothes"]
        },
        {
          id: "ans_bor23_4",
          rank: 4,
          canonicalAnswer: "Electric Kettle / Maggi Bowl",
          points: 10,
          keywords: ["kettle", "electric kettle", "maggi bowl", "bowl", "plate", "spoon"],
          acceptedPhrases: ["electric kettle for maggi", "eating bowl and spoon"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_friendfilm_024",
      batchId: 2,
      questionNumber: 24,
      question: "What is the most iconic Bollywood friendship film of all time?",
      category: "Bollywood & Cinema",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 Hindi film buffs",
      answers: [
        {
          id: "ans_ff24_1",
          rank: 1,
          canonicalAnswer: "3 Idiots",
          points: 40,
          keywords: ["3 idiots", "three idiots", "rancho", "raju farhan rancho", "all is well"],
          acceptedPhrases: ["aamir khan 3 idiots", "three idiots movie"]
        },
        {
          id: "ans_ff24_2",
          rank: 2,
          canonicalAnswer: "Yeh Jawaani Hai Deewani (YJHD)",
          points: 30,
          keywords: ["yjhd", "yeh jawaani hai deewani", "bunny", "kabir naina", "ranbir"],
          acceptedPhrases: ["yeh jawaani hai deewani yjhd", "bunny naina friendship"]
        },
        {
          id: "ans_ff24_3",
          rank: 3,
          canonicalAnswer: "Sholay (Jai & Veeru)",
          points: 20,
          keywords: ["sholay", "jai veeru", "yeh dosti hum nahi todenge"],
          acceptedPhrases: ["jai veeru sholay", "sholay dosti"]
        },
        {
          id: "ans_ff24_4",
          rank: 4,
          canonicalAnswer: "Dil Chahta Hai",
          points: 10,
          keywords: ["dil chahta hai", "dch", "akshaye khanna", "sid aakash sameer"],
          acceptedPhrases: ["dil chahta hai goa trip", "farhan akhtar dil chahta hai"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_shaadioffend_025",
      batchId: 2,
      questionNumber: 25,
      question: "Who is always the most offended person at an Indian wedding?",
      category: "Weddings & Family Drama",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 shaadi attendees",
      answers: [
        {
          id: "ans_so25_1",
          rank: 1,
          canonicalAnswer: "Fufa-ji (Fufaji)",
          points: 40,
          keywords: ["fufa", "fufaji", "fufa ji", "phupha", "phuphaji"],
          acceptedPhrases: ["angry fufaji", "naraaz fufa ji", "fufaji sitting in corner"]
        },
        {
          id: "ans_so25_2",
          rank: 2,
          canonicalAnswer: "Mausa-ji (Mausaji)",
          points: 30,
          keywords: ["mausa", "mausaji", "mausa ji"],
          acceptedPhrases: ["offended mausaji", "mausa ji complaining"]
        },
        {
          id: "ans_so25_3",
          rank: 3,
          canonicalAnswer: "Sharma-ji (Neighbour)",
          points: 20,
          keywords: ["sharma ji", "sharmaji", "neighbour", "moholla uncle"],
          acceptedPhrases: ["colony sharma ji", "nosy neighbour uncle"]
        },
        {
          id: "ans_so25_4",
          rank: 4,
          canonicalAnswer: "NRI Cousin",
          points: 10,
          keywords: ["nri", "nri cousin", "foreign relative", "accent cousin"],
          acceptedPhrases: ["nri cousin complaining about pollution", "us returned cousin"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_wfh_026",
      batchId: 2,
      questionNumber: 26,
      question: "What is the real reason your video camera stays off during Zoom / Teams meetings?",
      category: "Work & Corporate Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 WFH remote employees",
      answers: [
        {
          id: "ans_wfh26_1",
          rank: 1,
          canonicalAnswer: "In Bed / Pajamas / Messy Hair",
          points: 40,
          keywords: ["bed", "pajamas", "pyjamas", "messy hair", "sleeping", "uncombed", "lying down"],
          acceptedPhrases: ["lying in bed with pajamas", "hair is messy", "still in night clothes"]
        },
        {
          id: "ans_wfh26_2",
          rank: 2,
          canonicalAnswer: "Secretly Eating Food",
          points: 30,
          keywords: ["eating", "food", "lunch", "breakfast", "chewing", "snacking"],
          acceptedPhrases: ["eating lunch during meeting", "snacking secretly", "chewing food"]
        },
        {
          id: "ans_wfh26_3",
          rank: 3,
          canonicalAnswer: "Scrolling Instagram Reels on Phone",
          points: 20,
          keywords: ["reels", "instagram", "phone", "scrolling", "social media", "multitasking"],
          acceptedPhrases: ["watching reels on phone", "scrolling instagram secretly"]
        },
        {
          id: "ans_wfh26_4",
          rank: 4,
          canonicalAnswer: "Faking 'Poor Bandwidth / WiFi'",
          points: 10,
          keywords: ["bandwidth", "wifi", "network", "poor connection", "lag"],
          acceptedPhrases: ["excuse of poor wifi", "saying network is bad"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_streetbev_027",
      batchId: 2,
      questionNumber: 27,
      question: "What is India's favorite non-alcoholic beverage on a hot summer afternoon?",
      category: "Indian Street Food & Chai",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 beverage drinkers across India",
      answers: [
        {
          id: "ans_bev27_1",
          rank: 1,
          canonicalAnswer: "Ganne ka Juice (Sugarcane Juice)",
          points: 40,
          keywords: ["ganne ka juice", "sugarcane", "sugarcane juice", "ganna juice", "ganna"],
          acceptedPhrases: ["chilled ganne ka juice", "fresh sugarcane juice with ginger"]
        },
        {
          id: "ans_bev27_2",
          rank: 2,
          canonicalAnswer: "Mango Lassi / Sweet Lassi",
          points: 30,
          keywords: ["lassi", "sweet lassi", "mango lassi", "chaas", "buttermilk"],
          acceptedPhrases: ["punjabi sweet lassi", "thick mango lassi"]
        },
        {
          id: "ans_bev27_3",
          rank: 3,
          canonicalAnswer: "Nimbu Pani / Shikanji",
          points: 20,
          keywords: ["nimbu pani", "shikanji", "lemonade", "nimbu soda", "fresh lime soda"],
          acceptedPhrases: ["chilled shikanji", "sweet and salty nimbu pani"]
        },
        {
          id: "ans_bev27_4",
          rank: 4,
          canonicalAnswer: "Nariyal Pani (Coconut Water)",
          points: 10,
          keywords: ["nariyal pani", "coconut water", "tender coconut", "daab"],
          acceptedPhrases: ["fresh tender coconut water", "green nariyal pani"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_lateexcuse_028",
      batchId: 2,
      questionNumber: 28,
      question: "What is the most common lie told when arriving 30 minutes late to meet friends?",
      category: "Friendship & Social Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 latecomers and waiting friends",
      answers: [
        {
          id: "ans_late28_1",
          rank: 1,
          canonicalAnswer: "Traffic Jam (Traffic tha yaar)",
          points: 40,
          keywords: ["traffic", "traffic jam", "red light", "signal", "jam"],
          acceptedPhrases: ["bhai bohot traffic tha", "stuck in heavy traffic", "signal pe fas gaya"]
        },
        {
          id: "ans_late28_2",
          rank: 2,
          canonicalAnswer: "Bas 2 Minute mein pohoch raha hu",
          points: 30,
          keywords: ["2 minute", "two minutes", "just reaching", "almost there", "on the way"],
          acceptedPhrases: ["bas 2 minute mein aaya", "on my way just 2 mins", "parking dhoond raha hu"]
        },
        {
          id: "ans_late28_3",
          rank: 3,
          canonicalAnswer: "Auto / Cab Cancelled",
          points: 20,
          keywords: ["cab cancelled", "auto nahi mila", "uber", "ola", "rapido cancelled"],
          acceptedPhrases: ["3 cabs cancelled", "auto wala nahi maana", "uber cancelled"]
        },
        {
          id: "ans_late28_4",
          rank: 4,
          canonicalAnswer: "Parents Gave Last-Minute Work",
          points: 10,
          keywords: ["parents", "mummy kaam", "family work", "ghar ka kaam"],
          acceptedPhrases: ["mummy ne kaam bola tha", "last minute family errand"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_recharge_029",
      batchId: 2,
      questionNumber: 29,
      question: "What is the first thing Indian phone users do when mobile data quota hits 100%?",
      category: "Tech & Daily Life",
      answerFormat: "OPEN_ENDED",
      audienceProfile: "1,000 active mobile data users",
      answers: [
        {
          id: "ans_rec29_1",
          rank: 1,
          canonicalAnswer: "Ask for Friend's Hotspot (Hotspot on kar)",
          points: 40,
          keywords: ["hotspot", "hotspot de", "wifi hotspot", "share hotspot"],
          acceptedPhrases: ["hotspot on kar bhai", "asking for friend hotspot", "hotspot dena"]
        },
        {
          id: "ans_rec29_2",
          rank: 2,
          canonicalAnswer: "Buy ₹15 / ₹25 Data Add-on Pack",
          points: 30,
          keywords: ["data pack", "15 rs pack", "add on", "data voucher", "1gb recharge"],
          acceptedPhrases: ["15 rupay ka data pack", "instant 1gb add on pack", "recharge data"]
        },
        {
          id: "ans_rec29_3",
          rank: 3,
          canonicalAnswer: "Hunt for Free WiFi",
          points: 20,
          keywords: ["free wifi", "cafe wifi", "metro wifi", "railwire", "wifi password"],
          acceptedPhrases: ["asking for wifi password", "connecting to cafe wifi"]
        },
        {
          id: "ans_rec29_4",
          rank: 4,
          canonicalAnswer: "Survive on 64 Kbps Speed (Pain)",
          points: 10,
          keywords: ["slow speed", "wait for midnight", "survive", "64 kbps"],
          acceptedPhrases: ["waiting till 12 midnight for reset", "suffering on slow speed"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    },
    {
      id: "classic_chaiorder_030",
      batchId: 2,
      questionNumber: 30,
      question: "What snack is ordered alongside cutting chai at 90% of Indian tea tapris?",
      category: "Indian Street Food & Chai",
      answerFormat: "FIXED_OPTIONS",
      audienceProfile: "1,000 tapri regulars",
      answers: [
        {
          id: "ans_co30_1",
          rank: 1,
          canonicalAnswer: "Samosa",
          points: 40,
          keywords: ["samosa", "garam samosa", "singhara"],
          acceptedPhrases: ["cutting chai with samosa", "one chai one samosa"]
        },
        {
          id: "ans_co30_2",
          rank: 2,
          canonicalAnswer: "Bun Maska",
          points: 30,
          keywords: ["bun maska", "maska bun", "bun butter"],
          acceptedPhrases: ["bun maska chai", "irani bun maska"]
        },
        {
          id: "ans_co30_3",
          rank: 3,
          canonicalAnswer: "Kachori",
          points: 20,
          keywords: ["kachori", "pyaaz kachori", "khasta kachori"],
          acceptedPhrases: ["garam kachori", "khasta kachori chai"]
        },
        {
          id: "ans_co30_4",
          rank: 4,
          canonicalAnswer: "Bread Pakora",
          points: 10,
          keywords: ["bread pakora", "pakoda", "pakora"],
          acceptedPhrases: ["crispy bread pakora", "monsoon bread pakora"]
        }
      ],
      sourceType: "AI_ESTIMATE",
      validationStatus: "UNVERIFIED"
    }
  ]
};

// ============================================================================
// BATCH REGISTRY AND IMPORT SERVICE
// ============================================================================
const BATCH_REGISTRY = new Map();

// Register official batches 1 and 2
BATCH_REGISTRY.set(1, BATCH_1);
BATCH_REGISTRY.set(2, BATCH_2);

// Auto-load Cricket & IPL Batch 1 (CRICKET_001 to CRICKET_015) if available
const path = require('path');
const fs = require('fs');

let BATCH_CRICKET_1 = null;
try {
  const jsonPath = path.join(__dirname, '../data/whats_the_majority_batch_1_questions_1_15.json');
  if (fs.existsSync(jsonPath)) {
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (Array.isArray(raw.questions)) {
      BATCH_CRICKET_1 = {
        batchId: 101,
        batchName: "Cricket & IPL Fanbase Edition (Batch 1)",
        questions: raw.questions.map((q, idx) => ({
          id: q.id || `CRICKET_${String(idx + 1).padStart(3, '0')}`,
          batchId: 101,
          questionNumber: idx + 1,
          question: q.question,
          category: q.category || "Cricket & IPL",
          answerFormat: "OPEN_ENDED",
          audienceProfile: "Indian cricket fans & college students",
          answers: (q.answers || []).map((a, aIdx) => ({
            id: `${q.id || 'cricket'}_ans_${a.rank || aIdx + 1}`,
            rank: a.rank,
            canonicalAnswer: a.answer,
            points: a.points || (a.rank === 1 ? 40 : a.rank === 2 ? 30 : a.rank === 3 ? 20 : 10),
            estimatedShare: a.estimatedShare,
            aliases: a.aliases || [],
            keywords: [a.answer.toLowerCase(), ...(a.aliases || []).map(x => x.toLowerCase())],
            acceptedPhrases: a.aliases || []
          })),
          predictedMajority: q.predictedMajority,
          confidence: q.confidence,
          reason: q.reason,
          sourceType: q.sourceType || "AI_ESTIMATE",
          validationStatus: q.validationStatus || "UNVERIFIED"
        }))
      };
      BATCH_REGISTRY.set(101, BATCH_CRICKET_1);
    }
  }
} catch (e) {
  console.warn("Could not auto-load cricket batch:", e.message);
}

/**
 * Register or import a new batch of 15 questions.
 * Validates schema and ensures integrity without modifying game engines.
 */
function importQuestionBatch(batchData) {
  const result = validateQuestionBatch(batchData);
  if (!result.valid) {
    return { success: false, error: result.error, batchId: batchData?.batchId };
  }

  BATCH_REGISTRY.set(batchData.batchId, batchData);
  return {
    success: true,
    error: null,
    batchId: batchData.batchId,
    questionCount: batchData.questions.length
  };
}

/**
 * Retrieves a specific batch by ID
 */
function getBatch(batchId) {
  return BATCH_REGISTRY.get(Number(batchId)) || null;
}

/**
 * Returns all registered batches
 */
function getAllBatches() {
  return Array.from(BATCH_REGISTRY.values()).sort((a, b) => a.batchId - b.batchId);
}

/**
 * Returns a flat list of all questions across all registered batches
 */
function getAllBatchedQuestions() {
  const all = [];
  getAllBatches().forEach(b => {
    if (Array.isArray(b.questions)) {
      all.push(...b.questions);
    }
  });
  return all;
}

module.exports = {
  validateQuestionBatch,
  importQuestionBatch,
  getBatch,
  getAllBatches,
  getAllBatchedQuestions,
  BATCH_1,
  BATCH_2
};

// apna-adda-backend/games/cricketersDatabase.js

/**
 * Comprehensive Database of 320+ Unique Famous Cricketers
 * Supports lookup by canonical name, first name, surname, or common nickname/alias.
 */

const CRICKETERS_DATABASE = [
  // ================= INDIA: CURRENT & MODERN MEN =================
  {
    id: "abhishek-sharma",
    canonicalName: "Abhishek Sharma",
    acceptedAliases: ["abhishek", "a sharma"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "abhishek sharma"
  },
  {
    id: "virat-kohli",
    canonicalName: "Virat Kohli",
    acceptedAliases: ["virat", "kohli", "cheeku", "king kohli", "vk"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "virat kohli"
  },
  {
    id: "rohit-sharma",
    canonicalName: "Rohit Sharma",
    acceptedAliases: ["rohit", "hitman", "sharmaji"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "rohit sharma"
  },
  {
    id: "jasprit-bumrah",
    canonicalName: "Jasprit Bumrah",
    acceptedAliases: ["bumrah", "jasprit", "boom boom bumrah", "jassi"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "jasprit bumrah"
  },
  {
    id: "hardik-pandya",
    canonicalName: "Hardik Pandya",
    acceptedAliases: ["hardik", "pandya", "kung fu pandya"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "hardik pandya"
  },
  {
    id: "ravindra-jadeja",
    canonicalName: "Ravindra Jadeja",
    acceptedAliases: ["jadeja", "jaddu", "sir jadeja", "ravindra"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ravindra jadeja"
  },
  {
    id: "ravichandran-ashwin",
    canonicalName: "Ravichandran Ashwin",
    acceptedAliases: ["ashwin", "r ashwin", "ravichandran", "ash"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ravichandran ashwin"
  },
  {
    id: "mohammed-shami",
    canonicalName: "Mohammed Shami",
    acceptedAliases: ["shami", "mohammad shami", "lala"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mohammed shami"
  },
  {
    id: "mohammed-siraj",
    canonicalName: "Mohammed Siraj",
    acceptedAliases: ["siraj", "mohammad siraj", "miyan"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mohammed siraj"
  },
  {
    id: "kl-rahul",
    canonicalName: "KL Rahul",
    acceptedAliases: ["rahul", "lokesh rahul", "k l rahul"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "kl rahul"
  },
  {
    id: "rishabh-pant",
    canonicalName: "Rishabh Pant",
    acceptedAliases: ["pant", "rishabh", "spidey"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "rishabh pant"
  },
  {
    id: "shubman-gill",
    canonicalName: "Shubman Gill",
    acceptedAliases: ["gill", "shubman", "prince"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "shubman gill"
  },
  {
    id: "yashasvi-jaiswal",
    canonicalName: "Yashasvi Jaiswal",
    acceptedAliases: ["jaiswal", "yashasvi"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "T20I", "IPL"],
    searchableName: "yashasvi jaiswal"
  },
  {
    id: "suryakumar-yadav",
    canonicalName: "Suryakumar Yadav",
    acceptedAliases: ["surya", "suryakumar", "sky"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "suryakumar yadav"
  },
  {
    id: "shreyas-iyer",
    canonicalName: "Shreyas Iyer",
    acceptedAliases: ["iyer", "shreyas"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "shreyas iyer"
  },
  {
    id: "sanju-samson",
    canonicalName: "Sanju Samson",
    acceptedAliases: ["samson", "sanju"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "sanju samson"
  },
  {
    id: "arshdeep-singh",
    canonicalName: "Arshdeep Singh",
    acceptedAliases: ["arshdeep", "a singh"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "arshdeep singh"
  },
  {
    id: "rinku-singh",
    canonicalName: "Rinku Singh",
    acceptedAliases: ["rinku"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "rinku singh"
  },
  {
    id: "axar-patel",
    canonicalName: "Axar Patel",
    acceptedAliases: ["axar", "akshar patel", "akshar", "bapu"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "axar patel"
  },
  {
    id: "kuldeep-yadav",
    canonicalName: "Kuldeep Yadav",
    acceptedAliases: ["kuldeep", "kulli"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "kuldeep yadav"
  },
  {
    id: "yuzvendra-chahal",
    canonicalName: "Yuzvendra Chahal",
    acceptedAliases: ["chahal", "yuzi", "yuzvendra"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "yuzvendra chahal"
  },
  {
    id: "bhuvneshwar-kumar",
    canonicalName: "Bhuvneshwar Kumar",
    acceptedAliases: ["bhuvi", "bhuvneshwar"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "bhuvneshwar kumar"
  },
  {
    id: "shardul-thakur",
    canonicalName: "Shardul Thakur",
    acceptedAliases: ["shardul", "lord shardul"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "shardul thakur"
  },
  {
    id: "ruturaj-gaikwad",
    canonicalName: "Ruturaj Gaikwad",
    acceptedAliases: ["ruturaj", "gaikwad", "rutu"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "ruturaj gaikwad"
  },
  {
    id: "tilak-varma",
    canonicalName: "Tilak Varma",
    acceptedAliases: ["tilak", "varma"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "tilak varma"
  },
  {
    id: "shivam-dube",
    canonicalName: "Shivam Dube",
    acceptedAliases: ["dube", "shivam"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "shivam dube"
  },
  {
    id: "ishan-kishan",
    canonicalName: "Ishan Kishan",
    acceptedAliases: ["ishan", "kishan"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ishan kishan"
  },
  {
    id: "dhruv-jurel",
    canonicalName: "Dhruv Jurel",
    acceptedAliases: ["jurel", "dhruv"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "IPL"],
    searchableName: "dhruv jurel"
  },
  {
    id: "harshit-rana",
    canonicalName: "Harshit Rana",
    acceptedAliases: ["harshit"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["IPL", "T20I"],
    searchableName: "harshit rana"
  },
  {
    id: "mayank-yadav",
    canonicalName: "Mayank Yadav",
    acceptedAliases: ["mayank y"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "mayank yadav"
  },
  {
    id: "nitish-kumar-reddy",
    canonicalName: "Nitish Kumar Reddy",
    acceptedAliases: ["nitish reddy", "nitish", "nkr"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "nitish kumar reddy"
  },
  {
    id: "sai-sudharsan",
    canonicalName: "Sai Sudharsan",
    acceptedAliases: ["sudharsan", "sai sudharshan"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "IPL"],
    searchableName: "sai sudharsan"
  },
  {
    id: "sarfaraz-khan",
    canonicalName: "Sarfaraz Khan",
    acceptedAliases: ["sarfaraz"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "IPL"],
    searchableName: "sarfaraz khan"
  },
  {
    id: "devdutt-padikkal",
    canonicalName: "Devdutt Padikkal",
    acceptedAliases: ["padikkal", "devdutt"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "T20I", "IPL"],
    searchableName: "devdutt padikkal"
  },
  {
    id: "rajat-patidar",
    canonicalName: "Rajat Patidar",
    acceptedAliases: ["patidar", "rajat"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "IPL"],
    searchableName: "rajat patidar"
  },
  {
    id: "washington-sundar",
    canonicalName: "Washington Sundar",
    acceptedAliases: ["sundar", "washington", "washi"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "washington sundar"
  },
  {
    id: "avesh-khan",
    canonicalName: "Avesh Khan",
    acceptedAliases: ["avesh"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "avesh khan"
  },
  {
    id: "prasidh-krishna",
    canonicalName: "Prasidh Krishna",
    acceptedAliases: ["prasidh"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "IPL"],
    searchableName: "prasidh krishna"
  },
  {
    id: "ravi-bishnoi",
    canonicalName: "Ravi Bishnoi",
    acceptedAliases: ["bishnoi"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "ravi bishnoi"
  },
  {
    id: "varun-chakravarthy",
    canonicalName: "Varun Chakravarthy",
    acceptedAliases: ["chakravarthy", "varun c"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "varun chakravarthy"
  },
  {
    id: "mukesh-kumar",
    canonicalName: "Mukesh Kumar",
    acceptedAliases: ["mukesh"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mukesh kumar"
  },
  {
    id: "umran-malik",
    canonicalName: "Umran Malik",
    acceptedAliases: ["umran"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "umran malik"
  },
  {
    id: "krunal-pandya",
    canonicalName: "Krunal Pandya",
    acceptedAliases: ["krunal"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "krunal pandya"
  },
  {
    id: "deepak-chahar",
    canonicalName: "Deepak Chahar",
    acceptedAliases: ["d chahar"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "deepak chahar"
  },
  {
    id: "rahul-chahar",
    canonicalName: "Rahul Chahar",
    acceptedAliases: ["r chahar"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "rahul chahar"
  },
  {
    id: "rahul-tripathi",
    canonicalName: "Rahul Tripathi",
    acceptedAliases: ["tripathi"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "rahul tripathi"
  },
  {
    id: "rahul-tewatia",
    canonicalName: "Rahul Tewatia",
    acceptedAliases: ["tewatia"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["IPL"],
    searchableName: "rahul tewatia"
  },
  {
    id: "jitesh-sharma",
    canonicalName: "Jitesh Sharma",
    acceptedAliases: ["jitesh"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "jitesh sharma"
  },
  {
    id: "yash-dayal",
    canonicalName: "Yash Dayal",
    acceptedAliases: ["dayal"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["IPL"],
    searchableName: "yash dayal"
  },
  {
    id: "tushar-deshpande",
    canonicalName: "Tushar Deshpande",
    acceptedAliases: ["deshpande"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "tushar deshpande"
  },

  // ================= INDIA: 2000s & 2010s LEGENDS =================
  {
    id: "ms-dhoni",
    canonicalName: "MS Dhoni",
    acceptedAliases: ["dhoni", "mahendra singh dhoni", "msd", "thala", "mahi"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ms dhoni"
  },
  {
    id: "sachin-tendulkar",
    canonicalName: "Sachin Tendulkar",
    acceptedAliases: ["sachin", "tendulkar", "master blaster", "god of cricket"],
    country: "India",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI", "IPL"],
    searchableName: "sachin tendulkar"
  },
  {
    id: "virender-sehwag",
    canonicalName: "Virender Sehwag",
    acceptedAliases: ["sehwag", "viru", "nawab of najafgarh"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "virender sehwag"
  },
  {
    id: "yuvraj-singh",
    canonicalName: "Yuvraj Singh",
    acceptedAliases: ["yuvraj", "yuvi"],
    country: "India",
    role: "All-rounder",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "yuvraj singh"
  },
  {
    id: "gautam-gambhir",
    canonicalName: "Gautam Gambhir",
    acceptedAliases: ["gambhir", "gauti"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "gautam gambhir"
  },
  {
    id: "suresh-raina",
    canonicalName: "Suresh Raina",
    acceptedAliases: ["raina", "mr ipl", "chinna thala"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "suresh raina"
  },
  {
    id: "rahul-dravid",
    canonicalName: "Rahul Dravid",
    acceptedAliases: ["dravid", "the wall", "jammy"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "rahul dravid"
  },
  {
    id: "sourav-ganguly",
    canonicalName: "Sourav Ganguly",
    acceptedAliases: ["ganguly", "dada", "prince of kolkata", "sourav"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "sourav ganguly"
  },
  {
    id: "vvs-laxman",
    canonicalName: "VVS Laxman",
    acceptedAliases: ["laxman", "vvs"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "vvs laxman"
  },
  {
    id: "anil-kumble",
    canonicalName: "Anil Kumble",
    acceptedAliases: ["kumble", "jumbo", "anil"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "anil kumble"
  },
  {
    id: "harbhajan-singh",
    canonicalName: "Harbhajan Singh",
    acceptedAliases: ["harbhajan", "bhajji", "turbanator"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "harbhajan singh"
  },
  {
    id: "zaheer-khan",
    canonicalName: "Zaheer Khan",
    acceptedAliases: ["zaheer", "zak"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "zaheer khan"
  },
  {
    id: "ashish-nehra",
    canonicalName: "Ashish Nehra",
    acceptedAliases: ["nehra", "nehraji"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ashish nehra"
  },
  {
    id: "ajit-agarkar",
    canonicalName: "Ajit Agarkar",
    acceptedAliases: ["agarkar"],
    country: "India",
    role: "All-rounder",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ajit agarkar"
  },
  {
    id: "irfan-pathan",
    canonicalName: "Irfan Pathan",
    acceptedAliases: ["irfan"],
    country: "India",
    role: "All-rounder",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "irfan pathan"
  },
  {
    id: "yusuf-pathan",
    canonicalName: "Yusuf Pathan",
    acceptedAliases: ["yusuf"],
    country: "India",
    role: "All-rounder",
    era: "2000s",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "yusuf pathan"
  },
  {
    id: "ajinkya-rahane",
    canonicalName: "Ajinkya Rahane",
    acceptedAliases: ["rahane", "ajinkya", "jinx"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ajinkya rahane"
  },
  {
    id: "cheteshwar-pujara",
    canonicalName: "Cheteshwar Pujara",
    acceptedAliases: ["pujara", "cheteshwar", "puji"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI"],
    searchableName: "cheteshwar pujara"
  },
  {
    id: "shikhar-dhawan",
    canonicalName: "Shikhar Dhawan",
    acceptedAliases: ["dhawan", "gabbar", "shikhar"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "shikhar dhawan"
  },
  {
    id: "dinesh-karthik",
    canonicalName: "Dinesh Karthik",
    acceptedAliases: ["dk", "karthik"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "dinesh karthik"
  },
  {
    id: "robin-uthappa",
    canonicalName: "Robin Uthappa",
    acceptedAliases: ["uthappa", "robin"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "robin uthappa"
  },
  {
    id: "ambati-rayudu",
    canonicalName: "Ambati Rayudu",
    acceptedAliases: ["rayudu", "ambati"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["ODI", "IPL"],
    searchableName: "ambati rayudu"
  },
  {
    id: "murali-vijay",
    canonicalName: "Murali Vijay",
    acceptedAliases: ["murali vijay", "monk"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "murali vijay"
  },
  {
    id: "wriddhiman-saha",
    canonicalName: "Wriddhiman Saha",
    acceptedAliases: ["saha", "wriddhiman"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "2000s",
    format: ["Test", "IPL"],
    searchableName: "wriddhiman saha"
  },
  {
    id: "ishant-sharma",
    canonicalName: "Ishant Sharma",
    acceptedAliases: ["ishant", "lambu"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "ishant sharma"
  },
  {
    id: "umesh-yadav",
    canonicalName: "Umesh Yadav",
    acceptedAliases: ["umesh"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "umesh yadav"
  },
  {
    id: "s-sreesanth",
    canonicalName: "S Sreesanth",
    acceptedAliases: ["sreesanth", "shanthakumaran sreesanth"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "s sreesanth"
  },
  {
    id: "munaf-patel",
    canonicalName: "Munaf Patel",
    acceptedAliases: ["munaf"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "munaf patel"
  },
  {
    id: "praveen-kumar",
    canonicalName: "Praveen Kumar",
    acceptedAliases: ["praveen k", "pk"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "praveen kumar"
  },
  {
    id: "pragyan-ojha",
    canonicalName: "Pragyan Ojha",
    acceptedAliases: ["ojha", "pragyan"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "pragyan ojha"
  },
  {
    id: "piyush-chawla",
    canonicalName: "Piyush Chawla",
    acceptedAliases: ["chawla", "piyush"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "piyush chawla"
  },
  {
    id: "amit-mishra",
    canonicalName: "Amit Mishra",
    acceptedAliases: ["mishraji", "amit m"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "amit mishra"
  },
  {
    id: "parthiv-patel",
    canonicalName: "Parthiv Patel",
    acceptedAliases: ["parthiv"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "parthiv patel"
  },

  // ================= INDIA: 1980s & 1990s CLASSIC =================
  {
    id: "kapil-dev",
    canonicalName: "Kapil Dev",
    acceptedAliases: ["kapil", "haryana hurricane", "kapil paaji"],
    country: "India",
    role: "All-rounder",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "kapil dev"
  },
  {
    id: "sunil-gavaskar",
    canonicalName: "Sunil Gavaskar",
    acceptedAliases: ["gavaskar", "sunny", "little master"],
    country: "India",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "sunil gavaskar"
  },
  {
    id: "gundappa-viswanath",
    canonicalName: "Gundappa Viswanath",
    acceptedAliases: ["viswanath", "vishy"],
    country: "India",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "gundappa viswanath"
  },
  {
    id: "dilip-vengsarkar",
    canonicalName: "Dilip Vengsarkar",
    acceptedAliases: ["vengsarkar", "colonel"],
    country: "India",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "dilip vengsarkar"
  },
  {
    id: "mohinder-amarnath",
    canonicalName: "Mohinder Amarnath",
    acceptedAliases: ["amarnath", "jimmy amarnath"],
    country: "India",
    role: "All-rounder",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "mohinder amarnath"
  },
  {
    id: "ravi-shastri",
    canonicalName: "Ravi Shastri",
    acceptedAliases: ["shastri", "ravi"],
    country: "India",
    role: "All-rounder",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "ravi shastri"
  },
  {
    id: "mohammad-azharuddin",
    canonicalName: "Mohammad Azharuddin",
    acceptedAliases: ["azharuddin", "azhar"],
    country: "India",
    role: "Batter",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "mohammad azharuddin"
  },
  {
    id: "ajay-jadeja",
    canonicalName: "Ajay Jadeja",
    acceptedAliases: ["ajay j"],
    country: "India",
    role: "Batter",
    era: "1990s",
    format: ["ODI", "Test"],
    searchableName: "ajay jadeja"
  },
  {
    id: "vinod-kambli",
    canonicalName: "Vinod Kambli",
    acceptedAliases: ["kambli"],
    country: "India",
    role: "Batter",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "vinod kambli"
  },
  {
    id: "javagal-srinath",
    canonicalName: "Javagal Srinath",
    acceptedAliases: ["srinath"],
    country: "India",
    role: "Bowler",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "javagal srinath"
  },
  {
    id: "venkatesh-prasad",
    canonicalName: "Venkatesh Prasad",
    acceptedAliases: ["prasad", "venky"],
    country: "India",
    role: "Bowler",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "venkatesh prasad"
  },
  {
    id: "syed-kirmani",
    canonicalName: "Syed Kirmani",
    acceptedAliases: ["kirmani"],
    country: "India",
    role: "Wicketkeeper",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "syed kirmani"
  },
  {
    id: "kris-srikkanth",
    canonicalName: "Kris Srikkanth",
    acceptedAliases: ["srikkanth", "cheeka"],
    country: "India",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "kris srikkanth"
  },
  {
    id: "sandeep-patil",
    canonicalName: "Sandeep Patil",
    acceptedAliases: ["patil"],
    country: "India",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "sandeep patil"
  },
  {
    id: "madan-lal",
    canonicalName: "Madan Lal",
    acceptedAliases: ["madan"],
    country: "India",
    role: "All-rounder",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "madan lal"
  },
  {
    id: "roger-binny",
    canonicalName: "Roger Binny",
    acceptedAliases: ["binny"],
    country: "India",
    role: "All-rounder",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "roger binny"
  },
  {
    id: "bishan-singh-bedi",
    canonicalName: "Bishan Singh Bedi",
    acceptedAliases: ["bedi", "bishan bedi"],
    country: "India",
    role: "Bowler",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "bishan singh bedi"
  },
  {
    id: "bs-chandrasekhar",
    canonicalName: "BS Chandrasekhar",
    acceptedAliases: ["chandrasekhar", "chandra"],
    country: "India",
    role: "Bowler",
    era: "Classic",
    format: ["Test"],
    searchableName: "bs chandrasekhar"
  },
  {
    id: "erapalli-prasanna",
    canonicalName: "Erapalli Prasanna",
    acceptedAliases: ["prasanna"],
    country: "India",
    role: "Bowler",
    era: "Classic",
    format: ["Test"],
    searchableName: "erapalli prasanna"
  },
  {
    id: "farokh-engineer",
    canonicalName: "Farokh Engineer",
    acceptedAliases: ["engineer"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "farokh engineer"
  },
  {
    id: "mansoor-ali-khan-pataudi",
    canonicalName: "Mansoor Ali Khan Pataudi",
    acceptedAliases: ["tiger pataudi", "pataudi"],
    country: "India",
    role: "Batter",
    era: "Classic",
    format: ["Test"],
    searchableName: "mansoor ali khan pataudi"
  },
  {
    id: "vijay-hazare",
    canonicalName: "Vijay Hazare",
    acceptedAliases: ["hazare"],
    country: "India",
    role: "Batter",
    era: "Classic",
    format: ["Test"],
    searchableName: "vijay hazare"
  },
  {
    id: "vinoo-mankad",
    canonicalName: "Vinoo Mankad",
    acceptedAliases: ["mankad"],
    country: "India",
    role: "All-rounder",
    era: "Classic",
    format: ["Test"],
    searchableName: "vinoo mankad"
  },

  // ================= INDIA: WOMEN CRICKETERS =================
  {
    id: "smriti-mandhana",
    canonicalName: "Smriti Mandhana",
    acceptedAliases: ["smriti", "mandhana"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL"],
    searchableName: "smriti mandhana"
  },
  {
    id: "harmanpreet-kaur",
    canonicalName: "Harmanpreet Kaur",
    acceptedAliases: ["harmanpreet", "harman"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL"],
    searchableName: "harmanpreet kaur"
  },
  {
    id: "mithali-raj",
    canonicalName: "Mithali Raj",
    acceptedAliases: ["mithali"],
    country: "India",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I"],
    searchableName: "mithali raj"
  },
  {
    id: "jhulan-goswami",
    canonicalName: "Jhulan Goswami",
    acceptedAliases: ["jhulan", "babul"],
    country: "India",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I"],
    searchableName: "jhulan goswami"
  },
  {
    id: "deepti-sharma",
    canonicalName: "Deepti Sharma",
    acceptedAliases: ["deepti"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL"],
    searchableName: "deepti sharma"
  },
  {
    id: "jemimah-rodrigues",
    canonicalName: "Jemimah Rodrigues",
    acceptedAliases: ["jemimah", "jemi"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL"],
    searchableName: "jemimah rodrigues"
  },
  {
    id: "shafali-verma",
    canonicalName: "Shafali Verma",
    acceptedAliases: ["shafali"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL"],
    searchableName: "shafali verma"
  },
  {
    id: "richa-ghosh",
    canonicalName: "Richa Ghosh",
    acceptedAliases: ["richa"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["ODI", "T20I", "WPL"],
    searchableName: "richa ghosh"
  },
  {
    id: "renuka-singh",
    canonicalName: "Renuka Singh",
    acceptedAliases: ["renuka"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "WPL"],
    searchableName: "renuka singh"
  },
  {
    id: "pooja-vastrakar",
    canonicalName: "Pooja Vastrakar",
    acceptedAliases: ["vastrakar", "pooja"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL"],
    searchableName: "pooja vastrakar"
  },

  // ================= AUSTRALIA =================
  {
    id: "ricky-ponting",
    canonicalName: "Ricky Ponting",
    acceptedAliases: ["ponting", "punter", "ricky"],
    country: "Australia",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ricky ponting"
  },
  {
    id: "shane-warne",
    canonicalName: "Shane Warne",
    acceptedAliases: ["warne", "warnie", "king of spin"],
    country: "Australia",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "shane warne"
  },
  {
    id: "glenn-mcgrath",
    canonicalName: "Glenn McGrath",
    acceptedAliases: ["mcgrath", "pigeon"],
    country: "Australia",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "glenn mcgrath"
  },
  {
    id: "adam-gilchrist",
    canonicalName: "Adam Gilchrist",
    acceptedAliases: ["gilchrist", "gilly"],
    country: "Australia",
    role: "Wicketkeeper-Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "adam gilchrist"
  },
  {
    id: "steve-waugh",
    canonicalName: "Steve Waugh",
    acceptedAliases: ["s waugh", "tugga"],
    country: "Australia",
    role: "Batter",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "steve waugh"
  },
  {
    id: "mark-waugh",
    canonicalName: "Mark Waugh",
    acceptedAliases: ["m waugh", "junior"],
    country: "Australia",
    role: "Batter",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "mark waugh"
  },
  {
    id: "matthew-hayden",
    canonicalName: "Matthew Hayden",
    acceptedAliases: ["hayden", "haydos"],
    country: "Australia",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "matthew hayden"
  },
  {
    id: "justin-langer",
    canonicalName: "Justin Langer",
    acceptedAliases: ["langer", "alfie"],
    country: "Australia",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI"],
    searchableName: "justin langer"
  },
  {
    id: "brett-lee",
    canonicalName: "Brett Lee",
    acceptedAliases: ["binga", "brett"],
    country: "Australia",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "brett lee"
  },
  {
    id: "michael-clarke",
    canonicalName: "Michael Clarke",
    acceptedAliases: ["pup", "m clarke"],
    country: "Australia",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "michael clarke"
  },
  {
    id: "michael-hussey",
    canonicalName: "Michael Hussey",
    acceptedAliases: ["hussey", "mike hussey", "mr cricket"],
    country: "Australia",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "michael hussey"
  },
  {
    id: "mitchell-johnson",
    canonicalName: "Mitchell Johnson",
    acceptedAliases: ["m johnson", "mitch johnson"],
    country: "Australia",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mitchell johnson"
  },
  {
    id: "mitchell-starc",
    canonicalName: "Mitchell Starc",
    acceptedAliases: ["starc", "mitch starc"],
    country: "Australia",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mitchell starc"
  },
  {
    id: "pat-cummins",
    canonicalName: "Pat Cummins",
    acceptedAliases: ["cummins", "pat"],
    country: "Australia",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "pat cummins"
  },
  {
    id: "josh-hazlewood",
    canonicalName: "Josh Hazlewood",
    acceptedAliases: ["hazlewood", "hoff"],
    country: "Australia",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "josh hazlewood"
  },
  {
    id: "nathan-lyon",
    canonicalName: "Nathan Lyon",
    acceptedAliases: ["lyon", "gary", "goat"],
    country: "Australia",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI"],
    searchableName: "nathan lyon"
  },
  {
    id: "steve-smith",
    canonicalName: "Steve Smith",
    acceptedAliases: ["smudge", "steven smith"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "steve smith"
  },
  {
    id: "david-warner",
    canonicalName: "David Warner",
    acceptedAliases: ["warner", "bull", "davey"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "david warner"
  },
  {
    id: "travis-head",
    canonicalName: "Travis Head",
    acceptedAliases: ["head", "trav"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "travis head"
  },
  {
    id: "glenn-maxwell",
    canonicalName: "Glenn Maxwell",
    acceptedAliases: ["maxwell", "maxi", "the big show"],
    country: "Australia",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "glenn maxwell"
  },
  {
    id: "marcus-stoinis",
    canonicalName: "Marcus Stoinis",
    acceptedAliases: ["stoinis", "stoin"],
    country: "Australia",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "marcus stoinis"
  },
  {
    id: "mitchell-marsh",
    canonicalName: "Mitchell Marsh",
    acceptedAliases: ["mitch marsh", "bison"],
    country: "Australia",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mitchell marsh"
  },
  {
    id: "cameron-green",
    canonicalName: "Cameron Green",
    acceptedAliases: ["cam green"],
    country: "Australia",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "cameron green"
  },
  {
    id: "aaron-finch",
    canonicalName: "Aaron Finch",
    acceptedAliases: ["finch", "finchy"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "aaron finch"
  },
  {
    id: "usman-khawaja",
    canonicalName: "Usman Khawaja",
    acceptedAliases: ["khawaja", "uzzie"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI"],
    searchableName: "usman khawaja"
  },
  {
    id: "marnus-labuschagne",
    canonicalName: "Marnus Labuschagne",
    acceptedAliases: ["labuschagne", "marnus"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI"],
    searchableName: "marnus labuschagne"
  },
  {
    id: "alex-carey",
    canonicalName: "Alex Carey",
    acceptedAliases: ["carey"],
    country: "Australia",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "alex carey"
  },
  {
    id: "allan-border",
    canonicalName: "Allan Border",
    acceptedAliases: ["border", "ab"],
    country: "Australia",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "allan border"
  },
  {
    id: "dennis-lillee",
    canonicalName: "Dennis Lillee",
    acceptedAliases: ["lillee"],
    country: "Australia",
    role: "Bowler",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "dennis lillee"
  },
  {
    id: "don-bradman",
    canonicalName: "Don Bradman",
    acceptedAliases: ["bradman", "the don", "donald bradman"],
    country: "Australia",
    role: "Batter",
    era: "Classic",
    format: ["Test"],
    searchableName: "don bradman"
  },
  {
    id: "ellyse-perry",
    canonicalName: "Ellyse Perry",
    acceptedAliases: ["perry", "pez"],
    country: "Australia",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL", "WBBL"],
    searchableName: "ellyse perry"
  },
  {
    id: "meg-lanning",
    canonicalName: "Meg Lanning",
    acceptedAliases: ["lanning"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL", "WBBL"],
    searchableName: "meg lanning"
  },
  {
    id: "alyssa-healy",
    canonicalName: "Alyssa Healy",
    acceptedAliases: ["healy"],
    country: "Australia",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL", "WBBL"],
    searchableName: "alyssa healy"
  },
  {
    id: "beth-mooney",
    canonicalName: "Beth Mooney",
    acceptedAliases: ["mooney"],
    country: "Australia",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "WPL", "WBBL"],
    searchableName: "beth mooney"
  },

  // ================= ENGLAND =================
  {
    id: "joe-root",
    canonicalName: "Joe Root",
    acceptedAliases: ["root", "rooty"],
    country: "England",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "joe root"
  },
  {
    id: "ben-stokes",
    canonicalName: "Ben Stokes",
    acceptedAliases: ["stokes", "stoksey"],
    country: "England",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ben stokes"
  },
  {
    id: "jos-buttler",
    canonicalName: "Jos Buttler",
    acceptedAliases: ["buttler", "jos", "jos the boss"],
    country: "England",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "jos buttler"
  },
  {
    id: "harry-brook",
    canonicalName: "Harry Brook",
    acceptedAliases: ["brook", "harry"],
    country: "England",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "harry brook"
  },
  {
    id: "jonny-bairstow",
    canonicalName: "Jonny Bairstow",
    acceptedAliases: ["bairstow", "yjb"],
    country: "England",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "jonny bairstow"
  },
  {
    id: "james-anderson",
    canonicalName: "James Anderson",
    acceptedAliases: ["anderson", "jimmy anderson", "jimmy"],
    country: "England",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI"],
    searchableName: "james anderson"
  },
  {
    id: "stuart-broad",
    canonicalName: "Stuart Broad",
    acceptedAliases: ["broad", "broady"],
    country: "England",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I"],
    searchableName: "stuart broad"
  },
  {
    id: "jofra-archer",
    canonicalName: "Jofra Archer",
    acceptedAliases: ["archer", "jofra"],
    country: "England",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "jofra archer"
  },
  {
    id: "mark-wood",
    canonicalName: "Mark Wood",
    acceptedAliases: ["woody", "m wood"],
    country: "England",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mark wood"
  },
  {
    id: "chris-woakes",
    canonicalName: "Chris Woakes",
    acceptedAliases: ["woakes", "woakesy"],
    country: "England",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "chris woakes"
  },
  {
    id: "liam-livingstone",
    canonicalName: "Liam Livingstone",
    acceptedAliases: ["livingstone", "livvy"],
    country: "England",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "liam livingstone"
  },
  {
    id: "phil-salt",
    canonicalName: "Phil Salt",
    acceptedAliases: ["salt"],
    country: "England",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "phil salt"
  },
  {
    id: "sam-curran",
    canonicalName: "Sam Curran",
    acceptedAliases: ["s curran"],
    country: "England",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "sam curran"
  },
  {
    id: "moeen-ali",
    canonicalName: "Moeen Ali",
    acceptedAliases: ["moeen"],
    country: "England",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "moeen ali"
  },
  {
    id: "adil-rashid",
    canonicalName: "Adil Rashid",
    acceptedAliases: ["a rashid", "dilly"],
    country: "England",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "adil rashid"
  },
  {
    id: "eoin-morgan",
    canonicalName: "Eoin Morgan",
    acceptedAliases: ["morgan", "morgs"],
    country: "England",
    role: "Batter",
    era: "2010s",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "eoin morgan"
  },
  {
    id: "alastair-cook",
    canonicalName: "Alastair Cook",
    acceptedAliases: ["cook", "chef"],
    country: "England",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI"],
    searchableName: "alastair cook"
  },
  {
    id: "kevin-pietersen",
    canonicalName: "Kevin Pietersen",
    acceptedAliases: ["pietersen", "kp"],
    country: "England",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "kevin pietersen"
  },
  {
    id: "andrew-flintoff",
    canonicalName: "Andrew Flintoff",
    acceptedAliases: ["flintoff", "freddie"],
    country: "England",
    role: "All-rounder",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "andrew flintoff"
  },
  {
    id: "ian-botham",
    canonicalName: "Ian Botham",
    acceptedAliases: ["botham", "beefy"],
    country: "England",
    role: "All-rounder",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "ian botham"
  },
  {
    id: "michael-vaughan",
    canonicalName: "Michael Vaughan",
    acceptedAliases: ["vaughan"],
    country: "England",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI"],
    searchableName: "michael vaughan"
  },
  {
    id: "graeme-swann",
    canonicalName: "Graeme Swann",
    acceptedAliases: ["swann", "swanny"],
    country: "England",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I"],
    searchableName: "graeme swann"
  },
  {
    id: "ben-duckett",
    canonicalName: "Ben Duckett",
    acceptedAliases: ["duckett"],
    country: "England",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "ben duckett"
  },
  {
    id: "ollie-pope",
    canonicalName: "Ollie Pope",
    acceptedAliases: ["pope"],
    country: "England",
    role: "Batter",
    era: "Modern",
    format: ["Test"],
    searchableName: "ollie pope"
  },
  {
    id: "zak-crawley",
    canonicalName: "Zak Crawley",
    acceptedAliases: ["crawley"],
    country: "England",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI"],
    searchableName: "zak crawley"
  },

  // ================= PAKISTAN =================
  {
    id: "babar-azam",
    canonicalName: "Babar Azam",
    acceptedAliases: ["babar", "bobby"],
    country: "Pakistan",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "PSL"],
    searchableName: "babar azam"
  },
  {
    id: "shaheen-shah-afridi",
    canonicalName: "Shaheen Shah Afridi",
    acceptedAliases: ["shaheen afridi", "shaheen", "the eagle"],
    country: "Pakistan",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "PSL"],
    searchableName: "shaheen shah afridi"
  },
  {
    id: "mohammad-rizwan",
    canonicalName: "Mohammad Rizwan",
    acceptedAliases: ["rizwan"],
    country: "Pakistan",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "PSL"],
    searchableName: "mohammad rizwan"
  },
  {
    id: "shahid-afridi",
    canonicalName: "Shahid Afridi",
    acceptedAliases: ["boom boom", "lala afridi"],
    country: "Pakistan",
    role: "All-rounder",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL", "PSL"],
    searchableName: "shahid afridi"
  },
  {
    id: "wasim-akram",
    canonicalName: "Wasim Akram",
    acceptedAliases: ["wasim", "sultan of swing"],
    country: "Pakistan",
    role: "Bowler",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "wasim akram"
  },
  {
    id: "waqar-younis",
    canonicalName: "Waqar Younis",
    acceptedAliases: ["waqar", "burewala express"],
    country: "Pakistan",
    role: "Bowler",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "waqar younis"
  },
  {
    id: "shoaib-akhtar",
    canonicalName: "Shoaib Akhtar",
    acceptedAliases: ["akhtar", "rawalpindi express"],
    country: "Pakistan",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "shoaib akhtar"
  },
  {
    id: "imran-khan",
    canonicalName: "Imran Khan",
    acceptedAliases: ["imran", "kaptaan"],
    country: "Pakistan",
    role: "All-rounder",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "imran khan"
  },
  {
    id: "inzamam-ul-haq",
    canonicalName: "Inzamam-ul-Haq",
    acceptedAliases: ["inzamam", "inzy"],
    country: "Pakistan",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI"],
    searchableName: "inzamam-ul-haq"
  },
  {
    id: "javed-miandad",
    canonicalName: "Javed Miandad",
    acceptedAliases: ["miandad"],
    country: "Pakistan",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "javed miandad"
  },
  {
    id: "mohammad-yousuf",
    canonicalName: "Mohammad Yousuf",
    acceptedAliases: ["yousuf", "yousuf youhana"],
    country: "Pakistan",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI"],
    searchableName: "mohammad yousuf"
  },
  {
    id: "younis-khan",
    canonicalName: "Younis Khan",
    acceptedAliases: ["younis"],
    country: "Pakistan",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I"],
    searchableName: "younis khan"
  },
  {
    id: "saeed-anwar",
    canonicalName: "Saeed Anwar",
    acceptedAliases: ["anwar"],
    country: "Pakistan",
    role: "Batter",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "saeed anwar"
  },
  {
    id: "misbah-ul-haq",
    canonicalName: "Misbah-ul-Haq",
    acceptedAliases: ["misbah"],
    country: "Pakistan",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I"],
    searchableName: "misbah-ul-haq"
  },
  {
    id: "naseem-shah",
    canonicalName: "Naseem Shah",
    acceptedAliases: ["naseem"],
    country: "Pakistan",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "PSL"],
    searchableName: "naseem shah"
  },
  {
    id: "haris-rauf",
    canonicalName: "Haris Rauf",
    acceptedAliases: ["rauf"],
    country: "Pakistan",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "PSL"],
    searchableName: "haris rauf"
  },
  {
    id: "shadab-khan",
    canonicalName: "Shadab Khan",
    acceptedAliases: ["shadab", "shaddy"],
    country: "Pakistan",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "PSL"],
    searchableName: "shadab khan"
  },
  {
    id: "fakhar-zaman",
    canonicalName: "Fakhar Zaman",
    acceptedAliases: ["fakhar"],
    country: "Pakistan",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I", "PSL"],
    searchableName: "fakhar zaman"
  },
  {
    id: "mohammad-amir",
    canonicalName: "Mohammad Amir",
    acceptedAliases: ["amir"],
    country: "Pakistan",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "PSL"],
    searchableName: "mohammad amir"
  },
  {
    id: "saqlain-mushtaq",
    canonicalName: "Saqlain Mushtaq",
    acceptedAliases: ["saqlain", "doosra"],
    country: "Pakistan",
    role: "Bowler",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "saqlain mushtaq"
  },

  // ================= SOUTH AFRICA =================
  {
    id: "ab-de-villiers",
    canonicalName: "AB de Villiers",
    acceptedAliases: ["de villiers", "abd", "mr 360", "ab"],
    country: "South Africa",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ab de villiers"
  },
  {
    id: "jacques-kallis",
    canonicalName: "Jacques Kallis",
    acceptedAliases: ["kallis"],
    country: "South Africa",
    role: "All-rounder",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "jacques kallis"
  },
  {
    id: "dale-steyn",
    canonicalName: "Dale Steyn",
    acceptedAliases: ["steyn", "steyn gun"],
    country: "South Africa",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "dale steyn"
  },
  {
    id: "shaun-pollock",
    canonicalName: "Shaun Pollock",
    acceptedAliases: ["pollock"],
    country: "South Africa",
    role: "All-rounder",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "shaun pollock"
  },
  {
    id: "allan-donald",
    canonicalName: "Allan Donald",
    acceptedAliases: ["donald", "white lightning"],
    country: "South Africa",
    role: "Bowler",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "allan donald"
  },
  {
    id: "makhaya-ntini",
    canonicalName: "Makhaya Ntini",
    acceptedAliases: ["ntini"],
    country: "South Africa",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "makhaya ntini"
  },
  {
    id: "graeme-smith",
    canonicalName: "Graeme Smith",
    acceptedAliases: ["g smith", "biff"],
    country: "South Africa",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "graeme smith"
  },
  {
    id: "hashim-amla",
    canonicalName: "Hashim Amla",
    acceptedAliases: ["amla", "mighty hash"],
    country: "South Africa",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "hashim amla"
  },
  {
    id: "jonty-rhodes",
    canonicalName: "Jonty Rhodes",
    acceptedAliases: ["jonty"],
    country: "South Africa",
    role: "Batter",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "jonty rhodes"
  },
  {
    id: "kagiso-rabada",
    canonicalName: "Kagiso Rabada",
    acceptedAliases: ["rabada", "kg"],
    country: "South Africa",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL", "SA20"],
    searchableName: "kagiso rabada"
  },
  {
    id: "anrich-nortje",
    canonicalName: "Anrich Nortje",
    acceptedAliases: ["nortje"],
    country: "South Africa",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL", "SA20"],
    searchableName: "anrich nortje"
  },
  {
    id: "quinton-de-kock",
    canonicalName: "Quinton de Kock",
    acceptedAliases: ["de kock", "quinny"],
    country: "South Africa",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL", "SA20"],
    searchableName: "quinton de kock"
  },
  {
    id: "faf-du-plessis",
    canonicalName: "Faf du Plessis",
    acceptedAliases: ["du plessis", "faf"],
    country: "South Africa",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL", "SA20"],
    searchableName: "faf du plessis"
  },
  {
    id: "david-miller",
    canonicalName: "David Miller",
    acceptedAliases: ["miller", "killer miller"],
    country: "South Africa",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL", "SA20"],
    searchableName: "david miller"
  },
  {
    id: "heinrich-klaasen",
    canonicalName: "Heinrich Klaasen",
    acceptedAliases: ["klaasen"],
    country: "South Africa",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL", "SA20"],
    searchableName: "heinrich klaasen"
  },
  {
    id: "aiden-markram",
    canonicalName: "Aiden Markram",
    acceptedAliases: ["markram"],
    country: "South Africa",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL", "SA20"],
    searchableName: "aiden markram"
  },
  {
    id: "keshav-maharaj",
    canonicalName: "Keshav Maharaj",
    acceptedAliases: ["maharaj"],
    country: "South Africa",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "SA20"],
    searchableName: "keshav maharaj"
  },
  {
    id: "tabraiz-shamsi",
    canonicalName: "Tabraiz Shamsi",
    acceptedAliases: ["shamsi"],
    country: "South Africa",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL", "SA20"],
    searchableName: "tabraiz shamsi"
  },
  {
    id: "marco-jansen",
    canonicalName: "Marco Jansen",
    acceptedAliases: ["jansen"],
    country: "South Africa",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL", "SA20"],
    searchableName: "marco jansen"
  },
  {
    id: "morne-morkel",
    canonicalName: "Morne Morkel",
    acceptedAliases: ["morkel"],
    country: "South Africa",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "morne morkel"
  },

  // ================= WEST INDIES =================
  {
    id: "brian-lara",
    canonicalName: "Brian Lara",
    acceptedAliases: ["lara", "prince of trinidad"],
    country: "West Indies",
    role: "Batter",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "brian lara"
  },
  {
    id: "chris-gayle",
    canonicalName: "Chris Gayle",
    acceptedAliases: ["gayle", "universe boss"],
    country: "West Indies",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL", "CPL"],
    searchableName: "chris gayle"
  },
  {
    id: "viv-richards",
    canonicalName: "Viv Richards",
    acceptedAliases: ["vivian richards", "viv", "master blaster viv"],
    country: "West Indies",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "viv richards"
  },
  {
    id: "clive-lloyd",
    canonicalName: "Clive Lloyd",
    acceptedAliases: ["lloyd", "big c"],
    country: "West Indies",
    role: "Batter",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "clive lloyd"
  },
  {
    id: "malcolm-marshall",
    canonicalName: "Malcolm Marshall",
    acceptedAliases: ["marshall"],
    country: "West Indies",
    role: "Bowler",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "malcolm marshall"
  },
  {
    id: "curtly-ambrose",
    canonicalName: "Curtly Ambrose",
    acceptedAliases: ["ambrose"],
    country: "West Indies",
    role: "Bowler",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "curtly ambrose"
  },
  {
    id: "courtney-walsh",
    canonicalName: "Courtney Walsh",
    acceptedAliases: ["walsh"],
    country: "West Indies",
    role: "Bowler",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "courtney walsh"
  },
  {
    id: "michael-holding",
    canonicalName: "Michael Holding",
    acceptedAliases: ["holding", "whispering death"],
    country: "West Indies",
    role: "Bowler",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "michael holding"
  },
  {
    id: "garfield-sobers",
    canonicalName: "Garfield Sobers",
    acceptedAliases: ["sobers", "gary sobers"],
    country: "West Indies",
    role: "All-rounder",
    era: "Classic",
    format: ["Test"],
    searchableName: "garfield sobers"
  },
  {
    id: "shivnarine-chanderpaul",
    canonicalName: "Shivnarine Chanderpaul",
    acceptedAliases: ["chanderpaul", "shiv"],
    country: "West Indies",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI"],
    searchableName: "shivnarine chanderpaul"
  },
  {
    id: "dwayne-bravo",
    canonicalName: "Dwayne Bravo",
    acceptedAliases: ["bravo", "dj bravo"],
    country: "West Indies",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL", "CPL"],
    searchableName: "dwayne bravo"
  },
  {
    id: "kieron-pollard",
    canonicalName: "Kieron Pollard",
    acceptedAliases: ["pollard", "polly"],
    country: "West Indies",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL", "CPL"],
    searchableName: "kieron pollard"
  },
  {
    id: "andre-russell",
    canonicalName: "Andre Russell",
    acceptedAliases: ["russell", "dre russ"],
    country: "West Indies",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL", "CPL"],
    searchableName: "andre russell"
  },
  {
    id: "sunil-narine",
    canonicalName: "Sunil Narine",
    acceptedAliases: ["narine"],
    country: "West Indies",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL", "CPL"],
    searchableName: "sunil narine"
  },
  {
    id: "nicholas-pooran",
    canonicalName: "Nicholas Pooran",
    acceptedAliases: ["pooran", "nicky p"],
    country: "West Indies",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL", "CPL"],
    searchableName: "nicholas pooran"
  },
  {
    id: "shimron-hetmyer",
    canonicalName: "Shimron Hetmyer",
    acceptedAliases: ["hetmyer"],
    country: "West Indies",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL", "CPL"],
    searchableName: "shimron hetmyer"
  },
  {
    id: "shai-hope",
    canonicalName: "Shai Hope",
    acceptedAliases: ["hope"],
    country: "West Indies",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "shai hope"
  },
  {
    id: "jason-holder",
    canonicalName: "Jason Holder",
    acceptedAliases: ["holder"],
    country: "West Indies",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL", "CPL"],
    searchableName: "jason holder"
  },
  {
    id: "alzarri-joseph",
    canonicalName: "Alzarri Joseph",
    acceptedAliases: ["alzarri"],
    country: "West Indies",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL", "CPL"],
    searchableName: "alzarri joseph"
  },

  // ================= NEW ZEALAND =================
  {
    id: "kane-williamson",
    canonicalName: "Kane Williamson",
    acceptedAliases: ["williamson", "kane"],
    country: "New Zealand",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "kane williamson"
  },
  {
    id: "brendon-mccullum",
    canonicalName: "Brendon McCullum",
    acceptedAliases: ["mccullum", "baz"],
    country: "New Zealand",
    role: "Wicketkeeper-Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "brendon mccullum"
  },
  {
    id: "ross-taylor",
    canonicalName: "Ross Taylor",
    acceptedAliases: ["taylor", "ross"],
    country: "New Zealand",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "ross taylor"
  },
  {
    id: "martin-guptill",
    canonicalName: "Martin Guptill",
    acceptedAliases: ["guptill", "guppy"],
    country: "New Zealand",
    role: "Batter",
    era: "2010s",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "martin guptill"
  },
  {
    id: "daniel-vettori",
    canonicalName: "Daniel Vettori",
    acceptedAliases: ["vettori", "dan"],
    country: "New Zealand",
    role: "All-rounder",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "daniel vettori"
  },
  {
    id: "shane-bond",
    canonicalName: "Shane Bond",
    acceptedAliases: ["bond"],
    country: "New Zealand",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI"],
    searchableName: "shane bond"
  },
  {
    id: "trent-boult",
    canonicalName: "Trent Boult",
    acceptedAliases: ["boult", "boulty"],
    country: "New Zealand",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "trent boult"
  },
  {
    id: "tim-southee",
    canonicalName: "Tim Southee",
    acceptedAliases: ["southee"],
    country: "New Zealand",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "tim southee"
  },
  {
    id: "richard-hadlee",
    canonicalName: "Richard Hadlee",
    acceptedAliases: ["hadlee", "paddles"],
    country: "New Zealand",
    role: "All-rounder",
    era: "Classic",
    format: ["Test", "ODI"],
    searchableName: "richard hadlee"
  },
  {
    id: "devon-conway",
    canonicalName: "Devon Conway",
    acceptedAliases: ["conway"],
    country: "New Zealand",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "devon conway"
  },
  {
    id: "daryl-mitchell",
    canonicalName: "Daryl Mitchell",
    acceptedAliases: ["d mitchell"],
    country: "New Zealand",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "daryl mitchell"
  },
  {
    id: "rachin-ravindra",
    canonicalName: "Rachin Ravindra",
    acceptedAliases: ["rachin", "ravindra"],
    country: "New Zealand",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "rachin ravindra"
  },
  {
    id: "glenn-phillips",
    canonicalName: "Glenn Phillips",
    acceptedAliases: ["phillips"],
    country: "New Zealand",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "glenn phillips"
  },
  {
    id: "mitchell-santner",
    canonicalName: "Mitchell Santner",
    acceptedAliases: ["santner"],
    country: "New Zealand",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mitchell santner"
  },
  {
    id: "lockie-ferguson",
    canonicalName: "Lockie Ferguson",
    acceptedAliases: ["ferguson", "lockie"],
    country: "New Zealand",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "lockie ferguson"
  },

  // ================= SRI LANKA =================
  {
    id: "sanath-jayasuriya",
    canonicalName: "Sanath Jayasuriya",
    acceptedAliases: ["jayasuriya", "matara marauder"],
    country: "Sri Lanka",
    role: "All-rounder",
    era: "1990s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "sanath jayasuriya"
  },
  {
    id: "kumar-sangakkara",
    canonicalName: "Kumar Sangakkara",
    acceptedAliases: ["sangakkara", "sanga"],
    country: "Sri Lanka",
    role: "Wicketkeeper-Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "kumar sangakkara"
  },
  {
    id: "mahela-jayawardene",
    canonicalName: "Mahela Jayawardene",
    acceptedAliases: ["jayawardene", "mahela"],
    country: "Sri Lanka",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mahela jayawardene"
  },
  {
    id: "muttiah-muralitharan",
    canonicalName: "Muttiah Muralitharan",
    acceptedAliases: ["muralitharan", "murali"],
    country: "Sri Lanka",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "IPL"],
    searchableName: "muttiah muralitharan"
  },
  {
    id: "lasith-malinga",
    canonicalName: "Lasith Malinga",
    acceptedAliases: ["malinga", "slinga malinga"],
    country: "Sri Lanka",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "lasith malinga"
  },
  {
    id: "chaminda-vaas",
    canonicalName: "Chaminda Vaas",
    acceptedAliases: ["vaas"],
    country: "Sri Lanka",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI"],
    searchableName: "chaminda vaas"
  },
  {
    id: "aravinda-de-silva",
    canonicalName: "Aravinda de Silva",
    acceptedAliases: ["aravinda", "de silva"],
    country: "Sri Lanka",
    role: "Batter",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "aravinda de silva"
  },
  {
    id: "tillakaratne-dilshan",
    canonicalName: "Tillakaratne Dilshan",
    acceptedAliases: ["dilshan", "dilscoop"],
    country: "Sri Lanka",
    role: "Batter",
    era: "2000s",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "tillakaratne dilshan"
  },
  {
    id: "angelo-mathews",
    canonicalName: "Angelo Mathews",
    acceptedAliases: ["mathews"],
    country: "Sri Lanka",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "angelo mathews"
  },
  {
    id: "wanindu-hasaranga",
    canonicalName: "Wanindu Hasaranga",
    acceptedAliases: ["hasaranga", "wanindu"],
    country: "Sri Lanka",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "wanindu hasaranga"
  },
  {
    id: "maheesh-theekshana",
    canonicalName: "Maheesh Theekshana",
    acceptedAliases: ["theekshana"],
    country: "Sri Lanka",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "maheesh theekshana"
  },
  {
    id: "matheesha-pathirana",
    canonicalName: "Matheesha Pathirana",
    acceptedAliases: ["pathirana", "baby malinga"],
    country: "Sri Lanka",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "matheesha pathirana"
  },
  {
    id: "pathum-nissanka",
    canonicalName: "Pathum Nissanka",
    acceptedAliases: ["nissanka"],
    country: "Sri Lanka",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "pathum nissanka"
  },
  {
    id: "kusal-mendis",
    canonicalName: "Kusal Mendis",
    acceptedAliases: ["kusal"],
    country: "Sri Lanka",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "kusal mendis"
  },

  // ================= BANGLADESH =================
  {
    id: "shakib-al-hasan",
    canonicalName: "Shakib Al Hasan",
    acceptedAliases: ["shakib"],
    country: "Bangladesh",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "shakib al hasan"
  },
  {
    id: "tamim-iqbal",
    canonicalName: "Tamim Iqbal",
    acceptedAliases: ["tamim"],
    country: "Bangladesh",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "tamim iqbal"
  },
  {
    id: "mushfiqur-rahim",
    canonicalName: "Mushfiqur Rahim",
    acceptedAliases: ["mushfiqur", "mushi"],
    country: "Bangladesh",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "mushfiqur rahim"
  },
  {
    id: "mustafizur-rahman",
    canonicalName: "Mustafizur Rahman",
    acceptedAliases: ["mustafizur", "the fizz", "fizz"],
    country: "Bangladesh",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mustafizur rahman"
  },
  {
    id: "mashrafe-mortaza",
    canonicalName: "Mashrafe Mortaza",
    acceptedAliases: ["mortaza", "mash"],
    country: "Bangladesh",
    role: "Bowler",
    era: "2000s",
    format: ["Test", "ODI", "T20I"],
    searchableName: "mashrafe mortaza"
  },
  {
    id: "taskin-ahmed",
    canonicalName: "Taskin Ahmed",
    acceptedAliases: ["taskin"],
    country: "Bangladesh",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "taskin ahmed"
  },
  {
    id: "litton-das",
    canonicalName: "Litton Das",
    acceptedAliases: ["litton"],
    country: "Bangladesh",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "litton das"
  },

  // ================= AFGHANISTAN =================
  {
    id: "rashid-khan",
    canonicalName: "Rashid Khan",
    acceptedAliases: ["rashid", "rashid arman"],
    country: "Afghanistan",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "rashid khan"
  },
  {
    id: "mohammad-nabi",
    canonicalName: "Mohammad Nabi",
    acceptedAliases: ["nabi", "the president"],
    country: "Afghanistan",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mohammad nabi"
  },
  {
    id: "mujeeb-ur-rahman",
    canonicalName: "Mujeeb Ur Rahman",
    acceptedAliases: ["mujeeb"],
    country: "Afghanistan",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "mujeeb ur rahman"
  },
  {
    id: "rahmanullah-gurbaz",
    canonicalName: "Rahmanullah Gurbaz",
    acceptedAliases: ["gurbaz"],
    country: "Afghanistan",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "rahmanullah gurbaz"
  },
  {
    id: "fazalhaq-farooqi",
    canonicalName: "Fazalhaq Farooqi",
    acceptedAliases: ["farooqi"],
    country: "Afghanistan",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "fazalhaq farooqi"
  },
  {
    id: "naveen-ul-haq",
    canonicalName: "Naveen-ul-Haq",
    acceptedAliases: ["naveen"],
    country: "Afghanistan",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "naveen-ul-haq"
  },

  // ================= ZIMBABWE & IRELAND =================
  {
    id: "andy-flower",
    canonicalName: "Andy Flower",
    acceptedAliases: ["a flower"],
    country: "Zimbabwe",
    role: "Wicketkeeper-Batter",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "andy flower"
  },
  {
    id: "grant-flower",
    canonicalName: "Grant Flower",
    acceptedAliases: ["g flower"],
    country: "Zimbabwe",
    role: "All-rounder",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "grant flower"
  },
  {
    id: "heath-streak",
    canonicalName: "Heath Streak",
    acceptedAliases: ["streak"],
    country: "Zimbabwe",
    role: "All-rounder",
    era: "1990s",
    format: ["Test", "ODI"],
    searchableName: "heath streak"
  },
  {
    id: "sikandar-raza",
    canonicalName: "Sikandar Raza",
    acceptedAliases: ["raza"],
    country: "Zimbabwe",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "sikandar raza"
  },
  {
    id: "paul-stirling",
    canonicalName: "Paul Stirling",
    acceptedAliases: ["stirling"],
    country: "Ireland",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "paul stirling"
  },
  {
    id: "kevin-obrien",
    canonicalName: "Kevin O'Brien",
    acceptedAliases: ["o'brien", "obrien"],
    country: "Ireland",
    role: "All-rounder",
    era: "2010s",
    format: ["Test", "ODI", "T20I"],
    searchableName: "kevin o'brien"
  },
  {
    id: "devdutt-padikkal",
    canonicalName: "Devdutt Padikkal",
    acceptedAliases: ["padikkal", "devdutt"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "T20I", "IPL"],
    searchableName: "devdutt padikkal"
  },
  {
    id: "dhruv-jurel",
    canonicalName: "Dhruv Jurel",
    acceptedAliases: ["jurel", "dhruv"],
    country: "India",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "T20I", "IPL"],
    searchableName: "dhruv jurel"
  },
  {
    id: "sarfaraz-khan",
    canonicalName: "Sarfaraz Khan",
    acceptedAliases: ["sarfaraz"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["Test", "IPL"],
    searchableName: "sarfaraz khan"
  },
  {
    id: "akash-deep",
    canonicalName: "Akash Deep",
    acceptedAliases: ["akash"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "IPL"],
    searchableName: "akash deep"
  },
  {
    id: "nitish-kumar-reddy",
    canonicalName: "Nitish Kumar Reddy",
    acceptedAliases: ["nitish reddy", "nitish", "nk reddy"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "nitish kumar reddy"
  },
  {
    id: "harshit-rana",
    canonicalName: "Harshit Rana",
    acceptedAliases: ["harshit", "rana"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["IPL"],
    searchableName: "harshit rana"
  },
  {
    id: "mayank-yadav",
    canonicalName: "Mayank Yadav",
    acceptedAliases: ["mayank yadav"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "mayank yadav"
  },
  {
    id: "ramandeep-singh",
    canonicalName: "Ramandeep Singh",
    acceptedAliases: ["ramandeep"],
    country: "India",
    role: "All-rounder",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "ramandeep singh"
  },
  {
    id: "sai-sudharsan",
    canonicalName: "Sai Sudharsan",
    acceptedAliases: ["sudharsan", "sai"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "sai sudharsan"
  },
  {
    id: "rahul-tripathi",
    canonicalName: "Rahul Tripathi",
    acceptedAliases: ["tripathi"],
    country: "India",
    role: "Batter",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "rahul tripathi"
  },
  {
    id: "t-natarajan",
    canonicalName: "T Natarajan",
    acceptedAliases: ["natarajan", "nattu"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "t natarajan"
  },
  {
    id: "sandeep-sharma",
    canonicalName: "Sandeep Sharma",
    acceptedAliases: ["sandeep"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "sandeep sharma"
  },
  {
    id: "mohit-sharma",
    canonicalName: "Mohit Sharma",
    acceptedAliases: ["mohit"],
    country: "India",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "mohit sharma"
  },
  {
    id: "travis-head",
    canonicalName: "Travis Head",
    acceptedAliases: ["head", "travis"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "travis head"
  },
  {
    id: "mitchell-marsh",
    canonicalName: "Mitchell Marsh",
    acceptedAliases: ["mitch marsh", "marsh"],
    country: "Australia",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "mitchell marsh"
  },
  {
    id: "usman-khawaja",
    canonicalName: "Usman Khawaja",
    acceptedAliases: ["khawaja", "uzzy"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "usman khawaja"
  },
  {
    id: "cameron-green",
    canonicalName: "Cameron Green",
    acceptedAliases: ["green", "cam green"],
    country: "Australia",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "cameron green"
  },
  {
    id: "marnus-labuschagne",
    canonicalName: "Marnus Labuschagne",
    acceptedAliases: ["labuschagne", "marnus"],
    country: "Australia",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI"],
    searchableName: "marnus labuschagne"
  },
  {
    id: "alex-carey",
    canonicalName: "Alex Carey",
    acceptedAliases: ["carey"],
    country: "Australia",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "alex carey"
  },
  {
    id: "josh-inglis",
    canonicalName: "Josh Inglis",
    acceptedAliases: ["inglis"],
    country: "Australia",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["ODI", "T20I"],
    searchableName: "josh inglis"
  },
  {
    id: "spencer-johnson",
    canonicalName: "Spencer Johnson",
    acceptedAliases: ["spencer"],
    country: "Australia",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "spencer johnson"
  },
  {
    id: "nathan-ellis",
    canonicalName: "Nathan Ellis",
    acceptedAliases: ["ellis"],
    country: "Australia",
    role: "Bowler",
    era: "Modern",
    format: ["T20I", "IPL"],
    searchableName: "nathan ellis"
  },
  {
    id: "gus-atkinson",
    canonicalName: "Gus Atkinson",
    acceptedAliases: ["atkinson"],
    country: "England",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "IPL"],
    searchableName: "gus atkinson"
  },
  {
    id: "shoaib-bashir",
    canonicalName: "Shoaib Bashir",
    acceptedAliases: ["bashir"],
    country: "England",
    role: "Bowler",
    era: "Modern",
    format: ["Test"],
    searchableName: "shoaib bashir"
  },
  {
    id: "rehan-ahmed",
    canonicalName: "Rehan Ahmed",
    acceptedAliases: ["rehan"],
    country: "England",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "rehan ahmed"
  },
  {
    id: "jamie-smith",
    canonicalName: "Jamie Smith",
    acceptedAliases: ["jamie"],
    country: "England",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI"],
    searchableName: "jamie smith"
  },
  {
    id: "phil-salt",
    canonicalName: "Phil Salt",
    acceptedAliases: ["salt"],
    country: "England",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "phil salt"
  },
  {
    id: "will-jacks",
    canonicalName: "Will Jacks",
    acceptedAliases: ["jacks"],
    country: "England",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "will jacks"
  },
  {
    id: "saim-ayub",
    canonicalName: "Saim Ayub",
    acceptedAliases: ["ayub", "saim"],
    country: "Pakistan",
    role: "Batter",
    era: "Modern",
    format: ["Test", "T20I"],
    searchableName: "saim ayub"
  },
  {
    id: "aamer-jamal",
    canonicalName: "Aamer Jamal",
    acceptedAliases: ["jamal"],
    country: "Pakistan",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "T20I"],
    searchableName: "aamer jamal"
  },
  {
    id: "naseem-shah",
    canonicalName: "Naseem Shah",
    acceptedAliases: ["naseem"],
    country: "Pakistan",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "naseem shah"
  },
  {
    id: "abdullah-shafique",
    canonicalName: "Abdullah Shafique",
    acceptedAliases: ["shafique"],
    country: "Pakistan",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI"],
    searchableName: "abdullah shafique"
  },
  {
    id: "gerald-coetzee",
    canonicalName: "Gerald Coetzee",
    acceptedAliases: ["coetzee"],
    country: "South Africa",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "gerald coetzee"
  },
  {
    id: "nandre-burger",
    canonicalName: "Nandre Burger",
    acceptedAliases: ["burger"],
    country: "South Africa",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "nandre burger"
  },
  {
    id: "tristan-stubbs",
    canonicalName: "Tristan Stubbs",
    acceptedAliases: ["stubbs"],
    country: "South Africa",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "tristan stubbs"
  },
  {
    id: "ryan-rickelton",
    canonicalName: "Ryan Rickelton",
    acceptedAliases: ["rickelton"],
    country: "South Africa",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "ryan rickelton"
  },
  {
    id: "rachin-ravindra",
    canonicalName: "Rachin Ravindra",
    acceptedAliases: ["rachin", "ravindra"],
    country: "New Zealand",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "rachin ravindra"
  },
  {
    id: "finn-allen",
    canonicalName: "Finn Allen",
    acceptedAliases: ["allen"],
    country: "New Zealand",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I"],
    searchableName: "finn allen"
  },
  {
    id: "glenn-phillips",
    canonicalName: "Glenn Phillips",
    acceptedAliases: ["phillips"],
    country: "New Zealand",
    role: "All-rounder",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "glenn phillips"
  },
  {
    id: "matt-henry",
    canonicalName: "Matt Henry",
    acceptedAliases: ["henry"],
    country: "New Zealand",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "matt henry"
  },
  {
    id: "pathum-nissanka",
    canonicalName: "Pathum Nissanka",
    acceptedAliases: ["nissanka"],
    country: "Sri Lanka",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "pathum nissanka"
  },
  {
    id: "sadeera-samarawickrama",
    canonicalName: "Sadeera Samarawickrama",
    acceptedAliases: ["samarawickrama"],
    country: "Sri Lanka",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "sadeera samarawickrama"
  },
  {
    id: "dunith-wellalage",
    canonicalName: "Dunith Wellalage",
    acceptedAliases: ["wellalage"],
    country: "Sri Lanka",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I"],
    searchableName: "dunith wellalage"
  },
  {
    id: "matheesha-pathirana",
    canonicalName: "Matheesha Pathirana",
    acceptedAliases: ["pathirana", "baby malinga"],
    country: "Sri Lanka",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "matheesha pathirana"
  },
  {
    id: "dilshan-madushanka",
    canonicalName: "Dilshan Madushanka",
    acceptedAliases: ["madushanka"],
    country: "Sri Lanka",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "dilshan madushanka"
  },
  {
    id: "tanzid-hasan",
    canonicalName: "Tanzid Hasan",
    acceptedAliases: ["tanzid"],
    country: "Bangladesh",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I"],
    searchableName: "tanzid hasan"
  },
  {
    id: "towhid-hridoy",
    canonicalName: "Towhid Hridoy",
    acceptedAliases: ["hridoy"],
    country: "Bangladesh",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I"],
    searchableName: "towhid hridoy"
  },
  {
    id: "rishad-hossain",
    canonicalName: "Rishad Hossain",
    acceptedAliases: ["rishad"],
    country: "Bangladesh",
    role: "Bowler",
    era: "Modern",
    format: ["T20I"],
    searchableName: "rishad hossain"
  },
  {
    id: "shoriful-islam",
    canonicalName: "Shoriful Islam",
    acceptedAliases: ["shoriful"],
    country: "Bangladesh",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "shoriful islam"
  },
  {
    id: "tanzim-hasan-sakib",
    canonicalName: "Tanzim Hasan Sakib",
    acceptedAliases: ["tanzim"],
    country: "Bangladesh",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I"],
    searchableName: "tanzim hasan sakib"
  },
  {
    id: "shamar-joseph",
    canonicalName: "Shamar Joseph",
    acceptedAliases: ["shamar"],
    country: "West Indies",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "T20I", "IPL"],
    searchableName: "shamar joseph"
  },
  {
    id: "alick-athanaze",
    canonicalName: "Alick Athanaze",
    acceptedAliases: ["athanaze"],
    country: "West Indies",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI"],
    searchableName: "alick athanaze"
  },
  {
    id: "brandon-king",
    canonicalName: "Brandon King",
    acceptedAliases: ["brandon"],
    country: "West Indies",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I"],
    searchableName: "brandon king"
  },
  {
    id: "sherfane-rutherford",
    canonicalName: "Sherfane Rutherford",
    acceptedAliases: ["rutherford"],
    country: "West Indies",
    role: "Batter",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "sherfane rutherford"
  },
  {
    id: "romario-shepherd",
    canonicalName: "Romario Shepherd",
    acceptedAliases: ["shepherd", "romario"],
    country: "West Indies",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "romario shepherd"
  },
  {
    id: "gudakesh-motie",
    canonicalName: "Gudakesh Motie",
    acceptedAliases: ["motie"],
    country: "West Indies",
    role: "Bowler",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "gudakesh motie"
  },
  {
    id: "noor-ahmad",
    canonicalName: "Noor Ahmad",
    acceptedAliases: ["noor"],
    country: "Afghanistan",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "noor ahmad"
  },
  {
    id: "fazalhaq-farooqi",
    canonicalName: "Fazalhaq Farooqi",
    acceptedAliases: ["farooqi"],
    country: "Afghanistan",
    role: "Bowler",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "fazalhaq farooqi"
  },
  {
    id: "azmatullah-omarzai",
    canonicalName: "Azmatullah Omarzai",
    acceptedAliases: ["omarzai"],
    country: "Afghanistan",
    role: "All-rounder",
    era: "Modern",
    format: ["ODI", "T20I", "IPL"],
    searchableName: "azmatullah omarzai"
  },
  {
    id: "ibrahim-zadran",
    canonicalName: "Ibrahim Zadran",
    acceptedAliases: ["ibrahim"],
    country: "Afghanistan",
    role: "Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I"],
    searchableName: "ibrahim zadran"
  },
  {
    id: "rahmanullah-gurbaz",
    canonicalName: "Rahmanullah Gurbaz",
    acceptedAliases: ["gurbaz"],
    country: "Afghanistan",
    role: "Wicketkeeper-Batter",
    era: "Modern",
    format: ["Test", "ODI", "T20I", "IPL"],
    searchableName: "rahmanullah gurbaz"
  }
];

// Helper: normalize a string by trimming, lowercasing, and stripping punctuation/dots
function normalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanAlpha(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z]/g, '');
}

// Build optimized lookup maps
const EXACT_MAP = new Map();
const ALIAS_MAP = new Map();
const ALPHA_MAP = new Map();

for (const player of CRICKETERS_DATABASE) {
  // Canonical normalized
  const canonNorm = normalize(player.canonicalName);
  const canonAlpha = cleanAlpha(player.canonicalName);
  EXACT_MAP.set(canonNorm, player);
  ALPHA_MAP.set(canonAlpha, player);

  // Searchable
  const searchNorm = normalize(player.searchableName);
  if (searchNorm) EXACT_MAP.set(searchNorm, player);

  // Aliases
  if (Array.isArray(player.acceptedAliases)) {
    for (const alias of player.acceptedAliases) {
      const aliasNorm = normalize(alias);
      const aliasAlpha = cleanAlpha(alias);
      if (aliasNorm && !ALIAS_MAP.has(aliasNorm)) {
        ALIAS_MAP.set(aliasNorm, player);
      }
      if (aliasAlpha && !ALPHA_MAP.has(aliasAlpha)) {
        ALPHA_MAP.set(aliasAlpha, player);
      }
    }
  }
}

/**
 * Resolves any input query (full name, first name, surname, or nickname)
 * to a verified cricketer record if recognized.
 *
 * @param {string} inputName
 * @returns {{ found: boolean, player?: typeof CRICKETERS_DATABASE[0] }}
 */
function findCricketer(inputName) {
  if (!inputName || typeof inputName !== 'string') return { found: false };

  const norm = normalize(inputName);
  const alpha = cleanAlpha(inputName);
  if (!norm || !alpha) return { found: false };

  // 1. Direct canonical match
  if (EXACT_MAP.has(norm)) {
    return { found: true, player: EXACT_MAP.get(norm) };
  }

  // 2. Direct alias match
  if (ALIAS_MAP.has(norm)) {
    return { found: true, player: ALIAS_MAP.get(norm) };
  }

  // 3. Letters-only match
  if (ALPHA_MAP.has(alpha)) {
    return { found: true, player: ALPHA_MAP.get(alpha) };
  }

  // 4. Fuzzy fallback for common prefix / single word match
  // (e.g. "abhishek" matching "Abhishek Sharma", "bumrah" matching "Jasprit Bumrah")
  for (const player of CRICKETERS_DATABASE) {
    const pCanon = normalize(player.canonicalName);
    const words = pCanon.split(' ');
    // Match first name or last name exactly if input length >= 3
    if (norm.length >= 3) {
      if (words[0] === norm || words[words.length - 1] === norm) {
        return { found: true, player };
      }
    }
  }

  return { found: false };
}

module.exports = {
  CRICKETERS_DATABASE,
  findCricketer,
  cleanAlpha
};

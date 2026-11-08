// server/games/cricketersAtlasEngine.js

const RAW_CRICKETERS = [
  // A
  'aamer sohail', 'aakash chopra', 'aaron finch', 'aaron hardie', 'ab de villiers', 'abd',
  'abhishek sharma', 'abid ali', 'adam gilchrist', 'adam voges', 'adam zampa', 'adil rashid',
  'aiden markram', 'ajay jadeja', 'ajinkya rahane', 'ajit agarkar', 'akash deep', 'akash madhwal',
  'akila dananjaya', 'alastair cook', 'alan border', 'alec stewart', 'alex carey', 'alex hales',
  'alex lees', 'allan border', 'allan donald', 'allan lamb', 'alviro petersen', 'alvin kallicharran',
  'aly-khan', 'alyssa healy', 'alzarri joseph', 'ambati rayudu', 'amelia kerr', 'amit mishra',
  'amol muzumdar', 'andre adams', 'andre fletcher', 'andre nel', 'andre russell', 'andrew flintoff',
  'andrew hall', 'andrew jones', 'andrew mcdonald', 'andrew strauss', 'andrew symonds', 'andrew tye',
  'andy bichel', 'andy flower', 'andy roberts', 'angelo mathews', 'anil kumble', 'anrich nortje',
  'anshuman gaekwad', 'anton devcich', 'anwar ali', 'anya shrubsole', 'aravinda de silva',
  'arjuna ranatunga', 'arshdeep singh', 'arshdeep', 'asad shafiq', 'asghar afghan', 'ashish nehra',
  'ashleigh gardner', 'ashley giles', 'ashton agar', 'ashton turner', 'asif ali', 'asif iqbal',
  'ashwin', 'avesh khan', 'azam khan', 'azhar ali', 'azhar mahmood', 'azmatullah omarzai',

  // B
  'babar azam', 'babar', 'badrinath subramaniam', 'balaji', 'lakshmipathy balaji', 'barry richards',
  "basil d'oliveira", 'ben cutting', 'ben duckett', 'ben foakes', 'ben hilfenhaus', 'ben stokes',
  'stokes', 'benny howell', 'bernard julien', 'beth mooney', 'bharat arun', 'bhuvneshwar kumar',
  'bhuvi', 'bill lawry', 'bill ponsford', 'billy bowden', 'billy stanlake', 'bishen singh bedi',
  'bishan singh bedi', 'bj watling', 'bob simpson', 'bob taylor', 'bob willis', 'bobby simpson',
  'brad haddin', 'brad hodge', 'brad hogg', 'bradley wheeler', 'brandon king', 'brendan taylor',
  'brendon mccullum', 'brett lee', 'brian lara', 'lara', 'brian mcmillan', 'brydon carse',
  'bruce reid', 'bumrah', 'jasprit bumrah',

  // C
  'cameron bancroft', 'cameron green', 'cameron white', 'carl hooper', 'carlos brathwaite',
  'chamari athapaththu', 'chaminda vaas', 'chandika hathurusingha', 'bs chandrasekhar',
  'chamu chibhabha', 'charith asalanka', 'chetan chauhan', 'chetan sakariya', 'chetan sharma',
  'cheteshwar pujara', 'pujara', 'chris cairns', 'chris gayle', 'gayle', 'chris harris',
  'chris jordan', 'chris lynn', 'chris read', 'chris silverwood', 'chris woakes', 'woakes',
  'ck nayudu', 'clarrie grimmett', 'clive lloyd', 'clive rice', 'colin ackermann', 'colin cowdrey',
  'colin croft', 'colin de grandhomme', 'colin ingram', 'colin munro', 'courtney walsh',
  'craig ervine', 'craig kieswetter', 'craig mcmillan', 'craig overton', 'curtly ambrose',

  // D
  'dale steyn', 'steyn', 'damien fleming', 'damien martyn', 'daniel christian', 'daniel sams',
  'daniel vettori', 'danni wyatt', 'daren powell', 'darren bravo', 'darren gough', 'darren lehmann',
  'darren sammy', 'daryl cullinan', 'daryl mitchell', 'dasun shanaka', 'david boon', 'david gower',
  'david hussey', 'david lloyd', 'david malan', 'dawid malan', 'david miller', 'miller',
  'david steele', 'david warner', 'warner', 'dean elgar', 'dean jones', 'deepak chahar',
  'deepak hooda', 'deepti sharma', 'denis compton', 'dennis amiss', 'dennis lillee',
  'devdutt padikkal', 'devendra bishoo', 'devon conway', 'devon malcolm', 'dhoni', 'ms dhoni',
  'mahendra singh dhoni', 'msd', 'dhruv jurel', 'dilip doshi', 'dilip vengsarkar', 'dilshan madushanka',
  'dimuth karunaratne', 'dinesh chandimal', 'dinesh karthik', 'dk', 'dinesh mongia', 'dirk nannes',
  'dominic cork', 'dominic sibley', 'don bradman', 'bradman', 'doug bracewell', 'doug bollinger',
  'doug walters', 'duncan fletcher', 'dwayne bravo', 'dj bravo', 'bravo', 'dwayne smith',

  // E
  'easwaran abhimanyu', 'ed cowan', 'ed joyce', 'eddie paynter', 'eknath solkar', 'elizabeth perry',
  'ellyse perry', 'elton chigumbura', 'eoin morgan', 'morgan', 'erapalli prasanna', 'eric hollies',
  'ernie toshack', 'esmond kentish', 'evin lewis',

  // F
  'faf du plessis', 'du plessis', 'faf', 'fakhar zaman', 'farokh engineer', 'farveez maharoof',
  'fatima sana', 'fawad alam', 'fazal mahmood', 'fazalhaq farooqi', 'fidel edwards', 'finn allen',
  'frank worrell', 'fred spofforth', 'fred trueman', 'freddie flintoff',

  // G
  'gagan khoda', 'gareth batty', 'gary ballance', 'gary cosier', 'gary kirsten', 'gary sobers',
  'sobers', 'gautam gambhir', 'gambhir', 'geoff allott', 'geoff boycott', 'geoff marsh',
  'geoffrey boycott', 'george bailey', 'george headley', 'george lohmann', 'gerald coetzee',
  'glenn maxwell', 'maxwell', 'glenn mcgrath', 'mcgrath', 'glenn phillips', 'gordon greenidge',
  'graeme hick', 'graeme pollock', 'graeme smith', 'graeme swann', 'graham gooch', 'graham thorpe',
  'grant elliott', 'grant flower', 'greg blewett', 'greg chappell', 'greg matthews', 'greg ritchie',
  'gundappa viswanath', 'gus atkinson', 'guy whittall',

  // H
  'habibul bashar', 'haider ali', 'hamid hassan', 'hamilton masakadza', 'hansie cronje',
  'hanuma vihari', 'harbhajan singh', 'harbhajan', 'bhajji', 'hardik pandya', 'hardik', 'pandya',
  'haris rauf', 'harmanpreet kaur', 'harmanpreet', 'harry brook', 'harshal patel', 'harshit rana',
  'hasan ali', 'hasan mahmud', 'hashan tillakaratne', 'hashim amla', 'amla', 'hayden walsh',
  'heath streak', 'heather knight', 'heinrich klaasen', 'klaasen', 'henry nicholls', 'henry olonga',
  'herschelle gibbs', 'hilton cartwright', 'hiten dalal',

  // I
  'ian bell', 'ian bishop', 'ian botham', 'botham', 'ian chappell', 'ian harvey', 'ian healy',
  'ian salisbury', 'ian smith', 'ibrahim zadran', 'iftikhar ahmed', 'ijaz ahmed', 'imad wasim',
  'imam-ul-haq', 'imran khan', 'imran nazir', 'imran tahir', 'tahir', 'imrul kayes', 'inzamam-ul-haq',
  'inzamam', 'inzy', 'irfan pathan', 'isuru udana', 'ishan kishan', 'ishant sharma', 'ishant',
  'ish sodhi',

  // J
  'jack hobbs', 'jack leach', 'jack russell', 'jacob bethell', 'jacob oram', 'jacques kallis',
  'kallis', 'jacques rudolph', 'jade dernbach', 'jake fraser-mcgurk', 'james anderson', 'anderson',
  'jimmy anderson', 'james faulkner', 'james franklin', 'james harris', 'james neesham', 'jimmy neesham',
  'james taylor', 'james vince', 'jamie overton', 'jamie smith', 'jason behrendorff', 'jason gillespie',
  'jason holder', 'jason roy', 'jasprit bumrah', 'javagal srinath', 'javed miandad', 'miandad',
  'jayant yadav', 'jaydev unadkat', 'jemimah rodrigues', 'jemimah', 'jess jonassen', 'jhulan goswami',
  'jitesh sharma', 'joe denly', 'joe root', 'root', 'joel garner', 'jofra archer', 'archer',
  'johan botha', 'john bracewell', 'john emburey', 'john hastings', 'john snow', 'john wright',
  'jonny bairstow', 'bairstow', 'jonathan trott', 'trott', 'jonty rhodes', 'rhodes', 'jos buttler',
  'buttler', 'josh hazlewood', 'hazlewood', 'josh inglis', 'josh philippe', 'joshua da silva',
  'jp duminy', 'duminy', 'justin kemp', 'justin langer',

  // K
  'kabir ali', 'kagiso rabada', 'rabada', 'kamindu mendis', 'kamran akmal', 'kane richardson',
  'kane williamson', 'williamson', 'kapil dev', 'karan sharma', 'karn sharma', 'karun nair',
  'kashvee gautam', 'kasun rajitha', 'kaushal silva', 'keacy carty', 'keith arthurton',
  'keith miller', 'kemar roach', 'ken barrington', 'ken rutherford', 'kepler wessels',
  'keshav maharaj', 'maharaj', 'kevin pietersen', 'pietersen', 'kp', 'khaleel ahmed',
  'kieron pollard', 'pollard', 'kim hughes', 'kiran more', 'kirk edwards', 'kl rahul', 'rahul',
  'krishnamachari srikkanth', 'kris srikkanth', 'krunal pandya', 'kuldeep sen', 'kuldeep yadav',
  'kuldeep', 'kumar dharmasena', 'kumar sangakkara', 'sangakkara', 'sanga', 'kusal mendis',
  'kusal perera', 'kyle abbott', 'kyle coetzer', 'kyle hope', 'kyle jamieson', 'kyle mayers',

  // L
  'lakshmipathy balaji', 'lala amarnath', 'lance cairns', 'lance gibbs', 'lance klusener',
  'klusener', 'lasith malinga', 'malinga', 'laura wolvaardt', 'lawrence rowe', 'lea tahuhu',
  'lendl simmons', 'len hutton', 'liam dawson', 'liam livingstone', 'livingstone', 'liam plunkett',
  'litton das', 'lockie ferguson', 'ferguson', 'lokesh rahul', 'lonwabo tsotsobe', 'lord shardul',
  'lou vincent', 'luke ronchi', 'luke wright', 'lungi ngidi', 'ngidi',

  // M
  'madan lal', 'mahela jayawardene', 'jayawardene', 'mahela', 'maheesh theekshana', 'theekshana',
  'mahendra singh dhoni', 'mahmudullah', 'makhaya ntini', 'ntini', 'malcolm marshall',
  'mandeepsingh', 'manan vohra', 'manish pandey', 'manoj prabhakar', 'manoj tiwary',
  'mansoor ali khan pataudi', 'marcus north', 'marcus stoinis', 'stoinis', 'marcus trescothick',
  'marizanne kapp', 'mark boucher', 'boucher', 'mark butcher', 'mark chapman', 'mark greatbatch',
  'mark taylor', 'mark waugh', 'mark wood', 'marlon samuels', 'marnus labuschagne', 'labuschagne',
  'martin crowe', 'martin guptill', 'guptill', 'marvan atapattu', 'mashrafe mortaza', 'matheesha pathirana',
  'pathirana', 'matt henry', 'matt parkinson', 'matt renshaw', 'matthew hayden', 'hayden',
  'matthew hoggard', 'matthew potts', 'matthew wade', 'mayank agarwal', 'mayank markande',
  'mayank yadav', 'meg lanning', 'megan schutt', 'mehidy hasan miraz', 'michael atherton',
  'michael bevan', 'bevan', 'michael bracewell', 'michael clarke', 'clarke', 'michael holding',
  'michael hussey', 'hussey', 'mike hussey', 'michael kasprowicz', 'michael neser', 'michael slater',
  'michael vaughan', 'vaughan', 'migael pretorius', 'misbah-ul-haq', 'misbah', 'mithali raj',
  'mithali', 'mitchell johnson', 'johnson', 'mitchell marsh', 'mitch marsh', 'marsh',
  'mitchell mcclenaghan', 'mitchell santner', 'santner', 'mitchell starc', 'starc', 'moeen ali',
  'mohammad abbas', 'mohammad amir', 'amir', 'mohammad ashraful', 'mohammad azharuddin',
  'mohammad hafeez', 'hafeez', 'mohammad irfan', 'mohammad kaif', 'kaif', 'mohammad nabi',
  'nabi', 'mohammad nawaz', 'mohammad rizwan', 'rizwan', 'mohammad sami', 'mohammad shahzad',
  'mohammad wasim', 'mohammad yousuf', 'yousuf', 'mohammed shami', 'shami', 'mohammed siraj',
  'siraj', 'mohinder amarnath', 'moin khan', 'mominul haque', 'monty panesar', 'morne morkel',
  'morkel', 'mornantau hayward', 'mudassar nazar', 'mujeeb ur rahman', 'mukesh choudhary',
  'mukesh kumar', 'munaf patel', 'murali vijay', 'muttiah muralitharan', 'muralitharan',
  'murali', 'mushfiqur rahim', 'mushfiqur', 'musheer khan', 'mustafizur rahman', 'mustafizur',

  // N
  'najmul hossain shanto', 'naman ojha', 'nandre burger', 'nantie hayward', 'nasser hussain',
  'nat sciver-brunt', 'nathan astle', 'nathan bracken', 'nathan coulter-nile', 'nathan lyon',
  'lyon', 'nathan mccullum', 'navdeep saini', 'naveen-ul-haq', 'nayan mongia', 'neil harvey',
  'neil johnson', 'neil mckenzie', 'neil wagner', 'nicholas pooran', 'pooran', 'nick knight',
  'nicky boje', 'nida dar', 'nigel llong', 'nikhil chopra', 'niroshan dickwella', 'nitish kumar reddy',
  'nitish reddy', 'nitish rana', 'noor ahmad', 'nuwan kulasekara', 'nuwan pradeep', 'nuwan thushara',

  // O
  'obed mccoy', 'oliver hannon-dalby', 'ollie pope', 'pope', 'ollie robinson', 'omar phillips',
  'ottis gibson', 'owais shah',

  // P
  'paddy upton', 'pankaj dharmani', 'pankaj singh', 'parthiv patel', 'pat cummins', 'cummins',
  'patrick patterson', 'paul adams', 'paul collingwood', 'paul harris', 'paul reiffel',
  'paul stirling', 'peter handscomb', 'peter kirsten', 'peter nevill', 'peter siddle',
  'peter sleepy', 'phil defreitas', 'phil hughes', 'phil mustard', 'phil salt', 'salt',
  'phillip hughes', 'phillip simmons', 'piyush chawla', 'chawla', 'pooja vastrakar', 'poonam yadav',
  'prabath jayasuriya', 'pradeep sangwan', 'pragyan ojha', 'prasidh krishna', 'prashant chopra',
  'praveen amre', 'praveen kumar', 'prithvi shaw',

  // Q
  'qais ahmad', 'qasim akram', 'quinton de kock', 'de kock',

  // R
  'rachael haynes', 'rachin ravindra', 'ravindra', 'radha yadav', 'rahkeem cornwall', 'rahul chahar',
  'rahul dravid', 'dravid', 'rahul tewatia', 'tewatia', 'rahul tripathi', 'rajat bhatia',
  'rajat patidar', 'patidar', 'rajesh chauhan', 'rajeshwari gayakwad', 'ramesh powar',
  'ramiz raja', 'ramnaresh sarwan', 'sarwan', 'rangana herath', 'herath', 'rashid khan',
  'rashid', 'rashid latif', 'rassie van der dussen', 'van der dussen', 'ravi bishnoi',
  'ravi bopara', 'ravi rampaul', 'ravi shastri', 'shastri', 'ravichandran ashwin', 'ashwin',
  'ravindra jadeja', 'jadeja', 'jaddu', 'ray lindwall', 'reece topley', 'reeza hendricks',
  'renuka singh', 'richa ghosh', 'richard hadlee', 'hadlee', 'richard illingworth', 'ricky ponting',
  'ponting', 'rilee rossouw', 'riley meredith', 'rinku singh', 'rinku', 'rishabh pant',
  'pant', 'rishad hossain', 'robin peterson', 'robin singh', 'robin uthappa', 'uthappa',
  'rodney hogg', 'rodney marsh', 'roger binny', 'rohan kanhai', 'rohit sharma', 'rohit',
  'hitman', 'romario shepherd', 'romesh kaluwitharana', 'rory burns', 'roshan mahanama',
  'ross taylor', 'roston chase', 'rovman powell', 'rp singh', 'rudra pratap singh',
  'ruturaj gaikwad', 'gaikwad', 'ryan harris', 'ryan rickelton', 'ryan sidebottom',
  'ryan ten doeschate',

  // S
  's sreesanth', 'sreesanth', 'saba karim', 'sachin tendulkar', 'sachin', 'tendulkar',
  'saeed ajmal', 'ajmal', 'saeed anwar', 'anwar', 'sai kishore', 'sai sudharsan', 'saim ayub',
  'sakibul gani', 'saleem malik', 'salman ali agha', 'salman butt', 'sam billings', 'sam curran',
  'curran', 'sam heazlett', 'sam konstas', 'samit patel', 'sandeep lamichhane', 'sandeep sharma',
  'sandeep warrier', 'sanath jayasuriya', 'jayasuriya', 'sanjay bangar', 'sanjay manjrekar',
  'sanju samson', 'samson', 'sarfaraz ahmed', 'sarfaraz khan', 'sarfraz nawaz', 'saurabh netravalkar',
  'saurabh tiwary', 'scott boland', 'scott edwards', 'scott styris', 'sean abbott', 'sean dickson',
  'sean ervine', 'sean williams', 'shabnim ismail', 'shafali verma', 'shahbaz ahmed',
  'shahbaz nadeem', 'shaheen afridi', 'shaheen shah afridi', 'shaheen', 'shahid afridi',
  'afridi', 'shai hope', 'shakib al hasan', 'shakib', 'shamar joseph', 'shane bond', 'bond',
  'shane dowrich', 'shane warne', 'warne', 'shane watson', 'watson', 'watto', 'shardul thakur',
  'sharjeel khan', 'shaun marsh', 'shaun pollock', 'pollard', 'shaun tait', 'shikhar dhawan',
  'dhawan', 'gabbar', 'shimron hetmyer', 'hetmyer', 'shivam dube', 'dube', 'shivam mavi',
  'shivam sharma', 'shoaib akhtar', 'akhtar', 'shoaib bashir', 'shoaib malik', 'shreyas gopal',
  'shreyas iyer', 'iyer', 'shubman gill', 'gill', 'sikandar raza', 'simon doull', 'simon jones',
  'simon katich', 'smriti mandhana', 'mandhana', 'sobers', 'sohail khan', 'sohail tanvir',
  'sophie devine', 'sophie ecclestone', 'sophie molineux', 'soumya sarkar', 'sourav ganguly',
  'ganguly', 'dada', 'spencer johnson', 'stephen fleming', 'fleming', 'steve harmison',
  'steve o\'keefe', 'steve smith', 'smith', 'steve waugh', 'steven finn', 'stuart binny',
  'stuart broad', 'broad', 'stuart clark', 'stuart law', 'stuart macgill', 'subramaniam badrinath',
  'sunil gavaskar', 'gavaskar', 'sunny', 'sunil narine', 'narine', 'sune luus', 'suranga lakmal',
  'suresh raina', 'raina', 'suryakumar yadav', 'sky', 'surya', 'suzie bates', 'swapnil singh',
  'syed kirmani',

  // T
  'tabraiz shamsi', 'shamsi', 'tahlia mcgrath', 'tamim iqbal', 'tanush kotian', 'tareq aziz',
  'taskin ahmed', 'temba bavuma', 'bavuma', 'tendai chatara', 'thami tsolekile', 'theunis de bruyn',
  'tilak varma', 'tillakaratne dilshan', 'dilshan', 'tim david', 'tim paine', 'tim seifert',
  'tim southee', 'southee', 'todd murphy', 'tom banton', 'tom blundell', 'tom curran', 'tom hartley',
  'tom latham', 'latham', 'tom moody', 'tony greig', 'towhid hridoy', 'travis burt', 'travis head',
  'head', 'trent boult', 'boult', 'tristan stubbs', 'stubbs', 'tushar deshpande',

  // U
  'umar akmal', 'umar gul', 'umesh yadav', 'umran malik', 'unmukt chand', 'upul chandana',
  'upul tharanga', 'usman khawaja', 'khawaja', 'usman qadir',

  // V
  'vvs laxman', 'laxman', 'varun aaron', 'varun chakravarthy', 'chakravarthy', 'venkatesh iyer',
  'venkatesh prasad', 'vernon philander', 'vijay hazare', 'vijay manjrekar', 'vijay merchant',
  'vijay shankar', 'vikram rathour', 'vinod kambli', 'vinoo mankad', 'virender sehwag', 'sehwag',
  'viru', 'virat kohli', 'kohli', 'cheeku', 'viv richards', 'vivian richards',

  // W
  'wahab riaz', 'wally hammond', 'walter hadlee', 'wanindu hasaranga', 'hasaranga', 'waqar younis',
  'waqar', 'washington sundar', 'wasim akram', 'wasim', 'wasim jaffer', 'wayne parnell',
  'wayne phillips', 'wesley barresi', 'will jacks', 'jacks', 'will pucovski', 'will young',
  'william porterfield', 'wriddhiman saha', 'saha',

  // X
  'xavier bartlett', 'xavier doherty', 'xavier marshall',

  // Y
  'yash dayal', 'yash dhull', 'yashasvi jaiswal', 'jaiswal', 'yasir arafat', 'yasir shah',
  'younis khan', 'yousuf youhana', 'yuvraj singh', 'yuvraj', 'yuvi', 'yusuf pathan',
  'yuzvendra chahal', 'chahal',

  // Z
  'zaheer abbas', 'zaheer khan', 'zaheer', 'zak crawley', 'zakir hasan', 'zaman khan',
  'zeeshan maqsood', 'zubair hamza', 'zulfiqar babar'
];

// Build Set of known cricketer names (all lowercase)
const KNOWN_CRICKETERS = new Set(RAW_CRICKETERS.map(c => c.toLowerCase().trim()));

// Also build Set of letters-only representations for ultra-forgiving lookups (e.g. "abhishekksharma", "msdhoni", "vvs laxman")
const KNOWN_CRICKETERS_ALPHA = new Set(
  RAW_CRICKETERS.map(c => c.toLowerCase().replace(/[^a-z]/g, ''))
);

function getCleanAlpha(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z]/g, '');
}

class CricketersAtlasEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.turnTimerDuration = 30;
    this.timer = null;
    this.considerationTimeout = null;
    this.state = {
      players: room.players.map((p, idx) => ({
        id: p.userId,
        userId: p.userId,
        name: p.name,
        score: p.score || 0,
        timeoutCount: 0,
        isEliminated: false,
        isActive: true
      })),
      currentPlayerIndex: 0,
      // Starts empty so the first player can name ANY cricketer to kick off the chain!
      requiredLetter: '',
      lastPlayedCricketer: '',
      gameHistory: [],
      usedCricketers: [],
      turnTimer: this.turnTimerDuration,
      gameStarted: true,
      gameWinner: '',
      eliminatedMessage: '',
      pendingConsideration: null
    };
  }

  broadcastState() {
    const payload = {
      gameKey: 'CricketersAtlas',
      state: this.state,
      ...this.state
    };
    this.io.to(`game_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`room_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`game_${this.room._id}`).emit('playersUpdate', this.state.players);
    this.io.to(`room_${this.room._id}`).emit('playersUpdate', this.state.players);
  }

  start() {
    this.startTurnTimer();
    this.broadcastState();
  }

  startTurnTimer() {
    if (this.timer) clearInterval(this.timer);
    this.state.turnTimer = this.turnTimerDuration;

    this.timer = setInterval(() => {
      if (this.state.gameWinner) {
        clearInterval(this.timer);
        return;
      }

      this.state.turnTimer -= 1;
      if (this.state.turnTimer <= 0) {
        this.handleTimeout();
      } else {
        this.io.to(`game_${this.room._id}`).emit('timerTick', { turnTimer: this.state.turnTimer });
      }
    }, 1000);
  }

  handleTimeout() {
    const active = this.state.players.filter(p => !p.isEliminated);
    if (active.length <= 1) return;

    const curr = this.state.players[this.state.currentPlayerIndex];
    curr.timeoutCount = (curr.timeoutCount || 0) + 1;

    if (curr.timeoutCount >= 2) {
      curr.isEliminated = true;
      this.state.eliminatedMessage = `${curr.name} has been eliminated for timing out twice!`;
      this.state.gameHistory.push({
        player: curr.name,
        cricketer: '[ELIMINATED - Timed out twice]',
        letter: '',
        nextLetter: '',
        timestamp: new Date().toISOString(),
        isValid: false
      });
    } else {
      this.state.eliminatedMessage = `${curr.name} timed out! (${curr.timeoutCount}/2 timeouts)`;
    }

    this.nextTurn();
  }

  nextTurn() {
    if (this.considerationTimeout) {
      clearTimeout(this.considerationTimeout);
      this.considerationTimeout = null;
    }

    const active = this.state.players.filter(p => !p.isEliminated);
    if (active.length <= 1) {
      if (active.length === 1) {
        this.state.gameWinner = active[0].name;
        this.state.eliminatedMessage = `🎉 ${active[0].name} wins the game!`;
      } else {
        this.state.gameWinner = 'No Winner';
        this.state.eliminatedMessage = 'Game over - no players remaining!';
      }
      if (this.timer) clearInterval(this.timer);
      this.broadcastState();
      return;
    }

    let nextIdx = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    while (this.state.players[nextIdx].isEliminated) {
      nextIdx = (nextIdx + 1) % this.state.players.length;
    }
    this.state.currentPlayerIndex = nextIdx;
    this.state.pendingConsideration = null;
    this.startTurnTimer();
    this.broadcastState();
  }

  handleAction(userId, action, payload, callback) {
    const curr = this.state.players[this.state.currentPlayerIndex];

    if (action === 'submitCricketer') {
      const isMatch = curr.userId === userId || curr.id === userId;
      if (!isMatch) {
        return callback && callback({ error: "Not your turn!" });
      }

      const rawName = (payload.name || payload.cricketer || '').trim();
      if (!rawName) return callback && callback({ error: "Please enter a cricketer name!" });

      const alphaOnly = getCleanAlpha(rawName);
      if (alphaOnly.length < 2) {
        return callback && callback({ error: "Cricketer name must have at least 2 letters!" });
      }

      // First letter & Last letter strictly derived from alphabetic characters
      const firstLetter = alphaOnly.charAt(0);
      const lastLetter = alphaOnly.charAt(alphaOnly.length - 1);

      // Atlas rule: Must start with the required letter (the last letter of previous cricketer)
      if (this.state.requiredLetter && firstLetter !== this.state.requiredLetter.toLowerCase()) {
        return callback && callback({
          error: `Must start with "${this.state.requiredLetter.toUpperCase()}"! (You entered "${rawName}")`
        });
      }

      // Duplicate check (both exact clean and alpha-normalized)
      const cleanLower = rawName.toLowerCase();
      const alreadyUsed = (this.state.usedCricketers && this.state.usedCricketers.some(u => {
        return u.toLowerCase() === cleanLower || getCleanAlpha(u) === alphaOnly;
      })) || this.state.gameHistory.some(m => {
        return m.cricketer.toLowerCase() === cleanLower || getCleanAlpha(m.cricketer) === alphaOnly;
      });

      if (alreadyUsed) {
        return callback && callback({ error: `"${rawName}" has already been used in this game!` });
      }

      // Verification check against rich cricketer dataset
      const isValid = KNOWN_CRICKETERS.has(cleanLower) || KNOWN_CRICKETERS_ALPHA.has(alphaOnly);

      if (isValid) {
        curr.score = (curr.score || 0) + 1;
        // The last letter of THIS cricketer becomes the required starting letter for NEXT player!
        const nextRequiredLetter = lastLetter.toUpperCase();
        this.state.requiredLetter = nextRequiredLetter;
        this.state.lastPlayedCricketer = rawName;

        if (!this.state.usedCricketers) this.state.usedCricketers = [];
        this.state.usedCricketers.push(cleanLower);

        this.state.gameHistory.push({
          player: curr.name,
          cricketer: rawName,
          letter: firstLetter.toUpperCase(),
          nextLetter: nextRequiredLetter,
          timestamp: new Date().toISOString(),
          isValid: true
        });

        this.nextTurn();
        return callback && callback({
          ok: true,
          success: true,
          isValid: true,
          nextLetter: nextRequiredLetter
        });
      } else {
        // Not in verified list -> Put under consideration for opponent/room to accept or reject
        this.state.pendingConsideration = {
          cricketer: rawName,
          firstLetter: firstLetter.toUpperCase(),
          lastLetter: lastLetter.toUpperCase(),
          proposedBy: curr.name,
          proposedById: curr.userId
        };

        // Safety timeout: Auto-accept after 15 seconds if opponents don't respond
        if (this.considerationTimeout) clearTimeout(this.considerationTimeout);
        this.considerationTimeout = setTimeout(() => {
          if (this.state.pendingConsideration && this.state.pendingConsideration.cricketer === rawName) {
            // Auto accept to keep the game moving
            curr.score = (curr.score || 0) + 1;
            this.state.requiredLetter = lastLetter.toUpperCase();
            this.state.lastPlayedCricketer = rawName;
            if (!this.state.usedCricketers) this.state.usedCricketers = [];
            this.state.usedCricketers.push(cleanLower);
            this.state.gameHistory.push({
              player: curr.name,
              cricketer: rawName,
              letter: firstLetter.toUpperCase(),
              nextLetter: lastLetter.toUpperCase(),
              timestamp: new Date().toISOString(),
              isValid: true
            });
            this.state.pendingConsideration = null;
            this.nextTurn();
          }
        }, 15000);

        this.broadcastState();
        return callback && callback({ ok: true, considerationRequired: true });
      }
    }

    if (action === 'voteConsideration') {
      if (!this.state.pendingConsideration) {
        return callback && callback({ error: "No pending consideration" });
      }
      if (this.considerationTimeout) {
        clearTimeout(this.considerationTimeout);
        this.considerationTimeout = null;
      }

      const accept = !!payload.accept;
      const pend = this.state.pendingConsideration;

      this.state.gameHistory.push({
        player: pend.proposedBy,
        cricketer: accept ? pend.cricketer : `${pend.cricketer} [REJECTED]`,
        letter: pend.firstLetter,
        nextLetter: accept ? pend.lastLetter : this.state.requiredLetter,
        timestamp: new Date().toISOString(),
        isValid: accept
      });

      if (accept) {
        curr.score = (curr.score || 0) + 1;
        this.state.requiredLetter = pend.lastLetter;
        this.state.lastPlayedCricketer = pend.cricketer;
        if (!this.state.usedCricketers) this.state.usedCricketers = [];
        this.state.usedCricketers.push(pend.cricketer.toLowerCase());
      }

      this.state.pendingConsideration = null;
      this.nextTurn();
      return callback && callback({ ok: true, success: true });
    }

    if (action === 'restartGame') {
      if (this.room.hostId !== userId) {
        return callback && callback({ error: "Only host can restart game" });
      }
      if (this.considerationTimeout) {
        clearTimeout(this.considerationTimeout);
        this.considerationTimeout = null;
      }
      this.state.players.forEach(p => {
        p.score = 0;
        p.timeoutCount = 0;
        p.isEliminated = false;
      });
      this.state.currentPlayerIndex = 0;
      this.state.requiredLetter = '';
      this.state.lastPlayedCricketer = '';
      this.state.gameHistory = [];
      this.state.usedCricketers = [];
      this.state.gameWinner = '';
      this.state.eliminatedMessage = '';
      this.state.pendingConsideration = null;
      this.start();
      return callback && callback({ ok: true });
    }

    callback && callback({ error: "Unknown action" });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.considerationTimeout) clearTimeout(this.considerationTimeout);
  }
}

module.exports = CricketersAtlasEngine;

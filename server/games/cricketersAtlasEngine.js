// apna-adda-backend/games/cricketersAtlasEngine.js

const KNOWN_CRICKETERS = new Set([
  // A
  'ab de villiers', 'aaron finch', 'aakash chopra', 'aamer sohail', 'abid ali', 'adam gilchrist', 'adam voges', 'adil rashid', 'ajay jadeja', 'ajit agarkar', 'akash deep', 'akila dananjaya', 'alan border', 'alastair cook', 'alex carey', 'alex hales', 'allan donald', 'allan lamb', 'alvin kallicharran', 'ambati rayudu', 'amol muzumdar', 'andre fletcher', 'andre russell', 'andrew flintoff', 'andrew strauss', 'andrew symonds', 'andy flower', 'andy roberts', 'angelo mathews', 'anil kumble', 'anrich nortje', 'anshuman gaekwad', 'anton devcich', 'anwar ali', 'aravinda de silva', 'arjuna ranatunga', 'arshdeep singh', 'ashish nehra', 'ashley giles', 'ashton agar', 'asif ali', 'asif iqbal', 'azam khan', 'azhar ali', 'azhar mahmood', 'mohammad azharuddin',
  // B
  'babar azam', 'badrinath subramaniam', 'balaji r', 'barry richards', "basil d'oliveira", 'ben cutting', 'ben duckett', 'ben hilfenhaus', 'ben stokes', 'benny howell', 'bernard julien', 'bharat arun', 'bharat chipli', 'bharat khanna', 'bhuvneshwar kumar', 'bill lawry', 'bill ponsford', 'billy bowden', 'billy murdoch', 'biswarup das', 'biswajit paul', 'bj watling', 'bob simpson', 'bob taylor', 'bobby simpson', 'brad haddin', 'brad hodge', 'don bradman', 'brendan taylor', 'brian lara', 'brendon mccullum', 'brett lee', 'bruce reid', 'bryce mcgain',
  // C
  'cameron bancroft', 'cameron green', 'cameron white', 'carl hooper', 'carlos brathwaite', 'chaminda vaas', 'chamari athapaththu', 'chandika hathurusingha', 'chandrasekhar bs', 'chamu chibhabha', 'charith asalanka', 'cheteshwar pujara', 'chris cairns', 'chris gayle', 'chris harris', 'chris jordan', 'chris lynn', 'chris silverwood', 'chris woakes', 'chetan chauhan', 'chetan sharma', 'chirag jani', 'clarrie grimmett', 'colin croft', 'colin de grandhomme', 'colin ingram', 'colin munro', 'craig kieswetter', 'craig mcmillan', 'curtly ambrose', 'cyril washbrook',
  // D
  'damien fleming', 'damien martyn', 'dale steyn', 'daljit singh', 'daryl mitchell', 'darren bravo', 'darren gough', 'darren lehmann', 'darren sammy', 'daryll cullinan', 'dasun shanaka', 'dave nourse', 'david boon', 'david gower', 'david hussey', 'david lloyd', 'david miller', 'david warner', 'dean elgar', 'dean jones', 'deepak chahar', 'deepak hooda', 'denis compton', 'dennis lillee', 'devdutt padikkal', 'devendra bishoo', 'devon conway', 'dilip doshi', 'dilip vengsarkar', 'dinesh karthik', 'dinesh mongia', 'dirk nannes', 'dominic cork', 'doug bracewell', 'doug walters', 'doug wright', 'dwayne bravo', 'dwayne smith',
  // E
  'easwaran abhimanyu', 'ed cowan', 'ed joyce', 'eddie paynter', 'eddie st george', 'eknath solkar', 'eoin morgan', 'erapalli prasanna', 'ernest hall', 'eric bedser', 'eric hollies', 'ernie toshack', 'craig ervine', 'esmond kentish', 'evin lewis',
  // F
  'faf du plessis', 'farokh engineer', 'fazal mahmood', 'fazal subhan', 'fawad alam', 'felix mwamba', 'chamara fernando', 'feroz khan', 'fidel edwards', 'finn allen', 'fred spofforth', 'fred trueman',
  // G
  'gagan khoda', 'gajanand singh', 'gareth batty', 'gareth delany', 'gareth hopkins', 'gary ballance', 'gary kirsten', 'gautam gambhir', 'gavin larsen', 'geoff allott', 'geoff boycott', 'geoff marsh', 'geoffrey dujon', 'george bailey', 'george headley', 'george lohmann', 'george worker', 'gerald coetzee', 'gerald gomez', 'glenn maxwell', 'glenn mcgrath', 'glenn phillips', 'graeme hick', 'graeme pollock', 'graeme smith', 'graeme swann', 'grant elliott', 'grant flower', 'greg blewett', 'greg chappell', 'greg matthews', 'greg ritchie', 'gregory stephen',
  // H
  'habibul bashar', 'haider ali', 'hamid hassan', 'hamilton masakadza', 'hamza nadeem', 'hanuma vihari', 'hardik pandya', 'harbhajan singh', 'haris rauf', 'harshal patel', 'hashan tillakaratne', 'hashim amla', 'hasan ali', 'hassan mahmood', 'hayden walsh jr', 'heath streak', 'heinrich klaasen', 'henry olonga', 'henry shipley', 'herschelle gibbs', 'hilton cartwright', 'himanshu rana', 'hitendra thakur', 'hossein zaman',
  // I
  'ian bell', 'ian botham', 'ian chappell', 'ian healy', 'ian redpath', 'ian smith', 'ian trott', 'iftikhar ahmed', 'ijaz ahmed', 'imad wasim', 'imran farhat', 'imran khan', 'imran nazir', 'imrul kayes', 'irfan pathan', 'ish sodhi', 'ishant sharma', 'isuru udana',
  // J
  'jack hobbs', 'jack russell', 'jack leach', 'jack moroney', 'jack ryder', 'jacob oram', 'jacques kallis', 'jade dernbach', 'james anderson', 'james faulkner', 'james franklin', 'james neesham', 'jamie overton', 'jamie siddons', 'javed miandad', 'jayant yadav', 'sanath jayasuriya', 'jaydev unadkat', 'jayesh patel', 'jemimah rodrigues', 'jofra archer', 'johan botha', 'john bracewell', 'john emburey', 'john inverarity', 'john morrison', 'john snow', 'jon holland', 'jonny bairstow', 'jonathan trott', 'jordan cox', 'jos buttler', 'josh hazlewood', 'jp duminy', 'julian weiner', 'justin langer',
  // K
  'kabir ali', 'kagiso rabada', 'mohammad kaif', 'romesh kaluwitharana', 'kamran akmal', 'kamindu mendis', 'kane richardson', 'kane williamson', 'kapil dev', 'karun nair', 'kasigo senamela', 'kasun rajitha', 'kaushal silva', 'keith arthurton', 'keith miller', 'ken barrington', 'ken rutherford', 'kenneth jackson', 'kepler wessels', 'kevin pietersen', 'khaleel ahmed', 'khurram manzoor', 'kieron pollard', 'kim hughes', 'kingsley holgate', 'kirk edwards', 'kl rahul', 'kuldeep yadav', 'kumar sangakkara', 'kuruvilla abeywickrama',
  // L
  'lakshmipathy balaji', 'lalit modi', 'lalit yadav', 'lance cairns', 'lance gibbs', 'lance klusener', 'larry gomes', 'lasith malinga', 'laurence packer', 'lawrence rowe', 'lendl simmons', 'len hutton', 'leslie ames', 'liam dawson', 'liam livingstone', 'liam plunkett', 'lionel cann', 'lionel tennyson', 'lockie ferguson', 'lokesh rahul', 'lonwabo tsotsobe', 'lou vincent', 'louie meyer', 'luke ronchi', 'luke wright',
  // M
  'mahela jayawardene', 'makhaya ntini', 'mal loye', 'malcolm marshall', 'manoj prabhakar', 'manoj tiwary', 'marcus north', 'marcus trescothick', 'mark boucher', 'mark butcher', 'mark greatbatch', 'mark richardson', 'mark taylor', 'mark waugh', 'mark wood', 'marlon samuels', 'martin crowe', 'martin guptill', 'mashrafe mortaza', 'mathew sinclair', 'matthew hayden', 'matthew hoggard', 'matt henry', 'matt renshaw', 'maqsood ahmed', 'mayank agarwal', 'michael bevan', 'michael clarke', 'michael holding', 'michael hussey', 'michael kasprowicz', 'michael slater', 'michael vaughan', 'michael yardy', 'mick lewis', 'mickey arthur', 'migael pretorius', 'milton shumba', 'minhajul abedin', 'misbah-ul-haq', 'mitchell johnson', 'mitchell marsh', 'mitchell mcclenaghan', 'mitchell santner', 'mohammad abbas', 'mohammad amir', 'mohammad ashraful', 'mohammad hafeez', 'mohammad nabi', 'mohammad rizwan', 'mohammad sami', 'mohammad shahzad', 'mohammad shami', 'mohammad yousuf', 'mohinder amarnath', 'moin khan', 'monty panesar', 'morne morkel', 'mujeeb ur rahman', 'mushfiqur rahim', 'mustafizur rahman',
  // N
  'naman ojha', 'nantie hayward', 'nathan astle', 'nathan bracken', 'nathan coulter-nile', 'nathan lyon', 'nathan mccullum', 'nayeem hasan', 'nayan mongia', 'neil harvey', 'neil johnson', 'neil mckenzie', 'neil wagner', 'nicky boje', 'nikhil chopra', 'niroshan dickwella', 'nitish rana', 'norman cowans', "norman o'neill", 'nuwan kulasekara', 'nuwan pradeep',
  // O
  'obed mccoy', 'ollie pope', 'ollie robinson', 'oliver hannon-dalby', 'omar phillips', 'omari banks', 'nigel ormond', 'osanda fernando', 'oscar scott',
  // P
  'paddy upton', 'pankaj singh', 'parthiv patel', 'pat cummins', 'pathum nissanka', 'patrick patterson', 'paul adams', 'paul collingwood', 'paul harris', 'paul reiffel', 'paul stirling', 'percy fender', 'peter handscomb', 'peter kirsten', 'peter nevill', 'peter siddle', 'peter taylor', 'phil defreitas', 'phil hughes', 'phil mustard', 'phillip simmons', 'pierre de bruyn', 'poonam yadav', 'prabath jayasuriya', 'pradeep sangwan', 'pragyam ojha', 'prashanth parameswaran', 'praveen kumar', 'prithvi shaw', 'puran nicholas',
  // Q
  'qais ahmad', 'qasim umar', 'quinton de kock',
  // R
  'rachael haynes', 'rachin ravindra', 'rahul dravid', 'rahul tripathi', 'rajat bhatia', 'rajesh chauhan', 'ramiz raja', 'ramesh powar', 'ramnaresh sarwan', 'rangana herath', 'rashid khan', 'rashid latif', 'rassie van der dussen', 'ravichandran ashwin', 'ravi bopara', 'ravi rampaul', 'ravindra jadeja', 'ray lindwall', 'raymond illingworth', 'reece topley', 'reeza hendricks', 'reginald duff', 'renuka singh', 'reon king', 'rex sellers', 'rhyse tait', 'richard hadlee', 'richard illingworth', 'ricky ponting', 'ridley jacobs', 'rilee rossouw', 'rob quiney', 'robiul islam', 'robin peterson', 'robin singh', 'robin uthappa', 'rodney hogg', 'rodney marsh', 'rohit sharma', 'romario shepherd', 'rory burns', 'ross taylor', 'roston chase', 'ruan de swardt', 'rudra pratap singh', 'rupesh amin', 'ryan harris', 'ryan sidebottom', 'ryan ten doeschate',
  // S
  'saba karim', 'sabbir rahman', 'sachin tendulkar', 'saeed ajmal', 'saeed anwar', 'safyaan sharif', 'sagarika ghatge', 'shahid afridi', 'sajid khan', 'salim malik', 'salman butt', 'sam billings', 'sam curran', 'sam northeast', 'sam robson', 'samit patel', 'sandeep lamichhane', 'sandeep sharma', 'sanjay bangar', 'sanjay manjrekar', 'sarfraz ahmed', 'sarfraz nawaz', 'sarfaraz khan', 'saurabh tiwary', 'sourav ganguly', 'scott boland', 'scott styris', 'sean ervine', 'sean williams', 'shane bond', 'shane dowrich', 'shane warne', 'shane watson', 'shaun marsh', 'shaun pollock', 'shaun tait', 'shafali verma', 'shakib al hasan', 'shane getkate', 'sharjeel khan', 'shaun udal', 'shreyas iyer', 'shubman gill', 'siddarth kaul', 'sikandar raza', 'simon doull', 'simon katich', 'simon kerrigan', 'simon taufel', 'simon topley', 'vivian richards', 'sohail khan', 'sohail tanvir', 'soumya sarkar', 'spencer johnson', 'spinett holgate', 'steve harmison', 'steve smith', 'steve waugh', 'steven finn', "steven o'keefe", 'stuart binny', 'stuart broad', 'stuart clark', 'stuart law', 'suranga lakmal', 'suresh raina', 'suryakumar yadav', 'syed anwar',
  // T
  'tabraiz shamsi', 'tamim iqbal', 'tauseef ahmed', 'temba bavuma', 'tendai chatara', 'thami tsolekile', 'tharindu kaushal', 'theunis de bruyn', 'theo dorff', 'thomas odoyo', 'thushara mirando', 'tillakaratne dilshan', 'tim bresnan', 'tim may', 'tim paine', 'tim seifert', 'tim southee', 'tim van der gugten', 'tom blundell', 'tom latham', 'tom moody', 'tony greig', 'tony lock', 'trevor bayliss', 'trevor chappell', 'trent boult', 'trishan holder', 'trundel baer',
  // U
  'umar akmal', 'umar amin', 'umar gul', 'unmukt chand', 'upul chandana', 'upul tharanga', 'usman afzaal', 'usman khawaja', 'usman salahuddin',
  // V
  'vvs laxman', 'varun aaron', 'varun chakravarthy', 'venkatesh iyer', 'venkatesh prasad', 'vernon philander', 'vidarbha ramesh', 'vijay hazare', 'vijay manjrekar', 'vijay merchant', 'vijay shankar', 'virat kohli', 'vinod kambli', 'vinoth kumar', 'vivek razdan',
  // W
  'waqar younis', 'wahab riaz', 'wally hammond', 'walter hadlee', 'wasim akram', 'wasim jaffer', 'wayne parnell', 'wayne phillips', 'wesley barresi', 'wesley madhevere', 'will pucovski', 'william gilbert grace', 'william porterfield', 'will somerville',
  // X
  'xavier doherty', 'xavier marshall',
  // Y
  'yashasvi jaiswal', 'yasir arafat', 'yasir hameed', 'yasir shah', 'younis khan', 'yusuf pathan',
  // Z
  'zaheer abbas', 'zaheer khan', 'zak crawley', 'zander de bruyn', 'zeeshan maqsood', 'zubair hamza', 'zulfiqar babar'
]);

class CricketersAtlasEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.turnTimerDuration = 30;
    this.timer = null;
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
      requiredLetter: 'S',
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
        timestamp: new Date().toISOString(),
        isValid: false
      });
    } else {
      this.state.eliminatedMessage = `${curr.name} timed out! (${curr.timeoutCount}/2 timeouts)`;
    }

    this.nextTurn();
  }

  nextTurn() {
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
      if (curr.userId !== userId) {
        return callback && callback({ error: "Not your turn!" });
      }
      const rawName = (payload.name || payload.cricketer || '').trim();
      if (!rawName) return callback && callback({ error: "Name required" });

      const clean = rawName.toLowerCase();
      const firstLetter = clean.charAt(0);
      const lastLetter = clean.charAt(clean.length - 1);

      if (this.state.requiredLetter && firstLetter !== this.state.requiredLetter.toLowerCase()) {
        return callback && callback({ error: `Must start with "${this.state.requiredLetter.toUpperCase()}"` });
      }

      const alreadyUsed = (this.state.usedCricketers && this.state.usedCricketers.includes(clean)) ||
        this.state.gameHistory.some(m => m.cricketer.toLowerCase() === clean);
      if (alreadyUsed) {
        return callback && callback({ error: "This cricketer has already been used!" });
      }

      // Check valid
      const isValid = KNOWN_CRICKETERS.has(clean);

      if (isValid) {
        curr.score = (curr.score || 0) + 1;
        this.state.requiredLetter = lastLetter.toUpperCase();
        if (!this.state.usedCricketers) this.state.usedCricketers = [];
        this.state.usedCricketers.push(clean);
        this.state.gameHistory.push({
          player: curr.name,
          cricketer: rawName,
          letter: firstLetter.toUpperCase(),
          timestamp: new Date().toISOString(),
          isValid: true
        });
        this.nextTurn();
        return callback && callback({ ok: true, success: true, isValid: true });
      } else {
        // Not in official database -> consideration
        this.state.pendingConsideration = {
          cricketer: rawName,
          firstLetter: firstLetter.toUpperCase(),
          lastLetter: lastLetter.toUpperCase(),
          proposedBy: curr.name,
          proposedById: curr.userId
        };
        this.broadcastState();
        return callback && callback({ ok: true, considerationRequired: true });
      }
    }

    if (action === 'voteConsideration') {
      if (!this.state.pendingConsideration) {
        return callback && callback({ error: "No pending consideration" });
      }
      const accept = !!payload.accept;
      const pend = this.state.pendingConsideration;

      this.state.gameHistory.push({
        player: pend.proposedBy,
        cricketer: accept ? pend.cricketer : `${pend.cricketer} [REJECTED]`,
        letter: pend.firstLetter,
        timestamp: new Date().toISOString(),
        isValid: accept
      });

      if (accept) {
        curr.score = (curr.score || 0) + 1;
        this.state.requiredLetter = pend.lastLetter;
      }
      this.state.pendingConsideration = null;
      this.nextTurn();
      return callback && callback({ ok: true });
    }

    if (action === 'restartGame') {
      // Host only
      if (this.room.hostId !== userId) {
        return callback && callback({ error: "Only host can restart game" });
      }
      this.state.players.forEach(p => {
        p.score = 0;
        p.timeoutCount = 0;
        p.isEliminated = false;
      });
      this.state.currentPlayerIndex = 0;
      this.state.requiredLetter = '';
      this.state.gameHistory = [];
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
  }
}

module.exports = CricketersAtlasEngine;

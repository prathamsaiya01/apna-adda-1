import { ArrowLeft, Trophy, Clock, Users, CheckCircle, XCircle, Loader, Wifi } from 'lucide-react';
import MultiplayerManager from '../utils/multiplayer';

interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
  timeoutCount: number;
  isEliminated: boolean;
}

interface GameMove {
  player: string;
  cricketer: string;
  letter: string;
  timestamp: Date;
  isValid: boolean;
}

interface CricketersAtlasProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const CricketersAtlas: React.FC<CricketersAtlasProps> = ({ onBack, username, roomId }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: username, score: 0, isActive: true, timeoutCount: 0, isEliminated: false }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameMove[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [requiredLetter, setRequiredLetter] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [gameTimer, setGameTimer] = useState(0);
  const [turnTimer, setTurnTimer] = useState(30);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [eliminatedMessage, setEliminatedMessage] = useState<string>('');
  const [gameWinner, setGameWinner] = useState<string>('');
  const [showConsiderDialog, setShowConsiderDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    cricketer: string;
    firstLetter: string;
    lastLetter: string;
  } | null>(null);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerManager] = useState(() => MultiplayerManager.getInstance());

  // Initialize multiplayer mode if roomId is provided
  useEffect(() => {
    if (roomId) {
      setIsMultiplayer(true);
      
      // Load room data from multiplayer manager
      const room = multiplayerManager.getRoom(roomId);
      if (room) {
        const roomPlayers: Player[] = room.players.map((playerName: string, index: number) => ({
          id: (index + 1).toString(),
          name: playerName,
          score: 0,
          isActive: true,
          timeoutCount: 0,
          isEliminated: false
        }));
        setPlayers(roomPlayers);
        
        // Listen for room updates
        const handleRoomUpdate = (updatedRoom: any) => {
          const updatedPlayers: Player[] = updatedRoom.players.map((playerName: string, index: number) => ({
            id: (index + 1).toString(),
            name: playerName,
            score: 0,
            isActive: true,
            timeoutCount: 0,
            isEliminated: false
          }));
          setPlayers(updatedPlayers);
        };
        
        multiplayerManager.on(`room:${roomId}`, handleRoomUpdate);
        
        return () => {
          multiplayerManager.off(`room:${roomId}`, handleRoomUpdate);
        };
      } else {
        // Fallback to single player
        setPlayers([{ id: '1', name: username, score: 0, isActive: true, timeoutCount: 0, isEliminated: false }]);
        }
    }
  }, [roomId, username, multiplayerManager]);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameWinner) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWinner]);

  // Turn timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && turnTimer > 0 && !gameWinner) {
      interval = setInterval(() => {
        setTurnTimer(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, turnTimer, currentPlayerIndex, gameWinner]);

  const handleTimeUp = () => {
    const currentPlayer = players[currentPlayerIndex];
    const newTimeoutCount = currentPlayer.timeoutCount + 1;
    
    // Update player's timeout count
    setPlayers(prev => prev.map((player, index) => 
      index === currentPlayerIndex 
        ? { 
            ...player, 
            timeoutCount: newTimeoutCount,
            isEliminated: newTimeoutCount >= 2
          }
        : player
    ));

    // Show elimination message if player is eliminated
    if (newTimeoutCount >= 2) {
      setEliminatedMessage(`${currentPlayer.name} has been eliminated for timing out twice!`);
      setTimeout(() => setEliminatedMessage(''), 3000);
      
      // Add elimination to game history
      const eliminationMove: GameMove = {
        player: currentPlayer.name,
        cricketer: '[ELIMINATED - Timed out twice]',
        letter: '',
        timestamp: new Date(),
        isValid: false
      };
      setGameHistory(prev => [...prev, eliminationMove]);
    } else {
      // Show timeout warning
      setEliminatedMessage(`${currentPlayer.name} timed out! (${newTimeoutCount}/2 timeouts)`);
      setTimeout(() => setEliminatedMessage(''), 2000);
    }

    // Move to next active player
    setTurnTimer(30);
    nextActivePlayer();
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 6) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        score: 0,
        isActive: true,
        timeoutCount: 0,
        isEliminated: false
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };

  const startGame = () => {
    if (players.filter(p => !p.isEliminated).length >= 1) {
      setGameStarted(true);
      setRequiredLetter('');
      setTurnTimer(30);
    }
  };

  const validateCricketer = async (name: string): Promise<boolean> => {
    setIsValidating(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const cleanName = name.trim().toLowerCase();
    
    // Complete list of verified cricketers
    const knownCricketers = [
      // A
      'ab de villiers', 'aaron finch', 'aakash chopra', 'aamer sohail', 'abid ali', 'adam gilchrist', 'adam voges', 'adil rashid', 'ajay jadeja', 'ajit agarkar', 'akash deep', 'akila dananjaya', 'alan border', 'alastair cook', 'alex carey', 'alex hales', 'allan donald', 'allan lamb', 'alvin kallicharran', 'ambati rayudu', 'amol muzumdar', 'andre fletcher', 'andre russell', 'andrew flintoff', 'andrew strauss', 'andrew symonds', 'andy flower', 'andy roberts', 'angelo mathews', 'anil kumble', 'anrich nortje', 'anshuman gaekwad', 'anton devcich', 'anwar ali', 'aravinda de silva', 'arjuna ranatunga', 'arshdeep singh', 'ashish nehra', 'ashley giles', 'ashton agar', 'asif ali', 'asif iqbal', 'azam khan', 'azhar ali', 'azhar mahmood', 'mohammad azharuddin',
      
      // B
      'babar azam', 'badrinath subramaniam', 'balaji r', 'barry richards', 'basil d\'oliveira', 'ben cutting', 'ben duckett', 'ben hilfenhaus', 'ben stokes', 'benny howell', 'bernard julien', 'bharat arun', 'bharat chipli', 'bharat khanna', 'bhuvneshwar kumar', 'bill lawry', 'bill ponsford', 'billy bowden', 'billy murdoch', 'biswarup das', 'biswajit paul', 'bj watling', 'bob simpson', 'bob taylor', 'bobby simpson', 'brad haddin', 'brad hodge', 'don bradman', 'brendan taylor', 'brian lara', 'brendon mccullum', 'brett lee', 'bruce reid', 'bryce mcgain',
      
      // C
      'cameron bancroft', 'cameron green', 'cameron white', 'carl hooper', 'carlos brathwaite', 'chaminda vaas', 'chamari athapaththu', 'chandika hathurusingha', 'chandrasekhar bs', 'chamu chibhabha', 'charith asalanka', 'cheteshwar pujara', 'chris cairns', 'chris gayle', 'chris harris', 'chris jordan', 'chris lynn', 'chris silverwood', 'chris woakes', 'chetan chauhan', 'chetan sharma', 'chirag jani', 'clarrie grimmett', 'colin croft', 'colin de grandhomme', 'colin ingram', 'colin munro', 'craig kieswetter', 'craig mcmillan', 'curtly ambrose', 'cyril washbrook',
      
      // D
      'damien fleming', 'damien martyn', 'dale steyn', 'daljit singh', 'daryl mitchell', 'darren bravo', 'darren gough', 'darren lehmann', 'darren sammy', 'daryll cullinan', 'dasun shanaka', 'dave nourse', 'david boon', 'david gower', 'david hussey', 'david lloyd', 'david miller', 'david warner', 'dean elgar', 'dean jones', 'deepak chahar', 'deepak hooda', 'denis compton', 'dennis lillee', 'devdutt padikkal', 'devendra bishoo', 'devon conway', 'dilip doshi', 'dilip vengsarkar', 'dinesh karthik', 'dinesh mongia', 'dirk nannes', 'dominic cork', 'don bradman', 'doug bracewell', 'doug walters', 'doug wright', 'dwayne bravo', 'dwayne smith',
      
      // E
      'easwaran abhimanyu', 'ed cowan', 'ed joyce', 'eddie paynter', 'eddie st george', 'eknath solkar', 'dean elgar', 'eoin morgan', 'erapalli prasanna', 'ernest hall', 'eric bedser', 'eric hollies', 'ernie toshack', 'craig ervine', 'esmond kentish', 'evin lewis',
      
      // F
      'faf du plessis', 'farokh engineer', 'fazal mahmood', 'fazal subhan', 'fawad alam', 'felix mwamba', 'chamara fernando', 'feroz khan', 'fidel edwards', 'finn allen', 'fred spofforth', 'fred trueman', 'andrew flintoff',
      
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
      'mahela jayawardene', 'makhaya ntini', 'mal loye', 'malcolm marshall', 'manoj prabhakar', 'manoj tiwary', 'marcus north', 'marcus trescothick', 'mark boucher', 'mark butcher', 'mark greatbatch', 'mark richardson', 'mark taylor', 'mark waugh', 'mark wood', 'marlon samuels', 'martin crowe', 'martin guptill', 'mashrafe mortaza', 'mathew sinclair', 'matthew hayden', 'matthew hoggard', 'matt henry', 'matt renshaw', 'maqsood ahmed', 'mayank agarwal', 'michael bevan', 'michael clarke', 'michael holding', 'michael hussey', 'michael kasprowicz', 'michael slater', 'michael vaughan', 'michael yardy', 'mick lewis', 'mickey arthur', 'migael pretorius', 'milton shumba', 'minhajul abedin', 'misbah-ul-haq', 'mitchell johnson', 'mitchell marsh', 'mitchell mcclenaghan', 'mitchell santner', 'mohammad abbas', 'mohammad amir', 'mohammad ashraful', 'mohammad hafeez', 'mohammad kaif', 'mohammad nabi', 'mohammad rizwan', 'mohammad sami', 'mohammad shahzad', 'mohammad shami', 'mohammad yousuf', 'mohinder amarnath', 'moin khan', 'monty panesar', 'morne morkel', 'mujeeb ur rahman', 'mushfiqur rahim', 'mustafizur rahman',
      
      // N
      'naman ojha', 'nantie hayward', 'nathan astle', 'nathan bracken', 'nathan coulter-nile', 'nathan lyon', 'nathan mccullum', 'nayeem hasan', 'nayan mongia', 'neil harvey', 'neil johnson', 'neil mckenzie', 'neil wagner', 'nicky boje', 'nikhil chopra', 'niroshan dickwella', 'nitish rana', 'norman cowans', 'norman o\'neill', 'nuwan kulasekara', 'nuwan pradeep',
      
      // O
      'obed mccoy', 'ollie pope', 'ollie robinson', 'oliver hannon-dalby', 'omar phillips', 'omari banks', 'nigel ormond', 'osanda fernando', 'oscar scott',
      
      // P
      'paddy upton', 'pankaj singh', 'parthiv patel', 'pat cummins', 'pathum nissanka', 'patrick patterson', 'paul adams', 'paul collingwood', 'paul harris', 'paul reiffel', 'paul stirling', 'percy fender', 'peter handscomb', 'peter kirsten', 'peter nevill', 'peter siddle', 'peter taylor', 'phil defreitas', 'phil hughes', 'phil mustard', 'phillip simmons', 'pierre de bruyn', 'poonam yadav', 'prabath jayasuriya', 'pradeep sangwan', 'pragyam ojha', 'prashanth parameswaran', 'praveen kumar', 'prithvi shaw', 'cheteshwar pujara', 'puran nicholas',
      
      // Q
      'qais ahmad', 'qasim umar', 'quinton de kock',
      
      // R
      'rachael haynes', 'rachin ravindra', 'rahul dravid', 'rahul tripathi', 'rajat bhatia', 'rajesh chauhan', 'ramiz raja', 'ramesh powar', 'ramnaresh sarwan', 'rangana herath', 'rashid khan', 'rashid latif', 'rassie van der dussen', 'ravichandran ashwin', 'ravi bopara', 'ravi rampaul', 'ravindra jadeja', 'ray lindwall', 'raymond illingworth', 'reece topley', 'reeza hendricks', 'reginald duff', 'renuka singh', 'reon king', 'rex sellers', 'rhyse tait', 'richard hadlee', 'richard illingworth', 'ricky ponting', 'ridley jacobs', 'rilee rossouw', 'rob quiney', 'robiul islam', 'robin peterson', 'robin singh', 'robin uthappa', 'rodney hogg', 'rodney marsh', 'rohit sharma', 'romario shepherd', 'rory burns', 'ross taylor', 'roston chase', 'ruan de swardt', 'rudra pratap singh', 'rupesh amin', 'ryan harris', 'ryan sidebottom', 'ryan ten doeschate',
      
      // S
      'saba karim', 'sabbir rahman', 'sachin tendulkar', 'saeed ajmal', 'saeed anwar', 'safyaan sharif', 'sagarika ghatge', 'shahid afridi', 'sajid khan', 'salim malik', 'salman butt', 'sam billings', 'sam curran', 'sam northeast', 'sam robson', 'samit patel', 'sanath jayasuriya', 'sandeep lamichhane', 'sandeep sharma', 'sanjay bangar', 'sanjay manjrekar', 'sarfraz ahmed', 'sarfraz nawaz', 'sarfaraz khan', 'saurabh tiwary', 'sourav ganguly', 'scott boland', 'scott styris', 'sean ervine', 'sean williams', 'shane bond', 'shane dowrich', 'shane warne', 'shane watson', 'shaun marsh', 'shaun pollock', 'shaun tait', 'shafali verma', 'shakib al hasan', 'mohammad shami', 'shane getkate', 'sharjeel khan', 'shaun udal', 'shreyas iyer', 'shubman gill', 'siddarth kaul', 'sikandar raza', 'simon doull', 'simon katich', 'simon kerrigan', 'simon taufel', 'simon topley', 'curtly ambrose', 'vivian richards', 'sohail khan', 'sohail tanvir', 'soumya sarkar', 'sourav ganguly', 'spencer johnson', 'spinett holgate', 'steve harmison', 'steve smith', 'steve waugh', 'steven finn', 'steven o\'keefe', 'stuart binny', 'stuart broad', 'stuart clark', 'stuart law', 'suranga lakmal', 'suresh raina', 'suryakumar yadav', 'syed anwar',
      
      // T
      'tabraiz shamsi', 'tamim iqbal', 'tauseef ahmed', 'temba bavuma', 'tendai chatara', 'thami tsolekile', 'tharindu kaushal', 'theunis de bruyn', 'theo dorff', 'thomas odoyo', 'thushara mirando', 'tillakaratne dilshan', 'tim bresnan', 'tim may', 'tim paine', 'tim seifert', 'tim southee', 'tim van der gugten', 'tom blundell', 'tom latham', 'tom moody', 'tony greig', 'tony lock', 'trevor bayliss', 'trevor chappell', 'trent boult', 'marcus trescothick', 'trishan holder', 'trundel baer',
      
      // U
      'umar akmal', 'umar amin', 'umar gul', 'unmukt chand', 'upul chandana', 'upul tharanga', 'usman afzaal', 'usman khawaja', 'usman salahuddin',
      
      // V
      'chaminda vaas', 'valtteri wiggins', 'vvs laxman', 'varun aaron', 'varun chakravarthy', 'venkatesh iyer', 'venkatesh prasad', 'vernon philander', 'vidarbha ramesh', 'vijay hazare', 'vijay manjrekar', 'vijay merchant', 'vijay shankar', 'virat kohli', 'vinod kambli', 'vinoth kumar', 'vivek razdan',
      
      // W
      'waqar younis', 'wahab riaz', 'wally hammond', 'walter hadlee', 'wasim akram', 'wasim jaffer', 'wayne parnell', 'wayne phillips', 'wesley barresi', 'wesley madhevere', 'will pucovski', 'william gilbert grace', 'william porterfield', 'will somerville',
      
      // X
      'xavier doherty', 'xavier marshall',
      
      // Y
      'yashasvi jaiswal', 'yasir arafat', 'yasir hameed', 'yasir shah', 'younis khan', 'yusuf pathan',
      
      // Z
      'zaheer abbas', 'zaheer khan', 'zak crawley', 'zander de bruyn', 'zeeshan maqsood', 'zubair hamza', 'zulfiqar babar'
    ];
    
    setIsValidating(false);
    
    // Exact match check (case insensitive)
    const isValid = knownCricketers.includes(cleanName);
    
    return isValid;
  };

  const nextActivePlayer = () => {
    const activePlayers = players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) {
      // Game over - declare winner or end game
      if (activePlayers.length === 1) {
        const winner = activePlayers[0].name;
        setGameWinner(winner);
        setEliminatedMessage(`🎉 ${winner} wins the game!`);
      } else {
        setGameWinner('No Winner');
        setEliminatedMessage('Game over - no players remaining!');
      }
      return;
    }
    
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    while (players[nextIndex].isEliminated) {
      nextIndex = (nextIndex + 1) % players.length;
    }
    setCurrentPlayerIndex(nextIndex);
    setTurnTimer(30);
  };

  const handleConsiderMove = (accept: boolean) => {
    if (!pendingMove) return;

    const move: GameMove = {
      player: players[currentPlayerIndex].name,
      cricketer: accept ? pendingMove.cricketer : `${pendingMove.cricketer} [REJECTED]`,
      letter: pendingMove.firstLetter,
      timestamp: new Date(),
      isValid: accept
    };

    setGameHistory(prev => [...prev, move]);

    if (accept) {
      // Update score
      setPlayers(prev => prev.map((player, index) => 
        index === currentPlayerIndex 
          ? { ...player, score: player.score + 1 }
          : player
      ));
      
      // Set next required letter
      setRequiredLetter(pendingMove.lastLetter.toUpperCase());
      nextActivePlayer();
    } else {
      // Move rejected, player loses turn but no timeout penalty
      nextActivePlayer();
    }

    setShowConsiderDialog(false);
    setPendingMove(null);
    setCurrentInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isValidating) return;

    const cricketerName = currentInput.trim();
    const firstLetter = cricketerName.charAt(0).toLowerCase();
    const lastLetter = cricketerName.charAt(cricketerName.length - 1).toLowerCase();

    // Check if it starts with required letter (if any)
    if (requiredLetter && firstLetter !== requiredLetter.toLowerCase()) {
      alert(`The cricketer's name must start with "${requiredLetter.toUpperCase()}"`);
      return;
    }

    // Check if already used
    const alreadyUsed = gameHistory.some(move => 
      move.cricketer.toLowerCase() === cricketerName.toLowerCase()
    );
    
    if (alreadyUsed) {
      alert('This cricketer has already been named!');
      return;
    }

    // Validate with "Google" (simulated)
    const isValid = await validateCricketer(cricketerName);
    
    if (isValid) {
      const move: GameMove = {
        player: players[currentPlayerIndex].name,
        cricketer: cricketerName,
        letter: firstLetter,
        timestamp: new Date(),
        isValid: true
      };

      setGameHistory([...gameHistory, move]);
      
      // Update score
      setPlayers(prev => prev.map((player, index) => 
        index === currentPlayerIndex 
          ? { ...player, score: player.score + 1 }
          : player
      ));
      
      // Set next required letter
      setRequiredLetter(lastLetter.toUpperCase());
      nextActivePlayer();
    } else {
      // Show consider dialog for invalid names
      setPendingMove({
        cricketer: cricketerName,
        firstLetter,
        lastLetter
      });
      setShowConsiderDialog(true);
    }

    if (isValid) {
      setCurrentInput('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{isMultiplayer ? 'Back to Room' : 'Back to Games'}</span>
              </button>
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  Cricketers Atlas {isMultiplayer && roomId && <span className="text-sm font-normal">({roomId})</span>}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Cricketers Atlas</h2>
              {isMultiplayer && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-purple-800 font-medium">Multiplayer Room: {roomId}</p>
                  <p className="text-sm text-purple-600">Playing with friends online!</p>
                </div>
              )}
              <p className="text-slate-600 max-w-2xl mx-auto">
                Name cricketers in alphabetical chain! Each player must name a cricketer starting 
                with the last letter of the previous cricketer's name.
              </p>
            </div>

            {!isMultiplayer && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Players ({players.length}/6)</h3>
                {players.length < 6 && (
                  <button
                    onClick={() => setShowAddPlayer(true)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 transition-colors duration-200"
                  >
                    Add Player
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold">{player.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{player.name}</p>
                      <p className="text-sm text-slate-600">Ready to play</p>
                    </div>
                  </div>
                ))}
              </div>

              {showAddPlayer && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Enter player name..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    />
                    <button
                      onClick={addPlayer}
                      className="px-4 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 transition-colors duration-200"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddPlayer(false)}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            <div className="text-center">
              <button
                onClick={startGame}
                disabled={players.length < 1}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Game
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Games</span>
            </button>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-slate-300" />
                <span className="font-mono text-lg text-white">{formatTime(gameTimer)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-300" />
                <span className="text-white">{players.length} players</span>
              </div>
              {isMultiplayer && roomId && (
                <div className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-medium">{roomId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Turn */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    gameWinner ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-orange-500 to-purple-600'
                  }`}>
                    <span className="text-white font-bold">{players[currentPlayerIndex].name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {gameWinner ? `Game Over - ${gameWinner} Wins!` : `${players[currentPlayerIndex].name}'s Turn`}
                    </h3>
                    {requiredLetter && !gameWinner && (
                      <p className="text-sm text-slate-600">
                        Name a cricketer starting with <span className="font-bold text-orange-600">"{requiredLetter}"</span>
                      </p>
                    )}
                    {players[currentPlayerIndex].timeoutCount > 0 && !gameWinner && (
                      <p className="text-xs text-orange-600 font-medium">
                        ⚠️ Timeouts: {players[currentPlayerIndex].timeoutCount}/2
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    gameWinner ? 'text-yellow-600' : turnTimer <= 10 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {gameWinner ? '🏆' : `${turnTimer}s`}
                  </div>
                  <div className="text-xs text-slate-500">
                    {gameWinner ? 'Winner!' : 'Time left'}
                  </div>
                </div>
              </div>

              {!gameWinner && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder={requiredLetter ? `Cricketer starting with "${requiredLetter}"...` : "Enter cricketer name..."}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg"
                      disabled={isValidating}
                    />
                    <button
                      type="submit"
                      disabled={!currentInput.trim() || isValidating}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                    >
                      {isValidating ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {gameWinner && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-yellow-600 mb-2">Congratulations!</h2>
                  <p className="text-gray-600 mb-4">{gameWinner} has won the Cricketers Atlas!</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={onBack}
                      className="px-6 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 transition-colors duration-200"
                    >
                      Back to Games
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Consider Dialog */}
            {showConsiderDialog && pendingMove && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🤔</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Consider This Name?</h3>
                    <p className="text-gray-600 mb-4">
                      "<span className="font-semibold text-orange-600">{pendingMove.cricketer}</span>" is not in our official list.
                    </p>
                    <p className="text-sm text-gray-500">
                      Should we accept this name and continue the game?
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleConsiderMove(true)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleConsiderMove(false)}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
                    >
                      ✗ Reject
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-400 text-center mt-3">
                    This decision will be logged in the game history
                  </p>
                </div>
              </div>
            )}

            {/* Elimination Message */}
            {eliminatedMessage && (
              <div className="bg-red-100 border border-red-300 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-red-800 font-medium">{eliminatedMessage}</p>
                </div>
              </div>
            )}

            {/* Game History */}
            <div className="bg-white rounded-xl shadow-lg border border-green-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Game History</h3>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {gameHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No moves yet. Start the game!</p>
                ) : (
                  <div className="space-y-3">
                    {gameHistory.slice().reverse().map((move, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                        move.cricketer.includes('[ELIMINATED') 
                          ? 'bg-red-50 border border-red-200' 
                          : move.cricketer.includes('[REJECTED')
                          ? 'bg-orange-50 border border-orange-200'
                          : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            move.cricketer.includes('[ELIMINATED') 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : move.cricketer.includes('[REJECTED')
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}>
                            <span className="text-white text-sm font-semibold">{move.player.charAt(0)}</span>
                          </div>
                          <div>
                            <p className={`font-medium ${
                              move.cricketer.includes('[ELIMINATED') ? 'text-red-800' : 
                              move.cricketer.includes('[REJECTED') ? 'text-orange-800' :
                              'text-gray-900'
                            }`}>
                              {move.cricketer}
                            </p>
                            <p className="text-sm text-gray-600">by {move.player}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {move.cricketer.includes('[ELIMINATED') ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : move.cricketer.includes('[REJECTED') ? (
                            <XCircle className="w-5 h-5 text-orange-600" />
                          ) : move.isValid ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-xs text-gray-500">
                            {move.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="bg-white rounded-xl shadow-lg border border-green-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Scoreboard</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.isEliminated
                          ? 'bg-red-100 border-2 border-red-300 opacity-60'
                          : gameWinner && player.name === gameWinner
                          ? 'bg-yellow-100 border-2 border-yellow-400'
                          : player.name === players[currentPlayerIndex].name
                          ? 'bg-green-100 border-2 border-green-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          player.isEliminated ? 'bg-red-300 text-red-800' : 
                          gameWinner && player.name === gameWinner ? 'bg-yellow-400 text-yellow-800' :
                          'bg-gray-300'
                        }`}>
                          {gameWinner && player.name === gameWinner ? '👑' : index + 1}
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          player.isEliminated 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : gameWinner && player.name === gameWinner
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}>
                          <span className="text-white text-sm font-semibold">{player.name.charAt(0)}</span>
                        </div>
                        <div>
                          <span className={`font-medium ${player.isEliminated ? 'text-red-800' : 'text-gray-900'}`}>
                            {player.name}
                            {player.isEliminated && <span className="text-xs ml-1">(Eliminated)</span>}
                            {gameWinner && player.name === gameWinner && <span className="text-xs ml-1 text-yellow-600">(Winner!)</span>}
                          </span>
                          {player.timeoutCount > 0 && !player.isEliminated && (
                            <p className="text-xs text-orange-600">Timeouts: {player.timeoutCount}/2</p>
                          )}
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        player.isEliminated ? 'text-red-600' : 
                        gameWinner && player.name === gameWinner ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {player.score}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CricketersAtlas;

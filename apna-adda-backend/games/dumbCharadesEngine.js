// apna-adda-backend/games/dumbCharadesEngine.js
const { secureChoice, secureRandomIndex } = require('../utils/secureRandom');

const MOVIES = [
  // EASY - 45s, 1pt
  { name: 'Sholay', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Dangal', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Kabir Singh', difficulty: 'EASY', timeLimit: 45 },
  { name: '3 Idiots', difficulty: 'EASY', timeLimit: 45 },
  { name: 'PK', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Zindagi Na Milegi Dobara', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Andhadhun', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Chak De! India', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Yeh Jawaani Hai Deewani', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Gully Boy', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Dil Chahta Hai', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Kal Ho Naa Ho', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Kuch Kuch Hota Hai', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Kabhi Alvida Naa Kehna', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Taare Zameen Par', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Bajrangi Bhaijaan', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Kick', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Don', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Jab We Met', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Bodyguard', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Sultan', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Bang Bang', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Raees', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Chennai Express', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Happy New Year', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Dilwale', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Ek Tha Tiger', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Tiger Zinda Hai', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Bajirao Mastani', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Padmaavat', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Sanju', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Tanhaji', difficulty: 'EASY', timeLimit: 45 },
  { name: 'War', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Pathaan', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Jawan', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Rocky Aur Rani Ki Prem Kahani', difficulty: 'EASY', timeLimit: 45 },
  { name: 'Bunty Aur Babli', difficulty: 'EASY', timeLimit: 45 },

  // MEDIUM - 60s, 2pts
  { name: 'Chhichhore', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Barfi!', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Kai Po Che!', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Haider', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Kahaani', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Badlapur', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Talaash', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Tumhari Sulu', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Bareilly Ki Barfi', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Stree', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Once Upon A Time in Mumbaai', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Band Baaja Baaraat', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Rocket Singh: Salesman of the Year', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Dum Laga Ke Haisha', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Shubh Mangal Zyada Saavdhan', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Lootera', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Raajneeti', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Love Aaj Kal', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Wake Up Sid', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Hawa Hawai', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Fukrey', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Goliyon Ki Raasleela Ram-Leela', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Mere Brother Ki Dulhan', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Raanjhanaa', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Aashiqui 2', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Golmaal: Fun Unlimited', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Housefull', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Dhamaal', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Welcome', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'Singh Is Kinng', difficulty: 'MEDIUM', timeLimit: 60 },
  { name: 'No Entry', difficulty: 'MEDIUM', timeLimit: 60 },

  // HARD - 85s, 3pts
  { name: 'Khosla Ka Ghosla', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Saajan Chale Sasural', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Dilwale Dulhania Le Jayenge', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Tanu Weds Manu Returns', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Hum Saath-Saath Hain', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Kabhi Khushi Kabhie Gham', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Bheja Fry', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Do Ankhen Barah Haath', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Sadma', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Akele Hum Akele Tum', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Hum Hai Rahi Pyar Ke', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Andaaz Apna Apna', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Ghar Ho To Aisa', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Hum Tumhare Hain Sanam', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Mujhse Dosti Karoge', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Chupke Chupke', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Angoor', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Amar Akbar Anthony', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Kati Patang', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Har Kisse Ke Hisse: Kaamyaab', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Jhankaar Beats', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Maqbool', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Parineeta', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Rang De Basanti', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Swades', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Udaan', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Veer-Zaara', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Yeh Dillagi', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Zubeidaa', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Kaminey', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Tumbbad', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Yeh Saali Zindagi', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Phir Hera Pheri', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Mujhse Shaadi Karogi', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Main Hoon Na', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Hum Dil De Chuke Sanam', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Raja Hindustani', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Pardes', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Jalpari: The Desert Mermaid', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Mela', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Aap Ki Kasam', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Chandni', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Silsila', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Ram Lakhan', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Namak Halaal', difficulty: 'HARD', timeLimit: 85 },
  { name: 'Coolie', difficulty: 'HARD', timeLimit: 85 },

  // VERY HARD - 100s, 5pts
  { name: 'Loop Lapeta', difficulty: 'VERY HARD', timeLimit: 85 },
  { name: 'Ramprasad Ki Tehrvi', difficulty: 'VERY HARD', timeLimit: 85 },
  { name: 'Mrs. Chatterjee vs Norway', difficulty: 'VERY HARD', timeLimit: 85 },
  { name: 'Shehzada', difficulty: 'VERY HARD', timeLimit: 85 },
  { name: 'Kaun Pravin Tambe?', difficulty: 'VERY HARD', timeLimit: 85 },
  { name: 'Ghoomketu', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Titli', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Chhoti Si Baat', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Jaane Bhi Do Yaaro', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Dhobi Ghat', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Ankur Arora Murder Case', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Saheb Biwi Aur Gangster', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Kis Kisko Pyaar Karoon', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Jal Bin Machhli Nritya Bin Bijli', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Do Aur Do Paanch', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Kissi Se Na Kehna', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Chhoti Bahu', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Khubsoorat', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Kaagaz Ke Phool', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Half Ticket', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Do Phool', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Ram Teri Ganga Maili', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Kalyug', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Matru Ki Bijlee Ka Mandola', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Secret Superstar', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Lage Raho Munna Bhai', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Phas Gaye Re Obama', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Mere Dad Ki Maruti', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Bheja Fry 2', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Drishyam', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Badhaai Ho', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Article 15', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Zwigato', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'London Confidential', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Laal Singh Chaddha', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Sharmaji Namkeen', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Batti Gul Meter Chalu', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Cuttputlli', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Helicopter Eela', difficulty: 'VERY HARD', timeLimit: 100 },
  { name: 'Haseen Dillruba', difficulty: 'VERY HARD', timeLimit: 100 }
];

class DumbCharadesEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.currentMovie = null;
    this.timer = null;
    this.state = {
      players: room.players.map(p => ({
        id: p.userId,
        userId: p.userId,
        name: p.name,
        score: p.score || 0,
        isActive: true
      })),
      currentPlayerIndex: 0,
      selectedDifficulty: 'ALL',
      timeLeft: 45,
      isTimerRunning: false,
      gameRound: 1,
      // Public movie info (name is null for non-actors)
      publicMovie: null
    };
  }

  start() {
    this.state.currentPlayerIndex = secureRandomIndex(this.state.players.length);
    this.state.gameRound = 1;
    this.generateNewMovie();
    this.broadcastState();
  }

  generateNewMovie() {
    let pool = MOVIES;
    if (this.state.selectedDifficulty !== 'ALL') {
      pool = MOVIES.filter(m => m.difficulty === this.state.selectedDifficulty);
    }
    if (pool.length === 0) pool = MOVIES;

    this.currentMovie = secureChoice(pool);
    this.state.timeLeft = this.currentMovie.timeLimit;
    this.state.isTimerRunning = false;
    this.pauseTimer();

    this.state.publicMovie = {
      difficulty: this.currentMovie.difficulty,
      timeLimit: this.currentMovie.timeLimit
    };
  }

  getDifficultyPoints(diff) {
    switch (diff) {
      case 'EASY': return 1;
      case 'MEDIUM': return 2;
      case 'HARD': return 3;
      case 'VERY HARD': return 5;
      default: return 1;
    }
  }

  broadcastState() {
    const actor = this.state.players[this.state.currentPlayerIndex];
    const actorId = actor ? actor.userId : null;

    const publicMovie = {
      name: '(Secret Movie)',
      title: '(Secret Movie)',
      difficulty: this.currentMovie ? this.currentMovie.difficulty : 'MEDIUM',
      timeLimit: this.currentMovie ? this.currentMovie.timeLimit : 60
    };

    const publicState = {
      ...this.state,
      currentActorId: actorId,
      currentMovie: publicMovie,
      movie: publicMovie
    };

    const payload = {
      gameKey: 'DumbCharades',
      state: publicState,
      currentActorId: actorId,
      currentMovie: publicMovie,
      movie: publicMovie,
      ...publicState
    };

    this.io.to(`game_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`room_${this.room._id}`).emit('gameStateUpdate', payload);

    // Send the secret movie name ONLY to the actor
    if (actor && this.currentMovie) {
      const actorMovie = {
        name: this.currentMovie.name,
        title: this.currentMovie.name,
        difficulty: this.currentMovie.difficulty,
        timeLimit: this.currentMovie.timeLimit
      };
      const actorPayload = {
        ...payload,
        currentMovie: actorMovie,
        movie: actorMovie,
        state: { ...publicState, currentMovie: actorMovie, movie: actorMovie }
      };
      this.io.to(`player_${actor.userId}`).emit('gameStateUpdate', actorPayload);
      this.io.to(`player_${actor.userId}`).emit('privateStateUpdate', {
        gameKey: 'DumbCharades',
        movie: actorMovie
      });
    }
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.state.isTimerRunning = true;

    this.timer = setInterval(() => {
      if (this.state.timeLeft <= 1) {
        this.state.timeLeft = 0;
        this.state.isTimerRunning = false;
        clearInterval(this.timer);
        this.broadcastState();
      } else {
        this.state.timeLeft -= 1;
        this.io.to(`game_${this.room._id}`).emit('timerTick', { timeLeft: this.state.timeLeft });
      }
    }, 1000);
  }

  pauseTimer() {
    this.state.isTimerRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  resetTimer() {
    this.pauseTimer();
    if (this.currentMovie) {
      this.state.timeLeft = this.currentMovie.timeLimit;
    }
  }

  nextTurn() {
    this.pauseTimer();
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    this.state.gameRound += 1;
    this.generateNewMovie();
    this.broadcastState();
  }

  handleAction(userId, action, payload, callback) {
    const actor = this.state.players[this.state.currentPlayerIndex];
    const isActorOrHost = (actor && actor.userId === userId) || (this.room.hostId === userId);

    if (action === 'getPrivateData') {
      const isActor = actor && actor.userId === userId;
      return callback && callback({
        ok: true,
        isActor,
        movie: isActor ? this.currentMovie : this.state.publicMovie
      });
    }

    if (action === 'startTimer') {
      if (!isActorOrHost) return callback && callback({ error: "Only current actor or host can control timer" });
      this.startTimer();
      this.broadcastState();
      return callback && callback({ ok: true });
    }

    if (action === 'pauseTimer') {
      if (!isActorOrHost) return callback && callback({ error: "Only actor or host can control timer" });
      this.pauseTimer();
      this.broadcastState();
      return callback && callback({ ok: true });
    }

    if (action === 'resetTimer') {
      if (!isActorOrHost) return callback && callback({ error: "Only actor or host can control timer" });
      this.resetTimer();
      this.broadcastState();
      return callback && callback({ ok: true });
    }

    if (action === 'markCorrect') {
      if (!isActorOrHost) return callback && callback({ error: "Only actor or host can score" });
      const pts = this.getDifficultyPoints(this.currentMovie?.difficulty);
      if (actor) {
        actor.score = (actor.score || 0) + pts;
      }
      this.nextTurn();
      return callback && callback({ ok: true });
    }

    if (action === 'markIncorrect') {
      if (!isActorOrHost) return callback && callback({ error: "Only actor or host can skip" });
      this.nextTurn();
      return callback && callback({ ok: true });
    }

    if (action === 'newMovie') {
      if (!isActorOrHost) return callback && callback({ error: "Only actor or host can generate movie" });
      this.generateNewMovie();
      this.broadcastState();
      return callback && callback({ ok: true });
    }

    if (action === 'setDifficulty') {
      if (this.room.hostId !== userId) return callback && callback({ error: "Host only" });
      this.state.selectedDifficulty = payload.difficulty || 'ALL';
      this.generateNewMovie();
      this.broadcastState();
      return callback && callback({ ok: true });
    }

    callback && callback({ error: "Unknown action" });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}

module.exports = DumbCharadesEngine;

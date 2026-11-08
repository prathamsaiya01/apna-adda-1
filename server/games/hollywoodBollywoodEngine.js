// apna-adda-backend/games/hollywoodBollywoodEngine.js

const DEFAULT_MOVIES = [
  { id: '1', actor: 'Shah Rukh Khan', actress: 'Kajol', movie: 'Dilwale Dulhania Le Jayenge', song: 'Tujhe Dekha To', category: 'Bollywood', difficulty: 'Easy' },
  { id: '2', actor: 'Aamir Khan', actress: 'Kareena Kapoor', movie: '3 Idiots', song: 'All Izz Well', category: 'Bollywood', difficulty: 'Easy' },
  { id: '3', actor: 'Salman Khan', actress: 'Katrina Kaif', movie: 'Ek Tha Tiger', song: 'Mashallah', category: 'Bollywood', difficulty: 'Easy' },
  { id: '4', actor: 'Akshay Kumar', actress: 'Sonakshi Sinha', movie: 'Rowdy Rathore', song: 'Chinta Ta Ta', category: 'Bollywood', difficulty: 'Easy' },
  { id: '5', actor: 'Ranveer Singh', actress: 'Deepika Padukone', movie: 'Ram-Leela', song: 'Lahu Munh Lag Gaya', category: 'Bollywood', difficulty: 'Medium' },
  { id: '6', actor: 'Ajay Devgn', actress: 'Tabu', movie: 'Drishyam', song: 'Soch Na Sake', category: 'Bollywood', difficulty: 'Medium' },
  { id: '7', actor: 'Shahid Kapoor', actress: 'Kiara Advani', movie: 'Kabir Singh', song: 'Bekhayali', category: 'Bollywood', difficulty: 'Medium' },
  { id: '8', actor: 'Varun Dhawan', actress: 'Alia Bhatt', movie: 'Badrinath Ki Dulhania', song: 'Tamma Tamma Again', category: 'Bollywood', difficulty: 'Medium' },
  { id: '9', actor: 'Amitabh Bachchan', actress: 'Jaya Bachchan', movie: 'Sholay', song: 'Yeh Dosti', category: 'Bollywood', difficulty: 'Easy' },
  { id: '10', actor: 'Saif Ali Khan', actress: 'Kareena Kapoor', movie: 'Tashan', song: 'Dil Haara', category: 'Bollywood', difficulty: 'Medium' },
  { id: '11', actor: 'Rajkummar Rao', actress: 'Kriti Sanon', movie: 'Hum Do Hamare Do', song: 'Bansuri', category: 'Bollywood', difficulty: 'Medium' },
  { id: '12', actor: 'Aamir Khan', actress: 'Rani Mukerji', movie: 'Ghulam', song: 'Aati Kya Khandala', category: 'Bollywood', difficulty: 'Medium' },
  { id: '13', actor: 'Govinda', actress: 'Karisma Kapoor', movie: 'Coolie No. 1', song: 'Main To Raste Se Ja Raha Tha', category: 'Bollywood', difficulty: 'Hard' },
  { id: '14', actor: 'Shah Rukh Khan', actress: 'Preity Zinta', movie: 'Veer-Zaara', song: 'Tere Liye', category: 'Bollywood', difficulty: 'Hard' },
  { id: '15', actor: 'Ranbir Kapoor', actress: 'Nargis Fakhri', movie: 'Rockstar', song: 'Tum Ho', category: 'Bollywood', difficulty: 'Medium' },
  { id: '16', actor: 'Farhan Akhtar', actress: 'Priyanka Chopra', movie: 'Don 2', song: 'Zaraa Dil Ko Thaam Lo', category: 'Bollywood', difficulty: 'Medium' },
  { id: '17', actor: 'John Abraham', actress: 'Bipasha Basu', movie: 'Jism', song: 'Jaadu Hai Nasha Hai', category: 'Bollywood', difficulty: 'Hard' },
  { id: '18', actor: 'Ajay Devgn', actress: 'Kareena Kapoor', movie: 'Singham', song: 'Saathiyaa', category: 'Bollywood', difficulty: 'Easy' },
  { id: '19', actor: 'Emraan Hashmi', actress: 'Mallika Sherawat', movie: 'Murder', song: 'Bheege Honth Tere', category: 'Bollywood', difficulty: 'Hard' },
  { id: '20', actor: 'Saif Ali Khan', actress: 'Rani Mukerji', movie: 'Hum Tum', song: 'Hum Tum', category: 'Bollywood', difficulty: 'Medium' },
  { id: '21', actor: 'Ranveer Singh', actress: 'Deepika Padukone', movie: 'Padmaavat', song: 'Ghoomar', category: 'Bollywood', difficulty: 'Easy' },
  { id: '22', actor: 'Rajkummar Rao', actress: 'Shraddha Kapoor', movie: 'Stree', song: 'Milegi Milegi', category: 'Bollywood', difficulty: 'Medium' },
  { id: '23', actor: 'Akshay Kumar', actress: 'Vidya Balan', movie: 'Bhool Bhulaiyaa', song: 'Mere Dholna', category: 'Bollywood', difficulty: 'Medium' }
];

class HollywoodBollywoodEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.movies = [...DEFAULT_MOVIES];
    this.currentMovie = null;
    this.timer = null;
    this.usedMovieIds = new Set();
    this.state = {
      players: room.players.map(p => ({
        id: p.userId,
        userId: p.userId,
        name: p.name,
        score: p.score || 0,
        isActive: true
      })),
      currentPlayerIndex: 0,
      gameRound: 1,
      timeLeft: 120,
      isTimerRunning: false,
      initials: { actor: '', actress: '', movie: '', song: '' },
      revealedFields: { actor: false, actress: false, movie: false, song: false },
      revealedData: { actor: '', actress: '', movie: '', song: '' },
      difficulty: 'Medium',
      roundCompleted: false
    };
  }

  start() {
    this.state.currentPlayerIndex = 0;
    this.state.gameRound = 1;
    this.nextRound(true);
  }

  generateNewMovie() {
    let unused = this.movies.filter(m => !this.usedMovieIds.has(m.id));
    if (unused.length === 0) {
      this.usedMovieIds.clear();
      unused = this.movies;
    }
    const movie = unused[Math.floor(Math.random() * unused.length)];
    this.usedMovieIds.add(movie.id);
    this.currentMovie = movie;

    this.state.initials = {
      actor: movie.actor.charAt(0).toUpperCase(),
      actress: movie.actress.charAt(0).toUpperCase(),
      movie: movie.movie.charAt(0).toUpperCase(),
      song: movie.song.charAt(0).toUpperCase()
    };
    this.state.currentMovie = {
      initials: this.state.initials,
      difficulty: movie.difficulty,
      category: movie.category
    };
    this.state.difficulty = movie.difficulty;
    this.state.revealedFields = { actor: false, actress: false, movie: false, song: false };
    this.state.revealedData = { actor: '', actress: '', movie: '', song: '' };
    this.state.timeLeft = 120;
    this.state.roundCompleted = false;
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.state.isTimerRunning = true;

    this.timer = setInterval(() => {
      if (this.state.timeLeft <= 1) {
        this.state.timeLeft = 0;
        this.state.isTimerRunning = false;
        clearInterval(this.timer);
        this.handleTimeUp();
      } else {
        this.state.timeLeft -= 1;
        this.io.to(`game_${this.room._id}`).emit('timerTick', { timeLeft: this.state.timeLeft });
      }
    }, 1000);
  }

  pauseTimer() {
    this.state.isTimerRunning = false;
    if (this.timer) clearInterval(this.timer);
  }

  handleTimeUp() {
    // Reveal all remaining
    this.state.revealedFields = { actor: true, actress: true, movie: true, song: true };
    this.state.revealedData = {
      actor: this.currentMovie.actor,
      actress: this.currentMovie.actress,
      movie: this.currentMovie.movie,
      song: this.currentMovie.song
    };
    this.state.roundCompleted = true;
    this.broadcastState();

    setTimeout(() => {
      this.nextRound();
    }, 4000);
  }

  nextRound(isFirst = false) {
    this.pauseTimer();
    if (!isFirst) {
      this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
      this.state.gameRound += 1;
    }
    this.generateNewMovie();
    this.startTimer();
    this.broadcastState();
  }

  broadcastState() {
    const payload = {
      gameKey: 'HollywoodBollywoodGame',
      state: this.state,
      currentMovie: this.state.currentMovie,
      ...this.state
    };
    this.io.to(`game_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`room_${this.room._id}`).emit('gameStateUpdate', payload);
  }

  handleAction(userId, action, payload, callback) {
    if (action === 'submitGuess' || action === 'submitFieldGuess') {
      const field = payload.field; // 'actor' | 'actress' | 'movie' | 'song'
      const guess = (payload.guess || payload.value || '').trim().toLowerCase();

      if (!['actor', 'actress', 'movie', 'song', 'director'].includes(field)) {
        return callback && callback({ ok: true, success: true, isMatch: false });
      }
      if (this.state.revealedFields[field]) {
        return callback && callback({ ok: true, success: true, alreadyRevealed: true });
      }

      const actual = (this.currentMovie[field] || '').toLowerCase().trim();
      const isMatch = actual && (guess === actual ||
                      actual.startsWith(guess + ' ') ||
                      guess === actual.split(' ')[0]);

      if (isMatch) {
        this.state.revealedFields[field] = true;
        this.state.revealedData[field] = this.currentMovie[field];

        const pts = this.state.difficulty === 'Easy' ? 1 : this.state.difficulty === 'Medium' ? 2 : 3;
        const player = this.state.players.find(p => p.userId === userId);
        if (player) player.score = (player.score || 0) + pts;

        // Check if all fields revealed
        const allRevealed = Object.values(this.state.revealedFields).every(Boolean);
        if (allRevealed) {
          this.state.roundCompleted = true;
          this.pauseTimer();
          this.broadcastState();
          setTimeout(() => {
            this.nextRound();
          }, 3500);
        } else {
          this.broadcastState();
        }

        return callback && callback({ ok: true, success: true, isMatch: true, field });
      } else {
        return callback && callback({ ok: true, success: true, isMatch: false });
      }
    }

    if (action === 'addCustomMovie') {
      const m = payload.movie;
      if (m && m.actor && m.actress && m.movie && m.song) {
        const movieData = {
          id: Date.now().toString(),
          actor: m.actor,
          actress: m.actress,
          movie: m.movie,
          song: m.song,
          category: 'Bollywood',
          difficulty: m.difficulty || 'Medium'
        };
        this.movies.push(movieData);
        return callback && callback({ ok: true });
      }
      return callback && callback({ error: "Incomplete movie data" });
    }

    if (action === 'nextRound') {
      if (this.room.hostId !== userId) return callback && callback({ error: "Host only" });
      this.nextRound();
      return callback && callback({ ok: true });
    }

    if (action === 'restartGame') {
      if (this.room.hostId !== userId) return callback && callback({ error: "Host only" });
      this.state.players.forEach(p => p.score = 0);
      this.start();
      return callback && callback({ ok: true });
    }

    callback && callback({ error: "Unknown action" });
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}

module.exports = HollywoodBollywoodEngine;

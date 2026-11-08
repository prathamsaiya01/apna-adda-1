// apna-adda-backend/games/whoAmIEngine.js

const CELEBRITIES = [
  { id: '1', name: 'Shah Rukh Khan', category: 'Bollywood Actor', difficulty: 'Easy' },
  { id: '2', name: 'Salman Khan', category: 'Bollywood Actor', difficulty: 'Easy' },
  { id: '3', name: 'Aamir Khan', category: 'Bollywood Actor', difficulty: 'Easy' },
  { id: '4', name: 'Akshay Kumar', category: 'Bollywood Actor', difficulty: 'Easy' },
  { id: '5', name: 'Ranveer Singh', category: 'Bollywood Actor', difficulty: 'Medium' },
  { id: '6', name: 'Ranbir Kapoor', category: 'Bollywood Actor', difficulty: 'Medium' },
  { id: '7', name: 'Varun Dhawan', category: 'Bollywood Actor', difficulty: 'Medium' },
  { id: '8', name: 'Rajkummar Rao', category: 'Bollywood Actor', difficulty: 'Hard' },
  { id: '9', name: 'Deepika Padukone', category: 'Bollywood Actress', difficulty: 'Easy' },
  { id: '10', name: 'Priyanka Chopra', category: 'Bollywood Actress', difficulty: 'Easy' },
  { id: '11', name: 'Kareena Kapoor', category: 'Bollywood Actress', difficulty: 'Easy' },
  { id: '12', name: 'Alia Bhatt', category: 'Bollywood Actress', difficulty: 'Medium' },
  { id: '13', name: 'Katrina Kaif', category: 'Bollywood Actress', difficulty: 'Medium' },
  { id: '14', name: 'Anushka Sharma', category: 'Bollywood Actress', difficulty: 'Medium' },
  { id: '15', name: 'Kriti Sanon', category: 'Bollywood Actress', difficulty: 'Hard' },
  { id: '16', name: 'Virat Kohli', category: 'Cricketer', difficulty: 'Easy' },
  { id: '17', name: 'MS Dhoni', category: 'Cricketer', difficulty: 'Easy' },
  { id: '18', name: 'Rohit Sharma', category: 'Cricketer', difficulty: 'Easy' },
  { id: '19', name: 'Hardik Pandya', category: 'Cricketer', difficulty: 'Medium' },
  { id: '20', name: 'KL Rahul', category: 'Cricketer', difficulty: 'Medium' },
  { id: '21', name: 'Jasprit Bumrah', category: 'Cricketer', difficulty: 'Hard' },
  { id: '22', name: 'Arijit Singh', category: 'Singer', difficulty: 'Easy' },
  { id: '23', name: 'Shreya Ghoshal', category: 'Singer', difficulty: 'Easy' },
  { id: '24', name: 'Armaan Malik', category: 'Singer', difficulty: 'Medium' },
  { id: '25', name: 'Neha Kakkar', category: 'Singer', difficulty: 'Medium' },
  { id: '26', name: 'Rahat Fateh Ali Khan', category: 'Singer', difficulty: 'Hard' },
  { id: '27', name: 'Karan Johar', category: 'Director', difficulty: 'Medium' },
  { id: '28', name: 'Rohit Shetty', category: 'Director', difficulty: 'Medium' },
  { id: '29', name: 'Sanjay Leela Bhansali', category: 'Director', difficulty: 'Hard' },
  { id: '30', name: 'PV Sindhu', category: 'Badminton Player', difficulty: 'Medium' },
  { id: '31', name: 'Mary Kom', category: 'Boxer', difficulty: 'Medium' },
  { id: '32', name: 'Neeraj Chopra', category: 'Javelin Thrower', difficulty: 'Hard' },
  { id: '33', name: 'CarryMinati', category: 'YouTuber', difficulty: 'Medium' },
  { id: '34', name: 'Bhuvan Bam', category: 'YouTuber', difficulty: 'Medium' },
  { id: '35', name: 'Ashish Chanchlani', category: 'YouTuber', difficulty: 'Hard' }
];

class WhoAmIEngine {
  constructor(room, io) {
    this.room = room;
    this.io = io;
    this.currentCelebrity = null;
    this.state = {
      players: room.players.map(p => ({
        id: p.userId,
        userId: p.userId,
        name: p.name,
        score: p.score || 0,
        guessesLeft: 3,
        isActive: true
      })),
      currentPlayerIndex: 0,
      questionsAsked: 0,
      maxQuestions: 20,
      gameRound: 1,
      chatMessages: [],
      revealedCelebrity: null,
      difficulty: 'Easy',
      category: ''
    };
  }

  start() {
    this.state.currentPlayerIndex = 0;
    this.state.gameRound = 1;
    this.nextRound(true);
  }

  nextRound(isFirst = false) {
    if (!isFirst) {
      this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
      this.state.gameRound += 1;
    }

    this.currentCelebrity = CELEBRITIES[Math.floor(Math.random() * CELEBRITIES.length)];
    this.state.difficulty = this.currentCelebrity.difficulty;
    this.state.category = this.currentCelebrity.category;
    this.state.questionsAsked = 0;
    this.state.revealedCelebrity = null;
    this.state.players.forEach(p => {
      p.guessesLeft = 3;
    });

    const currPlayer = this.state.players[this.state.currentPlayerIndex];
    this.state.chatMessages.push({
      id: Date.now().toString(),
      player: 'System',
      message: `🎭 Round ${this.state.gameRound} started! ${currPlayer.name} has the celebrity name. Others can ask up to 20 Yes/No questions and have 3 guesses each!`,
      timestamp: new Date().toISOString(),
      type: 'system'
    });

    this.broadcastState();
  }

  getDifficultyPoints(diff) {
    switch (diff) {
      case 'Easy': return 1;
      case 'Medium': return 2;
      case 'Hard': return 3;
      default: return 1;
    }
  }

  getPrivateCard(userId) {
    const currHolder = this.state.players[this.state.currentPlayerIndex];
    if (currHolder && currHolder.userId === userId && this.currentCelebrity) {
      return {
        isHolder: true,
        celebrity: this.currentCelebrity
      };
    }
    return {
      isHolder: false,
      difficulty: this.state.difficulty,
      category: this.state.category
    };
  }

  broadcastState() {
    const questions = this.state.chatMessages.filter(m => m.type === 'question');
    const holder = this.state.players[this.state.currentPlayerIndex];
    const holderId = holder ? holder.userId : null;

    const publicState = {
      ...this.state,
      celebrityHolderId: holderId,
      questions,
      // never expose currentCelebrity to general broadcast unless round finished / revealed
      currentCelebrity: this.state.revealedCelebrity ? this.currentCelebrity : {
        name: "???",
        difficulty: this.state.difficulty,
        category: this.state.category
      }
    };

    const payload = {
      gameKey: 'WhoAmI',
      state: publicState,
      celebrityHolderId: holderId,
      questions,
      ...publicState
    };

    this.io.to(`game_${this.room._id}`).emit('gameStateUpdate', payload);
    this.io.to(`room_${this.room._id}`).emit('gameStateUpdate', payload);

    // Send private info to the holder
    if (holder) {
      const holderPayload = {
        ...payload,
        currentCelebrity: this.currentCelebrity,
        state: { ...publicState, currentCelebrity: this.currentCelebrity }
      };
      this.io.to(`player_${holder.userId}`).emit('gameStateUpdate', holderPayload);
      this.io.to(`player_${holder.userId}`).emit('privateStateUpdate', {
        gameKey: 'WhoAmI',
        holderData: {
          isHolder: true,
          celebrity: this.currentCelebrity
        }
      });
    }
  }

  handleAction(userId, action, payload, callback) {
    const holder = this.state.players[this.state.currentPlayerIndex];

    if (action === 'getPrivateData') {
      return callback && callback({ ok: true, data: this.getPrivateCard(userId) });
    }

    if (action === 'askQuestion') {
      if (holder && holder.userId === userId) {
        return callback && callback({ error: "The celebrity holder cannot ask questions!" });
      }
      if (this.state.questionsAsked >= this.state.maxQuestions) {
        return callback && callback({ error: "Maximum questions reached!" });
      }

      const qText = (payload.question || '').trim();
      if (!qText) return callback && callback({ error: "Question cannot be empty" });

      const sender = this.state.players.find(p => p.userId === userId);
      const msg = {
        id: Date.now().toString(),
        player: sender ? sender.name : 'Player',
        message: qText,
        question: qText,
        timestamp: new Date().toISOString(),
        type: 'question',
        response: null,
        answer: null
      };

      this.state.chatMessages.push(msg);
      this.state.questionsAsked += 1;
      this.broadcastState();
      return callback && callback({ ok: true, success: true });
    }

    if (action === 'answerQuestion') {
      if (!holder || holder.userId !== userId) {
        return callback && callback({ error: "Only the celebrity holder can answer!" });
      }

      const response = payload.response || payload.answer;
      const lastUnanswered = [...this.state.chatMessages].reverse().find(m => m.type === 'question' && !m.response);
      if (!lastUnanswered) {
        return callback && callback({ error: "No question to answer" });
      }

      lastUnanswered.response = response;
      lastUnanswered.answer = response;
      const answerLabels = {
        'yes': '✅ Yes',
        'no': '❌ No',
        'maybe-yes': '🤔 Maybe Yes',
        'maybe-no': '🤷 Maybe No',
        'not-sure': '❓ Not Sure'
      };

      this.state.chatMessages.push({
        id: Date.now().toString(),
        player: holder.name,
        message: answerLabels[response] || response || 'Answered',
        timestamp: new Date().toISOString(),
        type: 'answer',
        response: response,
        answer: response
      });

      this.broadcastState();
      return callback && callback({ ok: true, success: true });
    }

    if (action === 'makeGuess') {
      if (holder && holder.userId === userId) {
        return callback && callback({ error: "Celebrity holder cannot guess!" });
      }

      const guesser = this.state.players.find(p => p.userId === userId);
      if (!guesser) return callback && callback({ error: "Player not found" });
      if (guesser.guessesLeft <= 0) {
        return callback && callback({ error: "No guesses left in this round!" });
      }

      const guessText = (payload.guess || '').trim();
      if (!guessText) return callback && callback({ error: "Guess cannot be empty" });

      const isCorrect = guessText.toLowerCase() === this.currentCelebrity.name.toLowerCase();

      this.state.chatMessages.push({
        id: Date.now().toString(),
        player: guesser.name,
        message: `🎯 Guess: ${guessText}`,
        timestamp: new Date().toISOString(),
        type: 'guess'
      });

      if (isCorrect) {
        const pts = this.getDifficultyPoints(this.currentCelebrity.difficulty);
        guesser.score = (guesser.score || 0) + pts;
        this.state.revealedCelebrity = this.currentCelebrity;

        this.state.chatMessages.push({
          id: (Date.now() + 1).toString(),
          player: 'System',
          message: `🎉 ${guesser.name} guessed correctly! The answer was ${this.currentCelebrity.name}. +${pts} points!`,
          timestamp: new Date().toISOString(),
          type: 'system'
        });

        this.broadcastState();
        setTimeout(() => {
          this.nextRound();
        }, 3000);
      } else {
        guesser.guessesLeft -= 1;
        this.state.chatMessages.push({
          id: (Date.now() + 1).toString(),
          player: 'System',
          message: `❌ Wrong guess! ${guesser.name} has ${guesser.guessesLeft} guesses left.`,
          timestamp: new Date().toISOString(),
          type: 'system'
        });

        // Check if all guessers are out of guesses
        const otherPlayers = this.state.players.filter(p => p.userId !== holder.userId);
        const allOut = otherPlayers.every(p => p.guessesLeft <= 0);
        if (allOut) {
          this.state.revealedCelebrity = this.currentCelebrity;
          this.state.chatMessages.push({
            id: (Date.now() + 2).toString(),
            player: 'System',
            message: `Round over! Nobody guessed correctly. The answer was ${this.currentCelebrity.name}.`,
            timestamp: new Date().toISOString(),
            type: 'system'
          });
          this.broadcastState();
          setTimeout(() => {
            this.nextRound();
          }, 3500);
          return callback && callback({ ok: true, isCorrect: false, roundOver: true });
        } else {
          this.broadcastState();
        }
      }

      return callback && callback({ ok: true, isCorrect });
    }

    if (action === 'restartGame') {
      if (this.room.hostId !== userId) return callback && callback({ error: "Host only" });
      this.state.players.forEach(p => p.score = 0);
      this.start();
      return callback && callback({ ok: true });
    }

    callback && callback({ error: "Unknown action" });
  }

  destroy() {}
}

module.exports = WhoAmIEngine;

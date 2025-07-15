const readline = require('readline');
const printer = require('./printer');
const fs = require('fs');
const path = require('path');

class Quizzer {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.quizzes = this._loadQuizzes();
  }

  _loadQuizzes() {
    const quizDir = path.join(__dirname, '../quizzes');
    return fs.readdirSync(quizDir)
      .filter(file => file.endsWith('.json'))
      .map(file => require(path.join(quizDir, file)));
  }

  async start() {
    printer.title('Welcome to the CLI Quiz App!');
    
    const quiz = await this._selectQuiz();
    if (!quiz) return;

    printer.title(`\nQuiz: ${quiz.title}`);
    printer.info(quiz.description);
    
    let score = 0;
    const questions = this._shuffleArray([...quiz.questions]);
    
    for (const [index, question] of questions.entries()) {
      const isCorrect = await this._askQuestion(index + 1, question);
      if (isCorrect) score++;
    }
    
    printer.score(score, questions.length);
    this.rl.close();
  }

  async _selectQuiz() {
    if (this.quizzes.length === 0) {
      printer.error('No quizzes found in the quizzes directory!');
      return null;
    }
    
    printer.title('\nAvailable Quizzes:');
    this.quizzes.forEach((quiz, i) => {
      printer.option(i + 1, `${quiz.title} - ${quiz.description}`);
    });
    
    const choice = await this._prompt(
      `\nSelect a quiz (1-${this.quizzes.length}): `,
      input => {
        const num = parseInt(input);
        return !isNaN(num) && num > 0 && num <= this.quizzes.length;
      }
    );
    
    return this.quizzes[parseInt(choice) - 1];
  }

  async _askQuestion(number, question) {
    printer.question(`${number}. ${question.question}`, question.timeLimit);
    
    switch (question.type) {
      case 'multiple':
        return this._askMultipleChoice(question);
      case 'boolean':
        return this._askBoolean(question);
      case 'short':
        return this._askShortAnswer(question);
      default:
        printer.error('Unknown question type');
        return false;
    }
  }

  async _askMultipleChoice(question) {
    question.options.forEach((option, i) => {
      printer.option(i + 1, option);
    });
    
    const answer = await this._prompt(
      'Your answer (1-4): ',
      input => {
        const num = parseInt(input);
        return !isNaN(num) && num > 0 && num <= question.options.length;
      },
      question.timeLimit
    );
    
    const isCorrect = parseInt(answer) === question.answer + 1;
    this._showFeedback(isCorrect, question.options[question.answer]);
    return isCorrect;
  }

  async _askBoolean(question) {
    const answer = await this._prompt(
      'Your answer (true/false): ',
      input => ['true', 'false', 't', 'f'].includes(input.toLowerCase()),
      question.timeLimit
    );
    
    const userBool = ['true', 't'].includes(answer.toLowerCase());
    const isCorrect = userBool === question.answer;
    this._showFeedback(isCorrect, question.answer);
    return isCorrect;
  }

  async _askShortAnswer(question) {
    const answer = await this._prompt(
      'Your answer: ',
      () => true,
      question.timeLimit
    );
    
    const isCorrect = answer.toLowerCase() === question.answer.toLowerCase();
    this._showFeedback(isCorrect, question.answer);
    return isCorrect;
  }

  _showFeedback(isCorrect, correctAnswer) {
    if (isCorrect) {
      printer.correct('Correct!');
    } else {
      printer.incorrect(`Incorrect. The correct answer is: ${correctAnswer}`);
    }
  }

  async _prompt(question, validator, timeout) {
    return new Promise((resolve) => {
      const ask = () => {
        this.rl.question(question, (input) => {
          if (validator(input)) {
            clearTimeout(timer);
            resolve(input);
          } else {
            printer.error('Invalid input, try again');
            ask();
          }
        });
      };
      
      let timer;
      if (timeout) {
        timer = setTimeout(() => {
          this.rl.write('\n');
          printer.error(`Time's up!`);
          resolve(''); // Empty string will fail validation
        }, timeout * 1000);
      }
      
      ask();
    });
  }

  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

module.exports = Quizzer;
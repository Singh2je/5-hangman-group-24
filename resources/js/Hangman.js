class Hangman {
  constructor(_canvas) {
    if (!_canvas) {
      throw new Error(`invalid canvas provided`);
    }
    this.wrongGuessesCount = 0;
    this.canvas = _canvas;
    this.ctx = this.canvas.getContext(`2d`);
  }

  /**
   * This function takes a difficulty string as a patameter
   * would use the Fetch API to get a random word from the Hangman
   * To get an easy word: https://hangman-micro-service-bpblrjerwh.now.sh?difficulty=easy
   * To get an medium word: https://hangman-micro-service-bpblrjerwh.now.sh?difficulty=medium
   * To get an hard word: https://hangman-micro-service-bpblrjerwh.now.sh?difficulty=hard
   * The results is a json object that looks like this:
   *    { word: "book" }
   * */
  getRandomWord(difficulty) {
    return fetch(
      `https://hangman-micro-service.herokuapp.com/?difficulty=${difficulty}`
    )
      .then((r) => r.json())
      .then((r) => r.word);
  }

  /**
   *
   * @param {string} difficulty a difficulty string to be passed to the getRandomWord Function
   * @param {function} next callback function to be called after a word is reveived from the API.
   */
  async start(difficulty, next) {
    // get word and set it to the class's this.word
    this.word = await this.getRandomWord(difficulty).then((r) => {
      return r;
    });
    console.log(`word`, this.word);
    // clear canvas
    this.clearCanvas();
    // draw base
    this.drawBase();
    // reset this.guesses to empty array
    this.guesses = [];
    // reset this.isOver to false
    this.isOver = false;
    // reset this.didWin to false
    this.didWin = false;


    next();
  }

  // _word() {
  //   this.getRandomWord(difficulty).then((word) => {
  //     this.word = word;
  //   });
  // }

  /**
   *
   * @param {string} letter the guessed letter.
   */
  guess(letter) {
    var regex = /^[A-Za-z]+$/;
    // Check if nothing was provided and throw an error if so
    if(!letter) {
      return `No letter was provided`;
    }
    // Check for invalid cases (numbers, symbols, ...) throw an error if it is
    if(!letter.match(regex)) {
      return `Invalid input`;
    }
    // Check if more than one letter was provided. throw an error if it is.
    if(letter.length > 1) {
      return `More than one letter provided`;
    }
    // if it's a letter, convert it to lower case for consistency.
    letter = letter.toLowerCase();
    // check if this.guesses includes the letter. Throw an error if it has been guessed already.
    if(this.guesses.includes(letter)) {
      return `Letter already guessed`;
    }
    // add the new letter to the guesses array.
    this.guesses.push(letter);
    // check if the word includes the guessed letter:
    //    if it's is call checkWin()
    //    if it's not call onWrongGuess()
    if(this.word.includes(letter)) {
      this.checkWin()
    } else {
      this.onWrongGuess()
    }
  }

  checkWin() {
    // using the word and the guesses array, figure out how many remaining unknowns.
    var remainingLetters = this.word.length;
    var wordArray = [];
    for(var i = 0; i < this.word.length; i++) {
      wordArray[i] = this.word.charAt(i);
    }
    for(var i = 0; i < wordArray.length; i++) {
      this.guesses.map(guess => {
        if(wordArray[i] == guess) {
          remainingLetters--;
        }
      });
    }
    // if zero, set both didWin, and isOver to true
    if(remainingLetters == 0) {
      this.didWin = true;
      this.isOver = true;
    }
  }

  /**
   * Based on the number of wrong guesses, this function would determine and call the appropriate drawing function
   * drawHead, drawBody, drawRightArm, drawLeftArm, drawRightLeg, or drawLeftLeg.
   * if the number wrong guesses is 6, then also set isOver to true and didWin to false.
   */
  onWrongGuess() {
    this.wrongGuessesCount++;
    switch(this.wrongGuessesCount) {
      case 1:
        this.drawHead();
        break;
      case 2:
        this.drawBody();
        break;
      case 3:
        this.drawRightArm();
        break;
      case 4:
        this.drawLeftArm();
        break;
      case 5:
        this.drawRightLeg();
        break;
      case 6:
        this.drawLeftLeg();
        this.isOver = true;
        this.didWin = false;
        break;
    }
  }

  /**
   * This function will return a string of the word placeholder
   * It will have underscores in the correct number and places of the unguessed letters.
   * i.e.: if the word is BOOK, and the letter O has been guessed, this would return _ O O _
   */
  getWordHolderText() {
    var wordArray = [];
    var textArray = [];
    for(var i = 0; i < this.word.length; i++) {
      wordArray[i] = this.word.charAt(i);
      textArray[i] = "_ ";
    }
    for(var i = 0; i < wordArray.length; i++) {
      this.guesses.map(guess => {
        if(wordArray[i] == guess) {
          textArray[i] = `${guess} `;
        }
      });
    }
    return `Word: ` + textArray.join(` `);
  }

  /**
   * This function returns a string of all the previous guesses, seperated by a comma
   * This would return something that looks like
   * (Guesses: A, B, C)
   * Hint: use the Array.prototype.join method.
   */
  getGuessesText() {
    return `Guesses: ` + this.guesses.join(` `);
  }

  /**
   * Clears the canvas
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws the hangman base
   */
  drawBase() {
    this.ctx.fillRect(95, 10, 150, 10); // Top
    this.ctx.fillRect(245, 10, 10, 50); // Noose
    this.ctx.fillRect(95, 10, 10, 400); // Main beam
    this.ctx.fillRect(10, 410, 175, 10); // Base
  }

  drawHead() {
    this.ctx.beginPath();
    this.ctx.lineWidth = 5;
    this.ctx.arc(250, 97.5, 35, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  drawBody() {
    this.ctx.fillRect(248, 130, 5, 150);
  }

  drawLeftArm() {
    this.ctx.beginPath();
    this.ctx.moveTo(250, 150);
    this.ctx.lineTo(180, 220);
    this.ctx.stroke();
    }
    
    drawRightArm() {
    this.ctx.beginPath();
    this.ctx.moveTo(250, 150);
    this.ctx.lineTo(320, 220);
    this.ctx.stroke();
    }
    
    drawLeftLeg() {
    this.ctx.beginPath();
    this.ctx.moveTo(250, 280);
    this.ctx.lineTo(180, 350);
    this.ctx.stroke();
    }
    
    drawRightLeg() {
    this.ctx.beginPath();
    this.ctx.moveTo(250, 280);
    this.ctx.lineTo(320, 350);
    this.ctx.stroke();
    }
}

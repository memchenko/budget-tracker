const EventEmitter = require("node:events");

const telegram = require("../../telegram");
const state = require("../../../entities/state");

// Mission of a step is to get data from a user
class Step extends EventEmitter {
  static COMPLETED = "COMPLETED";

  static of(props) {
    return new this.prototype.constructor(props);
  }

  constructor({ word }) {
    super();

    this.word = word;
  }

  initiate({ userId }) {
    telegram.respondWithMessage({ userId, text: this.word });
  }

  run({ userId, text }) {
    if (this.validate(text)) {
      this.complete({ userId, text });
    } else {
      this.tryAgain({ userId, text });
    }
  }

  async complete({ userId, text }) {
    const response = await this.prepareResponse(text);

    await state.addResponse({ userId, response: JSON.stringify(response) });

    this.emit(Step.COMPLETED, { userId });
  }

  tryAgain({ userId, text }) {
    telegram.respondWithMessage({
      userId,
      text: `Неверный формат. ${this.word}`,
    });
  }

  validate(text) {
    return true;
  }

  prepareResponse(text) {
    return text;
  }
}

module.exports = { Step };

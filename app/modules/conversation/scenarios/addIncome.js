const { Scenario } = require("../lib/Scenario");

const accountant = require("../../accountant");
const telegram = require("../../telegram");
const categories = require("../../../entities/categories");
const { commands } = require("../../../lib/commands");
const { FloatStep } = require("../lib/FloatStep");
const { ChoiceStep } = require("../lib/ChoiceStep");
const { Step } = require("../lib/Step");

const scenario = new Scenario(commands.ADD_INCOME.command);

const amountStep = new FloatStep();
const categoryStep = new ChoiceStep({
  word: "Выберите категорию доходов",
  entity: categories,
});
categoryStep.getItems = async function ({ userId }) {
  return this.entity.find({ userId, type: "income" });
};
categoryStep.mapDataItemToOption = function (category) {
  return { id: category, text: category };
};
const noteStep = new Step({ word: `Введите заметку или просто "-"` });

scenario.registerMultipleSteps(amountStep, categoryStep, noteStep);

scenario.on(Scenario.COMPLETED, async ({ userId, responsesList }) => {
  const [amount, category, note] = responsesList;

  await accountant.addIncome({
    userId,
    note,
    category,
    amount,
  });

  telegram.respondWithCurrentBudgetState({ userId });
});

module.exports = { scenario };

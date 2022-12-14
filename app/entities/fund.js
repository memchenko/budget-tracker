const cuid = require("cuid");
const Joi = require("joi");
const { DateTime } = require("luxon");
const { omit } = require("lodash");

const { funds, read, readAll, del, write } = require("../services/db");
const { EntityManager } = require("../utils/entity-manager");

const fundDto = Joi.object({
  id: Joi.string().optional(),
  userId: Joi.number(),
  title: Joi.string(),
  balance: Joi.number(),
  priority: Joi.number(),
  capacity: Joi.number(),
  calculateDailyLimit: Joi.boolean(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

const updateFundDto = Joi.object({
  id: Joi.string(),
  userId: Joi.number(),
  title: Joi.string().optional(),
  balance: Joi.number().optional(),
  priority: Joi.number().optional(),
  capacity: Joi.number().optional(),
  calculateDailyLimit: Joi.boolean().optional(),
});

const findOneDto = Joi.object({
  id: Joi.string(),
  userId: Joi.number(),
});

const findAllDto = Joi.object({
  userId: Joi.number(),
});

const updateBalanceByDto = Joi.object({
  userId: Joi.number(),
  fundId: Joi.string(),
  amount: Joi.number(),
});

const updateAllBalancesByDto = Joi.object({
  userId: Joi.number(),
  amount: Joi.number(),
});

const deleteAllDto = Joi.object({
  userId: Joi.number(),
});

const getDB = (userId) => funds.doc(String(userId)).collection("default");

module.exports = new EntityManager("fund", {
  create: {
    dto: fundDto,
    handler: async function ({ userId, ...data }, cb) {
      try {
        const currentFunds = await this.findAll({ userId });

        if (
          currentFunds &&
          currentFunds.length &&
          currentFunds.some(({ priority }) => priority === data.priority)
        ) {
          const affectedFunds = currentFunds.filter(
            ({ priority }) => priority >= data.priority
          );
          const newData = affectedFunds.map((fund) =>
            Object.assign(fund, {
              priority: fund.priority + 1,
            })
          );

          await Promise.all(
            newData.map((newFund) => {
              return this.update({ userId, ...newFund });
            })
          );
        }

        const newFund = {
          ...data,
          id: cuid(),
          createdAt: DateTime.utc().toMillis(),
          updatedAt: DateTime.utc().toMillis(),
        };

        await write(newFund.id, newFund, getDB(userId));

        return cb(undefined, newFund);
      } catch (err) {
        return cb(err);
      }
    },
  },

  update: {
    dto: updateFundDto,
    handler: async function ({ userId, id, ...data }, cb) {
      try {
        const cleanedData = omit(data, ["id", "createdAt", "userId"]);
        const existingFund = await this.find({
          userId,
          id,
        });
        const updatedFund = Object.assign(existingFund, cleanedData, {
          updatedAt: DateTime.utc().toMillis(),
        });

        await write(id, updatedFund, getDB(userId));

        return cb(undefined, updatedFund);
      } catch (err) {
        return cb(err);
      }
    },
  },

  delete: {
    dto: findOneDto,
    handler: async ({ id, userId }, cb) => {
      try {
        const result = await del(id, getDB(userId));

        return cb(undefined, result);
      } catch (err) {
        return cb(err);
      }
    },
  },

  deleteAll: {
    dto: deleteAllDto,
    handler: async ({ userId }, cb) => {
      try {
        await del(userId, funds);

        return cb(undefined, true);
      } catch (err) {
        return cb(err);
      }
    },
  },

  find: {
    dto: findOneDto,
    handler: async ({ userId, id }, cb) => {
      try {
        const result = await read(id, getDB(userId));

        return cb(undefined, result);
      } catch (err) {
        return cb(err);
      }
    },
  },

  findAll: {
    dto: findAllDto,
    handler: async ({ userId }, cb) => {
      try {
        const result = await readAll(getDB(userId));

        return cb(undefined, result);
      } catch (err) {
        return cb(err);
      }
    },
  },

  updateBalanceBy: {
    dto: updateBalanceByDto,
    handler: async function ({ userId, fundId, amount }, cb) {
      try {
        const fund = await this.find({ id: fundId, userId });
        const cleanedData = omit(fund, ["createdAt", "updatedAt"]);
        cleanedData.balance += amount;

        const updatedFund = await this.update({ userId, ...cleanedData });

        return cb(undefined, updatedFund);
      } catch (err) {
        return cb(err);
      }
    },
  },

  updateAllBalancesBy: {
    dto: updateAllBalancesByDto,
    handler: async function ({ userId, amount }, cb) {
      try {
        const allFunds = await this.findAll({ userId });
        const newValues = allFunds.map((fund) => ({
          ...fund,
          amount: fund.amount + amount,
        }));
        const batch = newValues.map((value) => this.update(value));

        await Promise.all(batch);

        return cb(undefined, newValues);
      } catch (err) {
        return cb(err);
      }
    },
  },
});

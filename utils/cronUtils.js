const { CronExpressionParser } = require("cron-parser");

const parseExpression = (cronExpression) => {
  try {
    const parsedExpression = CronExpressionParser.parse(cronExpression, {
      tz: "Asia/Kolkata",
    });
    return parsedExpression.toString();
  } catch (error) {
    console.error("Error in cronUtils.parseExpression - ", error);
    return null;
  }
};

module.exports = {
  parseExpression,
};

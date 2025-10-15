const { TIME_UNIT } = require("../constants/common");

const convertTimeToMs = (duration, unit) => {
  switch (unit) {
    case TIME_UNIT.MILLISECONDS:
      return duration;
    case TIME_UNIT.SECONDS:
      return duration * 1000;
    case TIME_UNIT.MINUTES:
      return duration * 1000 * 60;
    case TIME_UNIT.HOURS:
      return duration * 1000 * 60 * 60;
    case TIME_UNIT.DAYS:
      return duration * 1000 * 60 * 60 * 24;
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
}

module.exports = {
  convertTimeToMs,
}
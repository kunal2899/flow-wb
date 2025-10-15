const VISIBILITY_OPTION = {
  PUBLIC: "public",
  PRIVATE: "private",
};

const HTTP_METHOD = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
};

const BACKOFF_STRATEGY = {
  EXPONENTIAL: "exponential",
  LINEAR: "linear",
  CONSTANT: "constant",
};

const URL_PATTERN = /^(https?:\/\/)?(localhost|\w+(\.\w+)+)(:\d+)?(\/[^\s]*)?$/;

const MAIN_QUEUE_NAME = "workflow-queue";

const TIME_UNIT = {
  MILLISECONDS: "milliseconds",
  SECONDS: "seconds",
  MINUTES: "minutes",
  HOURS: "hours",
  DAYS: "days",
};

module.exports = {
  VISIBILITY_OPTION,
  HTTP_METHOD,
  BACKOFF_STRATEGY,
  URL_PATTERN,
  MAIN_QUEUE_NAME,
  TIME_UNIT,
};

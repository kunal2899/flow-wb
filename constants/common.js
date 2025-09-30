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

module.exports = {
  VISIBILITY_OPTION,
  HTTP_METHOD,
  BACKOFF_STRATEGY,
};

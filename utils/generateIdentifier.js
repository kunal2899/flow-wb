const { kebabCase, replace } = require("lodash");
const shortid = require("shortid");

const generateIdentifier = prefix =>
  `${kebabCase(prefix.split(" ").slice(0, 2).join(" "))}-${replace(
    shortid(),
    /[^a-zA-Z0-9]/g,
    ""
  ).slice(0, 4)}`

module.exports = generateIdentifier;
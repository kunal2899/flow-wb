const bcrypt = require('bcrypt');

const generateHash = async (textToEncrypt, saltRounds = 10) => {
  const encryptedText = await bcrypt.hash(textToEncrypt, saltRounds);
  return encryptedText;
};

const validateHash = async (plainText, encryptedText) => {
  const isValid = await bcrypt.compare(plainText, encryptedText);
  return isValid;
}

module.exports = {
  generateHash,
  validateHash,
}
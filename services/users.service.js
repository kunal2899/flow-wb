const jwt = require("jsonwebtoken");
const { pick } = require("lodash");
const { validateHash } = require("@utils/bcryptUtils");
const { getFullName } = require("@utils/users");
require("dotenv").config({ quiet: true });

const authenticateUser = async ({ type, data }) => {
  switch (type) {
    case "email":
      return authenticateUserByEmail(pick(data, "email", "password"));
    default:
      throw new Error("Invalid authentication type");
  }
};

const authenticateUserByEmail = async ({ email, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (!existingUser) return { success: false, reason: `User doesn't exists` };
  const isPasswordMatched = validateHash(password, existingUser.password);
  if (!isPasswordMatched)
    return { success: false, reason: "Invalid credentials" };
  const token = jwt.sign(
    {
      name: getFullName(existingUser),
      ...pick(existingUser, ["identifier", "email"]),
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  return {
    success: true,
    data: { token },
    message: "Login successful",
  };
};

module.exports = { authenticateUser };

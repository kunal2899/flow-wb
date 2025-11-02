const getFullName = (user) => `${user.firstName} ${user.lastName}`;

const generateUserIdentifier = (
  user,
  { includeLast = false, salt = "" } = {}
) => {
  const first = (user.firstName || "").toLowerCase().replace(/\s+/g, "");
  const last = (user.lastName || "").toLowerCase().replace(/\s+/g, "");
  const email = (user.email || "").toLowerCase().split("@")[0];
  const hash = require("crypto")
    .createHash("md5")
    .update(email + salt)
    .digest("hex")
    .split("")
    .map((char) => char.charCodeAt(0))
    .join("")
    .slice(0, 4);
  return `${first}${
    includeLast || first.length <= 3 ? `.${last}` : ""
  }.${hash}`;
};

const generateUniqueUserIdentifier = async (userData) => {
  const getRandomSalt = () => Math.random().toString(36).substring(2, 15);
  const identifierGenerationOptions = [
    {},
    { includeLast: true },
    {
      includeLast: true,
      salt: getRandomSalt(),
    },
  ];

  let identifier;

  for (const option of identifierGenerationOptions) {
    identifier = generateUserIdentifier(userData, option);
    const anyUserWithSameIdentifier = await User.findOne({
      where: { identifier },
    });
    if (!anyUserWithSameIdentifier) return identifier;
  }

  return generateUserIdentifier(userData, {
    includeLast: true,
    salt: getRandomSalt(),
  });
};

module.exports = { getFullName, generateUniqueUserIdentifier };

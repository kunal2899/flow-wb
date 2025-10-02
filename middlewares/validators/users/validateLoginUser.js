const { loginUserSchema } = require("../../../schemas/users");
const validateEntity = require("../../../utils/validateEntity");

const validateLoginUser = (req, res, next) => {
  try {
    const user = req.body;
    validateEntity({
      schema: loginUserSchema,
      entity: user,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in validators.validateLoginUser - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
};

module.exports = validateLoginUser;

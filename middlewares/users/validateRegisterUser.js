const { registerUserSchema } = require("../../schemas/users");
const validateEntity = require("../../utils/validateEntity");

const validateRegisterUser = (req, res, next) => {
  try {
    const user = req.body;
    validateEntity({
      schema: registerUserSchema,
      entity: user,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in middlewares.validateRegisterUser - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
}

module.exports = validateRegisterUser;
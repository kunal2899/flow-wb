const Joi = require("joi");
const { pickFields } = require("@utils/joiUtils");

const validationRules = {
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().pattern(
    new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
  ),
};

const registerUserSchema = Joi.object().keys({
  ...pickFields(
    validationRules,
    ["firstName", "lastName", "email", "password"],
    ["firstName", "email", "password"]
  ),
});

const getLoginSchemaData = type => {
  switch (type) {
    case "email":
      return Joi.object().keys({
        ...pickFields(validationRules, ["email", "password"], ["*"]),
      });
    default:
      throw new Error("Invalid login type");
  }
}

const loginUserSchema = Joi.object().keys({
  type: Joi.string().valid("email").required(),
  data: Joi.alternatives().conditional("type", [
    {
      is: "email",
      then: getLoginSchemaData("email"),
      otherwise: Joi.forbidden(),
    },
    // { is: "sso", then: getLoginSchemaData("sso"), otherwise: Joi.forbidden() }
  ]),
});

const updateUserSchema = Joi.object().keys({
  ...pickFields(validationRules, ["firstName", "lastName", "email"], []),
});

const changePasswordSchema = Joi.object().keys({
  currentPassword: validationRules.password.required(),
  newPassword: validationRules.password.required(),
  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  changePasswordSchema,
};

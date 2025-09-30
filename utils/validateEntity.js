const validateEntity = ({ schema, entity, onSuccess, onError }) => {
  const { error: validationError } = schema.validate(entity);
    if (validationError) {
      onError?.(validationError);
      throw new Error(
        `Invalid payload provided${
          validationError.message ? `: ${validationError.message}` : "!"
        }`
      );
    }
    onSuccess?.();
};

module.exports = validateEntity;

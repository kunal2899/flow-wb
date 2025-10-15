const validateEntity = ({ schema, entity, onSuccess, onError }) => {
  if (!entity) throw new Error("Entity is required");
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
    return true;
};

module.exports = validateEntity;

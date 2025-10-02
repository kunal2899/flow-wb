/**
 * Import fields from validation rules with flexible configuration
 * @param {Object} validationRules - Object containing Joi validation rules
 * @param {Array|String} requiredFields - Fields to make required. Use "*" for all fields, or array of field names
 * @param {Array} excludeFields - Fields to exclude from the schema
 * @param {Object} overrides - Field-specific overrides (e.g., { email: Joi.string().email().lowercase() })
 * @returns {Object} Processed validation rules object
 */
const importFields = (validationRules, requiredFields = [], excludeFields = [], overrides = {}) => {
  // Handle string input for requiredFields (e.g., "*")
  const requiredArray = Array.isArray(requiredFields) ? requiredFields : [requiredFields];
  const makeAllRequired = requiredArray.includes("*");
  
  return Object.entries(validationRules).reduce((acc, [key, value]) => {
    // Skip excluded fields
    if (excludeFields.includes(key)) return acc;
    
    // Apply field-specific overrides first
    let fieldRule = overrides[key] || value;
    
    // Apply required constraint
    if (makeAllRequired || requiredArray.includes(key)) {
      fieldRule = fieldRule.required();
    }
    
    acc[key] = fieldRule;
    return acc;
  }, {});
};

/**
 * Create a schema with only specific fields
 * @param {Object} validationRules - Object containing Joi validation rules
 * @param {Array} includeFields - Only include these fields
 * @param {Array} requiredFields - Fields to make required from the included fields
 * @param {Object} overrides - Field-specific overrides
 * @returns {Object} Processed validation rules object
 */
const pickFields = (validationRules, includeFields = [], requiredFields = [], overrides = {}) => {
  // If includeFields is empty, include all fields
  const fieldsToInclude = includeFields.length === 0 
    ? Object.keys(validationRules) 
    : includeFields;
  
  const filteredRules = Object.fromEntries(
    Object.entries(validationRules).filter(([key]) => fieldsToInclude.includes(key))
  );
  
  // If requiredFields is empty and we have included fields, make all included fields required
  const finalRequiredFields = requiredFields[0] === "*" 
    ? fieldsToInclude 
    : requiredFields;
  
  return importFields(filteredRules, finalRequiredFields, [], overrides);
};

module.exports = {
  importFields,
  pickFields,
}
const jsonLogic = require("json-logic-js");
const { JSONPath } = require("jsonpath-plus");
const { isString, isObject, has, isNil } = require("lodash");

/**
 * Checks if a string is a valid JSONPath expression
 * @param {string} str - The string to check
 * @returns {boolean} - True if it's a valid JSONPath expression
 */
const isJsonPath = (str) => {
  if (!str || !isString(str)) return false;

  // JSONPath expressions can start with:
  // 1. $ - Root node
  // 2. @ - Current node (used in filters)
  // 3. Direct property access (no prefix)
  // 4. Array access patterns

  // Root node expressions
  if (str.startsWith("$.") || str === "$") return true;

  // Current node expressions (used in filters)
  if (str.startsWith("@.") || str === "@") return true;

  // Filter expressions with @
  if (str.includes("?(@") || str.includes("[?(@")) return true;

  // Array access patterns
  if (/^\w+\[\d+\]/.test(str)) return true; // like "users[0]"
  if (/^\w+\[['"][^'"]+['"]\]/.test(str)) return true; // like "nodes['34']"

  // Property chains without $ prefix
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/.test(str))
    return true; // like "users.name"

  // Complex expressions with wildcards, recursive descent, etc.
  if (str.includes("..") || str.includes("*") || str.includes("[*]"))
    return true;

  return false;
};

/**
 * Resolves a JSONPath string against the appropriate context
 * @param {string} path - The JSONPath to resolve
 * @param {Object} globalContext - The global context
 * @param {Object} currentContext - The current context for @ expressions
 * @returns {any} - The resolved value
 */
const resolveJsonPath = (path, globalContext, currentContext = null) => {
  try {
    let result;
    // Handle current context expressions (@)
    if (path.startsWith("@") && currentContext !== null) {
      if (path === "@") {
        result = [currentContext];
      } else {
        // Remove @ and evaluate against current context
        const contextPath = path.substring(1);
        result = JSONPath({ path: "$" + contextPath, json: currentContext });
      }
    } else {
      // Handle root expressions ($) and direct property access
      let queryPath = path;
      // If path doesn't start with $, add it for JSONPath evaluation
      if (!path.startsWith("$") && !path.startsWith("@")) {
        queryPath = "$." + path;
      }
      result = JSONPath({ path: queryPath, json: globalContext });
    }
    return result && result.length ? result[0] : undefined;
  } catch (error) {
    console.warn(
      `JSONPath evaluation failed for path "${path}":`,
      error.message
    );
    return undefined;
  }
};

/**
 * Replaces all JSONPath expressions using unified stringify approach:
 * - {{JSONPath}} patterns within strings (including object keys)
 * - {"var": "JSONPath"} objects with their resolved values
 * 
 * @param {Object|Array|any} logic - The data structure to process
 * @param {Object} globalContext - The global data context to query against
 * @param {Object} currentContext - The current context for @ expressions (optional)
 * @returns {Object|Array|any} - The processed structure with JSONPath expressions replaced
 */
const replaceJsonPathVars = (logic, globalContext, currentContext = null) => {
  try {
    let jsonString = JSON.stringify(logic);
    
    jsonString = jsonString.replace(/{{([^}]+)}}/g, (match, path) => {
      path = path.trim();
      if (!isJsonPath(path)) return match;
      const resolved = resolveJsonPath(path, globalContext, currentContext);
      if (isNil(resolved)) return '';
      if (isString(resolved)) return resolved;
      if (isObject(resolved)) return JSON.stringify(resolved);
      return String(resolved);
    });
    
    jsonString = jsonString.replace(/\{\s*"var"\s*:\s*"([^"]+)"\s*\}/g, (match, path) => {
      path = path.trim();
      if (!isJsonPath(path)) return match;
      const resolved = resolveJsonPath(path, globalContext, currentContext);
      if (isNil(resolved)) return 'null';
      return JSON.stringify(resolved);
    });
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error in replaceJsonPathVars:', error.message);
    return logic;
  }
};

/**
 * Convenience function that combines JSONPath variable replacement with json-logic evaluation
 * @param {Object} logic - The json-logic structure with JSONPath variables
 * @param {Object} globalContext - The global data context
 * @param {Object} currentContext - The current context for @ expressions (optional)
 * @returns {any} - The result of evaluating the processed logic
 */
const evaluateLogicWithJsonPath = (
  logic,
  globalContext,
  currentContext = null
) => {
  const jsonLogic = require("json-logic-js");
  const processedLogic = replaceJsonPathVars(
    logic,
    globalContext,
    currentContext
  );
  return jsonLogic.apply(processedLogic);
};

module.exports = {
  replaceJsonPathVars,
  evaluateLogicWithJsonPath,
  isJsonPath
};

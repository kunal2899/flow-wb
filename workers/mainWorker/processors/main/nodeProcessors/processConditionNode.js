const { evaluateLogicWithJsonPath } = require("@utils/jsonPathLogic");
const redisCacheService = require("@services/coreServices/redisCache.service");
const { isNil } = require("lodash");

const processConditionNode = async (workflowNode, globalContext) => {
  try {
    const { id: workflowNodeId } = workflowNode;
    const cacheKey = `nodeConfig:${workflowNodeId}`;
    let eligibleRuleIds = await redisCacheService.get(cacheKey);
    if (isNil(eligibleRuleIds)) {
      const rules = await Rule.scope("plain").findAll({
        where: { workflowNodeId },
        attributes: ["id", "expression", "label"],
      });
      eligibleRuleIds = rules
        .filter((rule) => {
          try {
            return evaluateLogicWithJsonPath(
              rule.expression,
              globalContext,
              workflowNode
            );
          } catch (error) {
            console.warn(
              `Rule evaluation failed for rule ${rule.id}:`,
              error.message
            );
            return false;
          }
        })
        .map((rule) => rule.id);
      await redisCacheService.set(cacheKey, eligibleRuleIds, 60 * 60 * 24);
    }
    // If no eligible rules, return null to select the default node
    if (eligibleRuleIds.length === 0) return null;
    return eligibleRuleIds;
  } catch (error) {
    console.error("Error in nodeProcessors.processConditionNode - ", error);
    throw error;
  }
};

module.exports = processConditionNode;

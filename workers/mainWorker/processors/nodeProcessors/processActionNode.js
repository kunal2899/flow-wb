const { replaceJsonPathVars } = require("../../../../utils/jsonPathLogic");
const redisCacheService = require("../../../../services/coreServices/redisCache.service");
const { isNil, pick } = require("lodash");
const makeApiCall = require("../../helpers/makeApiCall");

const processActionNode = async (workflowNode, globalContext) => {
  try {
    const { id: workflowNodeId } = workflowNode;
    const cacheKey = `nodeConfig:${workflowNodeId}`;
    let userEndpoint = await redisCacheService.get(cacheKey);
    if (isNil(userEndpoint)) {
      const actionNodeConfig = await ActionNodeConfig.scope("plain").findOne({
        where: {
          workflowNodeId,
        },
        include: [
          {
            model: UserEndpoint,
            attributes: ["headers", "body", "authConfig"],
            include: [
              {
                model: Endpoint,
                attributes: ["url", "method", "headers", "body"],
              },
            ],
          },
        ],
        attributes: ["userEndpointId"],
      });
      if (!actionNodeConfig) throw new Error("Invalid action node config");

      userEndpoint = actionNodeConfig.userEndpoint;
      await redisCacheService.set(cacheKey, userEndpoint, 60 * 60 * 24);
    }
    userEndpoint = replaceJsonPathVars(
      userEndpoint,
      globalContext,
      workflowNode
    );
    const {
      endpoint: { url, method, headers: endpointHeaders, body: endpointBody },
      headers,
      body,
      authConfig,
    } = userEndpoint;
    const requestHeaders = { ...endpointHeaders, ...headers };
    const requestBody = { ...endpointBody, ...body };
    const request = {
      url,
      method,
      headers: requestHeaders,
      body: requestBody,
      authConfig,
    };
    const outputData = await makeApiCall(request);
    return pick(outputData, ["success", "data", "error"]);
  } catch (error) {
    console.error("Error in nodeProcessors.processActionNode - ", error);
    throw error;
  }
};

module.exports = processActionNode;

const axios = require("axios");

const makeApiCall = async (request, options = {}) => {
  const {
    url,
    method,
    headers = {},
    body,
    authConfig,
    ...otherConfig
  } = request;

  let axiosConfig = {
    url,
    method: method.toLowerCase(),
    headers: { ...headers },
    timeout: options.timeout || 30000,
    ...otherConfig,
  };

  // Handle authentication
  if (authConfig) {
    switch (authConfig.type) {
      case "bearer":
        axiosConfig.headers.Authorization = `Bearer ${authConfig.token}`;
        break;
      case "basic":
        axiosConfig.auth = {
          username: authConfig.username,
          password: authConfig.password,
        };
        break;
      case "apikey":
        axiosConfig.headers[authConfig.keyName] = authConfig.keyValue;
        break;
    }
  }

  // Handle request body based on method
  const methodsWithBody = ["post", "put", "patch"];
  if (methodsWithBody.includes(method.toLowerCase()) && body) {
    axiosConfig.data = body;
  } else if (method.toLowerCase() === "get" && body) {
    axiosConfig.params = body;
  }

  try {
    const response = await axios(axiosConfig);
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      },
    };
  }
};

module.exports = makeApiCall;

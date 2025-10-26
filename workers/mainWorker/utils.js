const getExecutionKey = (workflowExecutionId, startNodeId = null) => {
  const executionKey = `${workflowExecutionId}${
    !!startNodeId ? `::${startNodeId}` : ""
  }`;
  return executionKey;
};

const formatTimeInIST = ({ tillTimeMs = null, addMs = 0 }) => {
  const tzOffset = (5 * 60 + 30) * 60 * 1000;
  const timeInMs = !tillTimeMs ? Date.now() + addMs : tillTimeMs;
  const dateStr = new Date(timeInMs + tzOffset);
  return dateStr.toISOString().replace("T", " ").replace("Z", " +0530");
};

module.exports = {
  getExecutionKey,
  formatTimeInIST,
}
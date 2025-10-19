const WorkflowExecution = require("../models/WorkflowExecution.model");

const checkWorkflowExecutionExistence = async (req, res, next) => {
  try {
    const { userWorkflowId, workflowExecutionId } = req.params;
    const workflowExecution = await WorkflowExecution.findOne({
      where: { id: workflowExecutionId, userWorkflowId },
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    });
    if (!workflowExecution) {
      return res.status(404).send({ message: "Workflow execution not found!" });
    }
    req.workflowExecution = workflowExecution;
    return next();
  } catch (error) {
    console.error(
      "Error in middlewares.checkWorkflowExecutionExistence - ",
      error
    );
    return res.status(400).send({ message: "Something went wrong!" });
  }
};

module.exports = checkWorkflowExecutionExistence;

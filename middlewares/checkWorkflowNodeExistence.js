const checkWorkflowNodeExistence = async(req, res, next) => {
  try {
    const { workflowNodeId } = req.params
    const workflowNode = await WorkflowNode.findByPk(workflowNodeId, {
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      include: [
        {
          model: Node,
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        },
        {
          model: Workflow,
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        },
      ],
    });
    if (!workflowNode) {
      return res.status(404).send({ message: "Workflow node not found" });
    }
    req.workflowNode = workflowNode;
    next();
  } catch (error) {
    console.error("Error in middlewares.checkNodeExistence - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
}

module.exports = checkWorkflowNodeExistence
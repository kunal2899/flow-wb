const { USER_WORKFLOW_ROLE } = require("@constants/userWorkflow");

const checkWorkflowAccess = async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const { id: userId } = req.user;

    if (!workflowId) {
      return res.status(400).send({ message: "Invalid workflow id passed" });
    }

    const userWorkflow = await UserWorkflow.findOne({
      where: {
        workflowId,
        userId,
        role: USER_WORKFLOW_ROLE.OWNER,
      },
      attributes: {
        exclude: ["workflowId", "createdAt", "updatedAt", "deletedAt"],
      },
      include: [
        {
          model: Workflow,
          as: "workflow",
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        },
      ],
    });

    if (!userWorkflow) {
      return res.status(403).send({ message: "You are not authorized to access this workflow" });
    }

    req.userWorkflow = userWorkflow;
    console.log({ workflowIdAtWOrkflow: workflowId })
    next();
  } catch (error) {
    console.error("Error in middlewares.checkWorkflowAccess - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
}

module.exports = checkWorkflowAccess
const UserWorkflow = require("../models/UserWorkflow.model");

const checkUserWorkflowAccess = async (req, res, next) => {
  try {
    const { userWorkflowId } = req.params;
    const { id: userId } = req.user;

    if (!userWorkflowId) {
      return res
        .status(400)
        .send({ message: "Invalid user workflow id passed" });
    }

    const userWorkflow = await UserWorkflow.findOne({
      where: { id: userWorkflowId, userId },
    });

    if (!userWorkflow) {
      return res
        .status(403)
        .send({
          message: "You are not authorized to access this user workflow",
        });
    }
    req.userWorkflow = userWorkflow;
    next();
  } catch (error) {
    console.error("Error in middlewares.checkUserWorkflowAccess - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
};

module.exports = checkUserWorkflowAccess;

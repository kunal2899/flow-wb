const { USER_WORKFLOW_TRIGGER_TYPE } = require("../constants/userWorkflow");

const toggleUserWorkflowTrigger = async (req, res) => {
  try {
    const { userWorkflowTrigger } = req;
    const updatedActiveStatus = !userWorkflowTrigger.isActive;
    await UserWorkflowTrigger.toggleTriggerByType(
      userWorkflowTrigger,
      updatedActiveStatus
    );
    return res.status(200).json({
      success: true,
      message: `User workflow trigger ${
        updatedActiveStatus ? "enabled" : "disabled"
      } successfully`,
    });
  } catch (error) {
    console.error(
      "Error in userWorkfowTriggersController.toggleUserWorkflowTrigger - ",
      error
    );
    return res.status(400).json({
      success: false,
      message:
        error.type === "FOR_USER" ? error.message : "Something went wrong!",
    });
  }
};

const deleteUserWorkflowTrigger = async (req, res) => {
  try {
    const { userWorkflowTrigger } = req;
    switch (userWorkflowTrigger.type) {
      case USER_WORKFLOW_TRIGGER_TYPE.CRON:
        await UserWorkflowTrigger.deleteCronTrigger(userWorkflowTrigger);
        break;
      case USER_WORKFLOW_TRIGGER_TYPE.SCHEDULE:
        break;
      case USER_WORKFLOW_TRIGGER_TYPE.WEBHOOK:
        break;
      default:
        throw new Error("Unsupported trigger type");
    }
    return res.status(200).json({
      success: true,
      message: "User workflow trigger deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error in userWorkfowTriggersController.deleteUserWorkflowTrigger - ",
      error
    );
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = { toggleUserWorkflowTrigger, deleteUserWorkflowTrigger };

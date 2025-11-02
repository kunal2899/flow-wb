const checkTriggerExistence = async (req, res, next) => {
  try {
    const { userWorkflowTriggerId } = req.params;
    if (!userWorkflowTriggerId)
      return res
        .status(400)
        .json({ message: "User workflow trigger id is required" });
    const userWorkflowTrigger = await UserWorkflowTrigger.findByPk(
      userWorkflowTriggerId,
      { attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] } }
    );
    if (!userWorkflowTrigger)
      return res
        .status(404)
        .json({ message: "User workflow trigger not found" });
    req.userWorkflowTrigger = userWorkflowTrigger;
    next();
  } catch (error) {
    console.error("Error in middlewares.checkTriggerExistence - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
};

module.exports = checkTriggerExistence;

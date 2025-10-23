const checkConnectionExistence = async (req, res, next) => {
  try {
    const { connectionId } = req.params;
    if (!connectionId)
      return res.status(400).send({ message: "Connection id is required" });
    const connection = await WorkflowNodeConnection.findByPk(connectionId);
    if (!connection)
      return res.status(404).send({ message: "Connection not found" });
    req.connection = connection;
    next();
  } catch (error) {
    console.error("Error in middlewares.checkConnectionExistence - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
};

module.exports = checkConnectionExistence;

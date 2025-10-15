const express = require("express");
const checkUserWorkflowAccess = require("../middlewares/checkUserWorkflowAccess");
const { startUserWorkflow } = require("../controllers/userWorkflows.controller");

const router = express.Router();

router.param("userWorkflowId", checkUserWorkflowAccess);

router.post("/:userWorkflowId/start", startUserWorkflow);

module.exports = userWorkflowRoutes = router;
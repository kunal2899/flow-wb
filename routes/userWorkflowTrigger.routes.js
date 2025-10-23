const express = require("express");
const checkTriggerExistence = require("@middlewares/checkTriggerExistence");
const {
  toggleUserWorkflowTrigger,
  deleteUserWorkflowTrigger,
} = require("@controllers/userWorkfowTriggers.controller");
const router = express.Router();

router.param("userWorkflowTriggerId", checkTriggerExistence);

router.patch("/:userWorkflowTriggerId/toggle", toggleUserWorkflowTrigger);

router.delete("/:userWorkflowTriggerId", deleteUserWorkflowTrigger);

module.exports = userWorkflowTriggerRoutes = router;

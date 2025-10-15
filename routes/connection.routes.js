const express = require("express");
const {
  createConnection,
  updateConnection,
  deleteConnection,
  updateConnectionStatus,
} = require("../controllers/connections.controller");
const {
  validateConnection,
  validateConnectionStatus,
} = require("../middlewares/validators/workflows/validateConnection");
const checkConnectionExistence = require("../middlewares/checkConnectionExistence");

const router = express.Router({ mergeParams: true });

router.param("connectionId", checkConnectionExistence);

router.post("/", validateConnection, createConnection);

router.put("/:connectionId", validateConnection, updateConnection);

router.patch(
  "/:connectionId/status",
  validateConnectionStatus,
  updateConnectionStatus
);

router.delete("/:connectionId", deleteConnection);

module.exports = connectionRoutes = router;

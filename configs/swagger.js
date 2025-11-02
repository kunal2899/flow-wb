const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Flow Workflow Builder API",
      version: "1.0.0",
      description: "Flow - Workflow Builder API Documentation",
      contact: {
        name: "Kunal J.",
        email: "kunaljain649@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Workflow: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the workflow",
              example: 1,
            },
            name: {
              type: "string",
              description: "Name of the workflow",
              example: "Email Marketing Campaign",
            },
            description: {
              type: "string",
              description: "Description of the workflow",
              example: "Automated email marketing workflow for new subscribers",
            },
            identifier: {
              type: "string",
              description: "Unique identifier string for the workflow",
              example: "email-marketing-9xty",
            },
            visibility: {
              type: "string",
              enum: ["public", "private"],
              description: "Visibility setting for the workflow",
              example: "private",
            },
            status: {
              type: "string",
              enum: ["draft", "published", "archived"],
              description: "Current status of the workflow",
              example: "draft",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the workflow was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the workflow was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the workflow was deleted, null if not deleted",
              example: null,
            },
          },
        },
        UserWorkflow: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description:
                "Unique identifier for the user-workflow relationship",
              example: 1,
            },
            userId: {
              type: "integer",
              description: "ID of the user",
              example: 1,
            },
            role: {
              type: "string",
              enum: ["owner", "viewer", "editor"],
              description: "Role of the user in the workflow",
              example: "owner",
            },
            workflow: { $ref: "#/components/schemas/Workflow" },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user-workflow was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user-workflow was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the user-workflow was deleted, null if not deleted",
              example: null,
            },
          },
        },
        User: {
          type: "object",
          properties: {
            identifier: {
              type: "string",
              description: "Unique identifier for the user",
              example: "john-doe-abc123",
            },
            firstName: {
              type: "string",
              description: "User's first name",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User's last name",
              example: "Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "john.doe@example.com",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the user was deleted, null if not deleted",
              example: null,
            },
          },
        },
        Node: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the node",
              example: 1,
            },
            name: {
              type: "string",
              description: "Name of the node",
              example: "Send Email",
            },
            description: {
              type: "string",
              description: "Description of the node",
              example: "Sends an email notification to the user",
            },
            type: {
              type: "string",
              enum: ["action", "condition", "delay"],
              description: "Type of the node",
              example: "action",
            },
            retryConfig: {
              type: "object",
              description: "Retry configuration for the node",
              properties: {
                max_attempts: { type: "integer", example: 3 },
                backoff_strategy: { type: "string", example: "exponential" },
                base_delay_ms: { type: "integer", example: 2000 },
                max_delay_ms: { type: "integer", example: 30000 },
                jitter: { type: "boolean", example: true },
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the node was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the node was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the node was deleted, null if not deleted",
              example: null,
            },
          },
        },
        WorkflowNode: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the workflow node",
              example: 1,
            },
            workflowId: {
              type: "integer",
              description: "ID of the workflow",
              example: 1,
            },
            nodeId: {
              type: "integer",
              description: "ID of the node",
              example: 1,
            },
            overrideConfig: {
              type: "object",
              description:
                "Override configuration for the node in this workflow",
            },
            node: { $ref: "#/components/schemas/Node" },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the workflow node was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the workflow node was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the workflow node was deleted, null if not deleted",
              example: null,
            },
          },
        },
        Endpoint: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the endpoint",
              example: 1,
            },
            name: {
              type: "string",
              description: "Name of the endpoint",
              example: "SendGrid Email API",
            },
            description: {
              type: "string",
              description: "Description of the endpoint",
              example: "SendGrid API for sending emails",
            },
            url: {
              type: "string",
              description: "URL of the endpoint",
              example: "https://api.sendgrid.com/v3/mail/send",
            },
            method: {
              type: "string",
              enum: ["get", "post", "put", "delete"],
              description: "HTTP method for the endpoint",
              example: "post",
            },
            headers: {
              type: "object",
              description: "Default headers for the endpoint",
            },
            body: {
              type: "object",
              description: "Default body for the endpoint",
            },
            isGlobal: {
              type: "boolean",
              description: "Whether the endpoint is global",
              example: false,
            },
            provider: {
              type: "string",
              description: "Provider of the endpoint",
              example: "SendGrid",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the endpoint was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the endpoint was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the endpoint was deleted, null if not deleted",
              example: null,
            },
          },
        },
        UserEndpoint: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the user endpoint",
              example: 1,
            },
            userId: {
              type: "integer",
              description: "ID of the user",
              example: 1,
            },
            endpointId: {
              type: "integer",
              description: "ID of the endpoint",
              example: 1,
            },
            headers: {
              type: "object",
              description: "User-specific headers for the endpoint",
            },
            body: {
              type: "object",
              description: "User-specific body for the endpoint",
            },
            authConfig: {
              type: "object",
              description: "Authentication configuration for the endpoint",
            },
            endpoint: { $ref: "#/components/schemas/Endpoint" },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user endpoint was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user endpoint was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the user endpoint was deleted, null if not deleted",
              example: null,
            },
          },
        },
        ActionNodeConfig: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the action node config",
              example: 1,
            },
            workflowNodeId: {
              type: "integer",
              description: "ID of the workflow node",
              example: 1,
            },
            userEndpointId: {
              type: "integer",
              description: "ID of the user endpoint",
              example: 1,
            },
            overrides: {
              type: "object",
              description: "Override configuration for the action node",
            },
            userEndpoint: { $ref: "#/components/schemas/UserEndpoint" },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the action node config was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description:
                "Timestamp when the action node config was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the action node config was deleted, null if not deleted",
              example: null,
            },
          },
        },
        Rule: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the rule",
              example: 1,
            },
            workflowNodeId: {
              type: "integer",
              description: "ID of the workflow node",
              example: 1,
            },
            expression: {
              type: "object",
              description: "Rule expression",
              example: { and: [{ "==": [{ var: "user.type" }, "premium"] }] },
            },
            label: {
              type: "string",
              description: "Label for the rule",
              example: "User is premium",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the rule was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the rule was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the rule was deleted, null if not deleted",
              example: null,
            },
          },
        },
        DelayNodeConfig: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the delay node config",
              example: 1,
            },
            workflowNodeId: {
              type: "integer",
              description: "ID of the workflow node",
              example: 1,
            },
            duration: {
              type: "integer",
              description: "Delay duration value",
              example: 5,
            },
            unit: {
              type: "string",
              enum: ["milliseconds", "seconds", "minutes", "hours", "days"],
              description: "Delay duration unit",
              example: "minutes",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the delay node config was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description:
                "Timestamp when the delay node config was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the delay node config was deleted, null if not deleted",
              example: null,
            },
          },
        },
        WorkflowNodeConnection: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the connection",
              example: 1,
            },
            sourceNodeId: {
              type: "integer",
              description: "ID of the source workflow node",
              example: 1,
            },
            destinationNodeId: {
              type: "integer",
              description: "ID of the destination workflow node",
              example: 2,
            },
            ruleId: {
              type: "integer",
              description: "ID of the condition rule (for condition nodes)",
              example: 1,
            },
            isActive: {
              type: "boolean",
              description: "Whether the connection is active",
              example: true,
            },
            sourceNode: { $ref: "#/components/schemas/WorkflowNode" },
            destinationNode: { $ref: "#/components/schemas/WorkflowNode" },
            rule: { $ref: "#/components/schemas/Rule" },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the connection was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the connection was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the connection was deleted, null if not deleted",
              example: null,
            },
          },
        },
        UserWorkflowTriggers: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the user workflow trigger",
              example: 1,
            },
            userWorkflowId: {
              type: "integer",
              description: "ID of the user workflow",
              example: 1,
            },
            type: {
              type: "string",
              enum: ["CRON", "SCHEDULE", "WEBHOOK"],
              description: "Type of the trigger",
              example: "CRON",
            },
            config: {
              type: "object",
              description: "Configuration for the trigger",
              example: { frequency: "custom", expression: "0 0 * * *" },
            },
            isActive: {
              type: "boolean",
              description: "Whether the trigger is active",
              example: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the trigger was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the trigger was last updated",
              example: "2025-01-10T10:30:00Z",
            },
            deletedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the trigger was deleted, null if not deleted",
              example: null,
            },
          },
        },
        WorkflowExecutions: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the workflow execution",
              example: 1,
            },
            userWorkflowId: {
              type: "integer",
              description: "ID of the user workflow",
              example: 1,
            },
            status: {
              type: "string",
              enum: [
                "QUEUED",
                "RUNNING",
                "COMPLETED",
                "FAILED",
                "STOPPED",
                "PENDING",
                "PAUSED",
              ],
              description: "Current status of the workflow execution",
              example: "RUNNING",
            },
            startedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the execution started",
              example: "2025-01-10T10:00:00Z",
            },
            endedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the execution ended, null if still running",
              example: null,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the execution record was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description:
                "Timestamp when the execution record was last updated",
              example: "2025-01-10T10:30:00Z",
            },
          },
        },
        WorkflowNodeExecutions: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the workflow node execution",
              example: 1,
            },
            workflowExecutionId: {
              type: "integer",
              description: "ID of the workflow execution",
              example: 1,
            },
            workflowNodeId: {
              type: "integer",
              description: "ID of the workflow node",
              example: 1,
            },
            status: {
              type: "string",
              enum: [
                "QUEUED",
                "RUNNING",
                "COMPLETED",
                "FAILED",
                "CANCELLED",
                "PENDING",
                "PAUSED",
              ],
              description: "Current status of the node execution",
              example: "RUNNING",
            },
            startedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the node execution started",
              example: "2025-01-10T10:00:00Z",
            },
            endedAt: {
              type: ["string", "null"],
              format: "date-time",
              description:
                "Timestamp when the node execution ended, null if still running",
              example: null,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description:
                "Timestamp when the node execution record was created",
              example: "2025-01-10T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description:
                "Timestamp when the node execution record was last updated",
              example: "2025-01-10T10:30:00Z",
            },
          },
        },
      },
      apiSchemas: {
        CreateWorkflowRequest: {
          title: "CreateWorkflowRequest",
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              description: "Name of the workflow",
              example: "Email Marketing Campaign",
            },
            description: {
              type: "string",
              description: "Description of the workflow",
              example: "Automated email marketing workflow for new subscribers",
            },
            visibility: {
              type: "string",
              enum: ["public", "private"],
              description: "Visibility setting for the workflow",
              example: "private",
            },
          },
        },
        UpdateWorkflowRequest: {
          title: "UpdateWorkflowRequest",
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the workflow",
              example: "Updated Email Marketing Campaign",
            },
            description: {
              type: "string",
              description: "Description of the workflow",
              example:
                "Updated automated email marketing workflow for new subscribers",
            },
            visibility: {
              type: "string",
              enum: ["public", "private"],
              description: "Visibility setting for the workflow",
              example: "public",
            },
            status: {
              type: "string",
              enum: ["draft", "published", "archived"],
              description: "Status of the workflow",
              example: "published",
            },
          },
        },
        UpdateWorkflowStatusRequest: {
          title: "UpdateWorkflowStatusRequest",
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["draft", "published", "archived"],
              description: "New status for the workflow",
              example: "published",
            },
          },
        },
        UpdateWorkflowVisibilityRequest: {
          title: "UpdateWorkflowVisibilityRequest",
          type: "object",
          required: ["visibility"],
          properties: {
            visibility: {
              type: "string",
              enum: ["public", "private"],
              description: "New visibility setting for the workflow",
              example: "public",
            },
          },
        },
        ErrorResponse: {
          title: "ErrorResponse",
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Success status",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
              example: "Something went wrong!",
            },
          },
        },
        SuccessResponse: {
          title: "SuccessResponse",
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Success status",
              example: true,
            },
            data: {
              type: "object",
              description: "Response data",
              example: {},
            },
            message: {
              type: "string",
              description: "Success message (optional)",
              example: "Operation completed successfully",
            },
          },
          required: ["success", "data"],
        },
        RegisterUserRequest: {
          title: "RegisterUserRequest",
          type: "object",
          required: ["firstName", "email", "password"],
          properties: {
            firstName: {
              type: "string",
              description: "User's first name",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User's last name",
              example: "Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description:
                "User's password (min 8 chars, must include uppercase, lowercase, number, and special char)",
              example: "StrongP@ss123",
            },
          },
        },
        LoginUserRequest: {
          title: "LoginUserRequest",
          type: "object",
          required: ["type", "data"],
          properties: {
            type: {
              type: "string",
              enum: ["email"],
              description: "Authentication type",
              example: "email",
            },
            data: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  description: "User's email address",
                  example: "john.doe@example.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  description: "User's password",
                  example: "StrongP@ss123",
                },
              },
            },
          },
        },
        AuthResponse: {
          title: "AuthResponse",
          type: "object",
          required: ["success", "data"],
          properties: {
            success: {
              type: "boolean",
              description: "Success status",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  description: "JWT authentication token",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
              required: ["token", "user"],
            },
            message: {
              type: "string",
              description: "Success message (optional)",
              example: "Login successful",
            },
          },
        },
        CreateWorkflowNodeRequest: {
          title: "CreateWorkflowNodeRequest",
          type: "object",
          required: ["name", "type"],
          properties: {
            name: {
              type: "string",
              description: "Name of the node",
              example: "Send Email",
            },
            description: {
              type: "string",
              description: "Description of the node",
              example: "Sends an email notification to the user",
            },
            type: {
              type: "string",
              enum: ["action", "condition", "delay"],
              description: "Type of the node",
              example: "action",
            },
            overrideConfig: {
              type: "object",
              description:
                "Override configuration for the node in this workflow",
            },
            data: {
              type: "object",
              description: "Type-specific configuration data",
              properties: {
                endpointId: {
                  type: "integer",
                  description: "ID of existing endpoint (for action nodes)",
                  example: 1,
                },
                endpoint: {
                  type: "object",
                  description: "New endpoint data (for action nodes)",
                  properties: {
                    name: { type: "string", example: "SendGrid Email API" },
                    description: {
                      type: "string",
                      example: "SendGrid API for sending emails",
                    },
                    url: {
                      type: "string",
                      example: "https://api.sendgrid.com/v3/mail/send",
                    },
                    method: {
                      type: "string",
                      enum: ["get", "post", "put", "delete"],
                      example: "post",
                    },
                    headers: { type: "object" },
                    body: { type: "object" },
                    authConfig: { type: "object" },
                  },
                },
                expression: {
                  type: "object",
                  description: "Condition expression (for condition nodes)",
                },
                label: {
                  type: "string",
                  description: "Condition label (for condition nodes)",
                  example: "User is premium",
                },
                duration: {
                  type: "integer",
                  description:
                    "Delay duration in milliseconds (for delay nodes)",
                  example: 5000,
                },
              },
            },
          },
        },
        UpdateWorkflowNodeRequest: {
          title: "UpdateWorkflowNodeRequest",
          type: "object",
          required: ["overrideConfig"],
          properties: {
            overrideConfig: {
              type: "object",
              description:
                "Override configuration for the node in this workflow",
              properties: {
                retry: {
                  type: "object",
                  description: "Retry configuration override",
                  properties: {
                    maxAttempts: { type: "integer", example: 5 },
                    backoffStrategy: {
                      type: "string",
                      enum: ["exponential", "linear", "constant"],
                      example: "exponential",
                    },
                    baseDelayMs: { type: "integer", example: 1000 },
                    maxDelayMs: { type: "integer", example: 60000 },
                    jitter: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
        },
        CreateConnectionRequest: {
          title: "CreateConnectionRequest",
          type: "object",
          required: ["sourceNodeId", "destinationNodeId"],
          properties: {
            sourceNodeId: {
              type: "integer",
              description: "ID of the source workflow node",
              example: 1,
            },
            destinationNodeId: {
              type: "integer",
              description: "ID of the destination workflow node",
              example: 2,
            },
            ruleId: {
              type: "integer",
              description: "ID of the condition rule (for condition nodes)",
              example: 1,
            },
          },
        },
        UpdateConnectionRequest: {
          title: "UpdateConnectionRequest",
          type: "object",
          properties: {
            ruleId: {
              type: "integer",
              description: "ID of the condition rule (for condition nodes)",
              example: 1,
            },
            isActive: {
              type: "boolean",
              description: "Whether the connection is active",
              example: true,
            },
          },
        },
        WorkflowGraph: {
          type: "object",
          required: ["workflowNodes", "connections"],
          properties: {
            workflowNodes: {
              type: "array",
              description: "List of nodes in the workflow",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    description: "Unique identifier for the workflow node",
                    example: 1,
                  },
                  overrideConfig: {
                    type: "object",
                    description: "Node-specific configuration overrides",
                  },
                  node: {
                    $ref: "#/components/schemas/Node",
                  },
                },
              },
            },
            connections: {
              type: "array",
              description: "List of active connections between nodes",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    description: "Unique identifier for the connection",
                    example: 1,
                  },
                  sourceNodeId: {
                    type: "integer",
                    description: "ID of the source workflow node",
                    example: 1,
                  },
                  destinationNodeId: {
                    type: "integer",
                    description: "ID of the destination workflow node",
                    example: 2,
                  },
                  ruleId: {
                    type: "integer",
                    description:
                      "ID of the condition rule (for condition nodes)",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        ExecutionHistoryResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                totalExecutionsCount: {
                  type: "integer",
                  description: "Total number of workflow executions",
                  example: 100,
                },
                workflowExecutions: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/WorkflowExecutions",
                  },
                },
              },
            },
          },
        },
        ExecutionLogResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                workflowExecution: {
                  $ref: "#/components/schemas/WorkflowExecutions",
                },
                workflowNodeExecutions: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/WorkflowNodeExecutions",
                  },
                },
              },
            },
          },
        },
        ExecutionStatusResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                workflowExecution: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      description:
                        "Unique identifier for the workflow execution",
                      example: 1,
                    },
                    status: {
                      type: "string",
                      enum: [
                        "QUEUED",
                        "RUNNING",
                        "COMPLETED",
                        "FAILED",
                        "STOPPED",
                        "PENDING",
                        "PAUSED",
                      ],
                      description: "Current status of the workflow execution",
                      example: "RUNNING",
                    },
                    startedAt: {
                      type: "string",
                      format: "date-time",
                      description: "Timestamp when the execution started",
                      example: "2025-01-10T10:00:00Z",
                    },
                    endedAt: {
                      type: ["string", "null"],
                      format: "date-time",
                      description:
                        "Timestamp when the execution ended, null if still running",
                      example: null,
                    },
                  },
                },
                workflowNodeExecutions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        description:
                          "Unique identifier for the workflow node execution",
                        example: 1,
                      },
                      workflowNodeId: {
                        type: "integer",
                        description: "ID of the workflow node",
                        example: 1,
                      },
                      status: {
                        type: "string",
                        enum: [
                          "QUEUED",
                          "RUNNING",
                          "COMPLETED",
                          "FAILED",
                          "CANCELLED",
                          "PENDING",
                          "PAUSED",
                        ],
                        description: "Current status of the node execution",
                        example: "RUNNING",
                      },
                      startedAt: {
                        type: "string",
                        format: "date-time",
                        description:
                          "Timestamp when the node execution started",
                        example: "2025-01-10T10:00:00Z",
                      },
                      endedAt: {
                        type: ["string", "null"],
                        format: "date-time",
                        description:
                          "Timestamp when the node execution ended, null if still running",
                        example: null,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./controllers/*.js", "./routes/*.js"],
};

const specs = swaggerJSDoc(options);

module.exports = specs;

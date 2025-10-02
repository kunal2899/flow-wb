const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flow Workflow Builder API',
      version: '1.0.0',
      description: 'API documentation for Flow - Workflow Builder application',
      contact: {
        name: 'Kunal J.',
        email: 'kunal@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Workflow: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the workflow',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Name of the workflow',
              example: 'Email Marketing Campaign',
            },
            description: {
              type: 'string',
              description: 'Description of the workflow',
              example: 'Automated email marketing workflow for new subscribers',
            },
            identifier: {
              type: 'string',
              description: 'Unique identifier string for the workflow',
              example: 'email-marketing-9xty',
            },
            visibility: {
              type: 'string',
              enum: ['public', 'private'],
              description: 'Visibility setting for the workflow',
              example: 'private',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              description: 'Current status of the workflow',
              example: 'draft',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the workflow was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the workflow was last updated',
            },
          },
        },
        UserWorkflow: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the user-workflow relationship',
              example: 1,
            },
            userId: {
              type: 'integer',
              description: 'ID of the user',
              example: 1,
            },
            workflowId: {
              type: 'integer',
              description: 'ID of the workflow',
              example: 1,
            },
            role: {
              type: 'string',
              enum: ['owner', 'viewer', 'editor'],
              description: 'Role of the user in the workflow',
              example: 'owner',
            },
            workflow: {
              $ref: '#/components/schemas/Workflow',
            },
          },
        },
        CreateWorkflowRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the workflow',
              example: 'Email Marketing Campaign',
            },
            description: {
              type: 'string',
              description: 'Description of the workflow',
              example: 'Automated email marketing workflow for new subscribers',
            },
            visibility: {
              type: 'string',
              enum: ['public', 'private'],
              description: 'Visibility setting for the workflow',
              example: 'private',
            },
          },
        },
        UpdateWorkflowRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the workflow',
              example: 'Updated Email Marketing Campaign',
            },
            description: {
              type: 'string',
              description: 'Description of the workflow',
              example: 'Updated automated email marketing workflow for new subscribers',
            },
            visibility: {
              type: 'string',
              enum: ['public', 'private'],
              description: 'Visibility setting for the workflow',
              example: 'public',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              description: 'Status of the workflow',
              example: 'published',
            },
          },
        },
        UpdateWorkflowStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              description: 'New status for the workflow',
              example: 'published',
            },
          },
        },
        UpdateWorkflowVisibilityRequest: {
          type: 'object',
          required: ['visibility'],
          properties: {
            visibility: {
              type: 'string',
              enum: ['public', 'private'],
              description: 'New visibility setting for the workflow',
              example: 'public',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Something went wrong!',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully',
            },
          },
        },
        Node: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the node',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Name of the node',
              example: 'Send Email',
            },
            description: {
              type: 'string',
              description: 'Description of the node',
              example: 'Sends an email notification to the user',
            },
            type: {
              type: 'string',
              enum: ['action', 'condition', 'delay'],
              description: 'Type of the node',
              example: 'action',
            },
            retryConfig: {
              type: 'object',
              description: 'Retry configuration for the node',
              properties: {
                max_attempts: { type: 'integer', example: 3 },
                backoff_strategy: { type: 'string', example: 'exponential' },
                base_delay_ms: { type: 'integer', example: 2000 },
                max_delay_ms: { type: 'integer', example: 30000 },
                jitter: { type: 'boolean', example: true },
              },
            },
          },
        },
        WorkflowNode: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the workflow node',
              example: 1,
            },
            workflowId: {
              type: 'integer',
              description: 'ID of the workflow',
              example: 1,
            },
            nodeId: {
              type: 'integer',
              description: 'ID of the node',
              example: 1,
            },
            overrideConfig: {
              type: 'object',
              description: 'Override configuration for the node in this workflow',
            },
            node: {
              $ref: '#/components/schemas/Node',
            },
          },
        },
        Endpoint: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the endpoint',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Name of the endpoint',
              example: 'SendGrid Email API',
            },
            description: {
              type: 'string',
              description: 'Description of the endpoint',
              example: 'SendGrid API for sending emails',
            },
            url: {
              type: 'string',
              description: 'URL of the endpoint',
              example: 'https://api.sendgrid.com/v3/mail/send',
            },
            method: {
              type: 'string',
              enum: ['get', 'post', 'put', 'delete'],
              description: 'HTTP method for the endpoint',
              example: 'post',
            },
            headers: {
              type: 'object',
              description: 'Default headers for the endpoint',
            },
            body: {
              type: 'object',
              description: 'Default body for the endpoint',
            },
            isGlobal: {
              type: 'boolean',
              description: 'Whether the endpoint is global',
              example: false,
            },
            provider: {
              type: 'string',
              description: 'Provider of the endpoint',
              example: 'SendGrid',
            },
          },
        },
        UserEndpoint: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the user endpoint',
              example: 1,
            },
            userId: {
              type: 'integer',
              description: 'ID of the user',
              example: 1,
            },
            endpointId: {
              type: 'integer',
              description: 'ID of the endpoint',
              example: 1,
            },
            headers: {
              type: 'object',
              description: 'User-specific headers for the endpoint',
            },
            body: {
              type: 'object',
              description: 'User-specific body for the endpoint',
            },
            authConfig: {
              type: 'object',
              description: 'Authentication configuration for the endpoint',
            },
            endpoint: {
              $ref: '#/components/schemas/Endpoint',
            },
          },
        },
        ActionNodeConfig: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the action node config',
              example: 1,
            },
            workflowNodeId: {
              type: 'integer',
              description: 'ID of the workflow node',
              example: 1,
            },
            userEndpointId: {
              type: 'integer',
              description: 'ID of the user endpoint',
              example: 1,
            },
            overrides: {
              type: 'object',
              description: 'Override configuration for the action node',
            },
            userEndpoint: {
              $ref: '#/components/schemas/UserEndpoint',
            },
          },
        },
        ConditionNodeConfig: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the condition node config',
              example: 1,
            },
            workflowNodeId: {
              type: 'integer',
              description: 'ID of the workflow node',
              example: 1,
            },
            expression: {
              type: 'object',
              description: 'Condition expression for the node',
            },
            label: {
              type: 'string',
              description: 'Label for the condition',
              example: 'User is premium',
            },
          },
        },
        DelayNodeConfig: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the delay node config',
              example: 1,
            },
            workflowNodeId: {
              type: 'integer',
              description: 'ID of the workflow node',
              example: 1,
            },
            duration: {
              type: 'integer',
              description: 'Delay duration in milliseconds',
              example: 5000,
            },
          },
        },
        CreateWorkflowNodeRequest: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the node',
              example: 'Send Email',
            },
            description: {
              type: 'string',
              description: 'Description of the node',
              example: 'Sends an email notification to the user',
            },
            type: {
              type: 'string',
              enum: ['action', 'condition', 'delay'],
              description: 'Type of the node',
              example: 'action',
            },
            overrideConfig: {
              type: 'object',
              description: 'Override configuration for the node in this workflow',
            },
            data: {
              type: 'object',
              description: 'Type-specific configuration data',
              properties: {
                endpointId: {
                  type: 'integer',
                  description: 'ID of existing endpoint (for action nodes)',
                  example: 1,
                },
                endpoint: {
                  type: 'object',
                  description: 'New endpoint data (for action nodes)',
                  properties: {
                    name: { type: 'string', example: 'SendGrid Email API' },
                    description: { type: 'string', example: 'SendGrid API for sending emails' },
                    url: { type: 'string', example: 'https://api.sendgrid.com/v3/mail/send' },
                    method: { type: 'string', enum: ['get', 'post', 'put', 'delete'], example: 'post' },
                    headers: { type: 'object' },
                    body: { type: 'object' },
                    authConfig: { type: 'object' },
                  },
                },
                expression: {
                  type: 'object',
                  description: 'Condition expression (for condition nodes)',
                },
                label: {
                  type: 'string',
                  description: 'Condition label (for condition nodes)',
                  example: 'User is premium',
                },
                duration: {
                  type: 'integer',
                  description: 'Delay duration in milliseconds (for delay nodes)',
                  example: 5000,
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
  apis: ['./controllers/*.js', './routes/*.js'],
};

const specs = swaggerJSDoc(options);

module.exports = specs;

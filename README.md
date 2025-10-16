# flow-wb
Flow: Workflow Builder

## API Documentation

This project includes comprehensive Swagger/OpenAPI documentation for all endpoints.

### Accessing the Documentation

Once the server is running, you can access the interactive API documentation at:

**http://localhost:3000/api-docs**

### Available Endpoints

The API documentation includes the following endpoints:

#### Workflow Endpoints
- `GET /v1/workflows` - Get all workflows for the authenticated user
- `GET /v1/workflows/{workflowId}` - Get a specific workflow by ID
- `POST /v1/workflows` - Create a new workflow
- `PUT /v1/workflows/{workflowId}` - Update a workflow
- `PATCH /v1/workflows/{workflowId}/status` - Update workflow status
- `PATCH /v1/workflows/{workflowId}/visibility` - Update workflow visibility
- `DELETE /v1/workflows/{workflowId}` - Delete a workflow

#### Workflow Node Endpoints
- `GET /v1/workflows/{workflowId}/nodes` - Get all nodes in a workflow
- `POST /v1/workflows/{workflowId}/nodes` - Create a new node in a workflow

#### Individual Node Endpoints
- `GET /v1/nodes/{workflowNodeId}` - Get a specific workflow node
- `PUT /v1/nodes/{workflowNodeId}` - Update a workflow node configuration
- `DELETE /v1/nodes/{workflowNodeId}` - Delete a workflow node

#### Node Connection Endpoints
- `POST /v1/connections` - Create a connection between workflow nodes
- `PUT /v1/connections/{connectionId}` - Update a workflow node connection
- `PATCH /v1/connections/{connectionId}/status` - Activate/deactivate a connection
- `DELETE /v1/connections/{connectionId}` - Delete a workflow node connection

Node connections define the flow between nodes in a workflow:
- Connect nodes to create execution paths
- Support conditional branching with rule IDs
- Enable/disable connections to control workflow execution

#### Node Types Supported
- **Action Nodes**: Execute HTTP requests to external APIs
- **Condition Nodes**: Add conditional logic to workflows
- **Delay Nodes**: Add time delays between workflow steps

### Authentication

All workflow endpoints require Bearer token authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Running the Server

```bash
# Development mode
npm run local

# Production mode
npm start
```

The server will start on port 3000 by default.

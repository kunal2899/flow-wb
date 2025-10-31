# Flow: Workflow Builder 🧩

**Build, automate, and orchestrate workflows effortlessly**

## Project Overview

Flow is a powerful, modular workflow automation platform designed to transform how you connect and automate tasks across different services and APIs. Inspired by tools like n8n and Zapier, Flow empowers developers and teams to create complex, intelligent workflows with ease.

### Core Purpose

In today's interconnected digital landscape, businesses and developers need flexible tools to automate repetitive tasks, integrate services, and create intelligent workflow pipelines. Flow solves this by providing a robust, extensible platform for building custom workflow automations.

## Key Features

### MVP Capabilities
- **Flexible Workflow Creation**
  - Supports multiple node types: Action, Condition, Delay
  - Supports mutiple trigger types: CRON, Schedule, Manual
  - Workflow design through APIs
  - Per-node configuration and overrides

- **Robust Authentication**
  - JWT-based secure user management
  - Role-based access control

- **Logging**
  - Workflow level execution logs
  - Node level execution logs

- **Advanced Workflow Mechanics**
  - Rule-based conditional branching
  - Delay scheduling
  - Real-time workflow updates (via polling)
  - Fault-tolerant runtime state recovery

- **Infrastructure**
  - Dockerized deployment
  - Scalable architecture
  - Worker and API service separation

### Future Roadmap
- Support different types of node and triggers
- Visual BPMN-based workflow builder
- Enhanced third-party integrations (Slack, Gmail, Notion)
- Custom node development SDK
- Comprehensive audit logging
- Advanced analytics dashboard
- OAuth2 credential management

## Architecture Overview

### System Design
```mermaid
  A - [User Interface]
  B - [API Service]
  C - [Redis, Queue]
  D - [Worker Service]
  E - [PostgreSQL Database]

  A --> B
    B --> E
    B --> C
      C --> D
    D --> E  
```

### Key Components
- **API Service**: RESTful endpoint management
- **Worker Service**: Background job processing
- **Redis, Queue**: Distributed queue and state management
- **PostgreSQL**: Persistent data storage
- **BullMQ**: Job queue and scheduling

### Workflow Execution Flow
1. Workflow is triggered
2. Jobs are queued in Redis
3. Worker processes nodes sequentially
4. Runtime state is continuously managed
5. Fault recovery mechanisms ensure reliability

## Tech Stack

- **Backend**: Node.js, Express
- **ORM**: Sequelize
- **Databases**: PostgreSQL, Redis
- **Queue Management**: BullMQ
- **Containerization**: Docker
- **Authentication**: JSON Web Tokens

## Project Structure

```plaintext
flow-wb/
├── app.js
├── configs/
├── constants/
├── controllers/
├── docker-compose.yml
├── Dockerfile
├── entities/
├── helpers/
├── middlewares/
│   └── validators/
├── migrations/
├── models/
├── routes/
├── schemas/
├── services/
│   └── coreServices/
│   └── queueServices/
├── utils/
└── workers/
    └── mainWorker/
        ├── helpers/
        ├── processors/
        │   ├── main/
        │   │   ├── coreProcessors/
        │   │   └── nodeProcessors/
        │   └── scheduled/
        ├── states/
        └── validators/
```

## API Endpoints

Comprehensive Swagger documentation available at `/api-docs`

### Key Endpoint Groups
- **User Management**: `/v1/users`
- **Workflow Management**: `/v1/workflows`
- **Node Configuration**: `/v1/nodes`
- **User Workflow Actions**: `/v1/user-workflows`
- **Workflow Triggers Configuration**: `/v1/user-workflow-triggers`

**Authentication**: Bearer Token (JWT)

## Database Schema

### Primary Tables
- `workflows`: Workflow definitions
- `workflow_nodes`: Individual node configurations
- `user_workflows`: User-workflow relationships
- `workflow_executions`: Execution tracking
- `nodes`: Reusable node templates
- `connections`: Node interconnections
- `rules`: Conditional logic definitions

## Getting Started

### Prerequisites
- Docker [v27.3.1]
- Node.js [v22]
- npm [v10.8.2]
- PostgreSQL [v17.4]
- Redis [v7.2.6]

### Environment Configuration
```env
PORT=3000
NODE_ENV=local
JWT_SECRET=your_secret

DB_HOST=postgres
DB_PORT=5432
DB_USER=flow_user
DB_PASSWORD=password
DB_NAME=flow_db

REDIS_HOST=redis
REDIS_PORT=6379
```

### Installation

#### Docker Deployment
```bash
docker-compose up --build
```

#### Local Development
```bash
npm install
npm run sync
npm run local:all
```
#### If everything goes right then server will be up at port mentioned in env (default 3000)
After that you can access API routes at `localhost:3000`
and API documentation at `localhost:3000/api-docs`


## Credits

Created by Kunal J. 

**Technologies**: Node.js, Sequelize, PostgreSQL, Redis, Docker, BullMQ

# Lamatic CLI

The official CLI for managing Lamatic AI projects, flows, deployments, contexts, models, and integrations.

## Installation

```bash
npm install -g @lamatic/cli
```

Or run directly without installing:

```bash
npx @lamatic/cli <command>
```

## Setup

```bash
lamatic auth login --api-key <YOUR_API_KEY> --org-id <YOUR_ORG_ID> --user-id <YOUR_USER_ID>
```

## Help

```bash
lamatic --help
lamatic <command> --help
```

## Commands

### Authentication

| Command | Description |
|---|---|
| `lamatic auth login` | Authenticate with your API key |
| `lamatic auth status` | Check current auth status |
| `lamatic auth logout` | Logout and clear credentials |

```bash
lamatic auth login --api-key <key> --org-id <org_id> --user-id <user_id>
lamatic auth status
lamatic auth logout
```

### Projects

| Command | Description |
|---|---|
| `lamatic init <name>` | Create a new Lamatic project |
| `lamatic project list` | List all projects in your org |
| `lamatic project get` | Fetch and download a project locally |
| `lamatic project delete` | Delete a project |

```bash
# Create a new project
lamatic init my-project --scratch

# List all projects
lamatic project list

# Download an existing project locally
lamatic project get --project-id <PROJECT_ID>

# Delete a project
lamatic project delete --project-id <PROJECT_ID>
```

### Flows

| Command | Description |
|---|---|
| `lamatic flows create` | Create a new flow in a project |
| `lamatic flows list` | List all flows in a project |
| `lamatic flows rename` | Rename a flow |
| `lamatic flows delete` | Delete a flow |
| `lamatic flows status` | Update flow status (active/inactive) |

```bash
# Create a flow
lamatic flows create --project-id <PROJECT_ID> --name "My Flow"

# List all flows
lamatic flows list --project-id <PROJECT_ID>

# Rename a flow
lamatic flows rename --project-id <PROJECT_ID> --flow-id <FLOW_ID> --name "New Name"

# Delete a flow
lamatic flows delete --project-id <PROJECT_ID> --flow-id <FLOW_ID>

# Update flow status
lamatic flows status --project-id <PROJECT_ID> --flow-id <FLOW_ID> --status active
```

### Deployments

| Command | Description |
|---|---|
| `lamatic deploy` | Trigger a deployment for a project |
| `lamatic deployments list` | List all deployments |
| `lamatic deployments get` | Get details of a specific deployment |

```bash
# Trigger a deployment
lamatic deploy --project-id <PROJECT_ID>

# List all deployments
lamatic deployments list --project-id <PROJECT_ID>

# Get deployment details
lamatic deployments get --project-id <PROJECT_ID> --deployment-id <DEPLOYMENT_ID>
```

### Contexts

| Command | Description |
|---|---|
| `lamatic contexts list` | List all contexts in a project |
| `lamatic contexts create` | Create a new context (vector or memory) |
| `lamatic contexts delete` | Delete a context |

```bash
# List contexts
lamatic contexts list --project-id <PROJECT_ID>

# Create a context
lamatic contexts create --project-id <PROJECT_ID> --name "my-context" --type vector

# Delete a context
lamatic contexts delete --project-id <PROJECT_ID> --context-id <CONTEXT_ID>
```

### Models

| Command | Description |
|---|---|
| `lamatic models list` | List all model credentials |
| `lamatic models add` | Add a new model credential |

```bash
# List model credentials
lamatic models list --project-id <PROJECT_ID>

# Add a model credential
lamatic models add --project-id <PROJECT_ID>
```

### Integrations

| Command | Description |
|---|---|
| `lamatic integrations list` | List all integration credentials |
| `lamatic integrations add` | Add a new integration |

```bash
# List integrations
lamatic integrations list --project-id <PROJECT_ID>

# Add an integration
lamatic integrations add --project-id <PROJECT_ID>
```

## Full Workflow Example

```bash
# Step 1 — Login
lamatic auth login --api-key <key> --org-id <org_id> --user-id <user_id>

# Step 2 — Create a new project
lamatic init my-project --scratch

# Step 3 — List your projects to get the project ID
lamatic project list

# Step 4 — Create a flow inside the project
lamatic flows create --project-id <PROJECT_ID> --name "My Flow"

# Step 5 — Deploy the project
lamatic deploy --project-id <PROJECT_ID>

# Step 6 — Check deployment status
lamatic deployments list --project-id <PROJECT_ID>

# Step 7 — Download an existing project locally
lamatic project get --project-id <PROJECT_ID>
```

## Links
- [Lamatic](https://lamatic.ai)
- [DevMCP](https://github.com/Lamatic/Dev-MCP-Lamatic) — Manage Lamatic via AI
- [GraphMCP](https://github.com/Lamatic/GraphMCP-Lamatic) — Execute Lamatic flows via AI
# Installation

```
git clone <your-repo-url>
cd lamatic-cli
npm install
npm link
```

## Setup

```
lamatic auth login --api-key <YOUR_API_KEY> --org-id <YOUR_ORG_ID> --user-id <YOUR_USER_ID>
```

## Commands

### Authentication

| Command | Description |
|---|---|
| `lamatic auth login` | Authenticate with your API key |
| `lamatic auth status` | Check current auth status |
| `lamatic auth logout` | Logout |

```
lamatic auth login --api-key <key> --org-id <org_id> --user-id <user_id>
lamatic auth status
lamatic auth logout
```

---

### Projects

| Command | Description |
|---|---|
| `lamatic init <name> --scratch` | Create a new project from scratch |
| `lamatic project get --project-id <id>` | Fetch and download an existing project |

```
# Create a new project
lamatic init my--project --scratch

# Fetch an existing project
lamatic project get --project-id <PROJECT_ID>
```

---

### Flows

| Command | Description |
|---|---|
| `lamatic flow create --project-id <id>` | Create a new flow in a project |

```
# Create a flow
lamatic flow create --project-id <PROJECT_ID>
```

---

### Deployments

| Command | Description |
|---|---|
| `lamatic deploy --project-id <id>` | Trigger a deployment for a project |

```
lamatic deploy --project-id <PROJECT_ID>
```

## Full Workflow Example

```
# Step 1 - Login
lamatic auth login --api-key <key> --org-id <org_id> --user-id <user_id>

# Step 2 - Create a new project
lamatic init my-project --scratch

# Step 3 - Create a flow inside the project
lamatic flow create --project-id <PROJECT_ID>

# Step 4 - Deploy the project
lamatic deploy --project-id <PROJECT_ID>

# Step 5 - Fetch an existing project
lamatic project get --project-id <PROJECT_ID>
```

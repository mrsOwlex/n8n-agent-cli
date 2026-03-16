# n8n-agent-cli

A CLI tool for coding agents and developers to manage [n8n](https://n8n.io) workflows via the Public API.

Pull, push, run, validate, diff, and convert workflows between JSON and TypeScript — all from the command line.

## Install

```bash
npm install -g n8n-agent-cli
```

Or run directly with npx:

```bash
npx n8n-agent-cli ping
```

## Setup

Set your n8n connection details as environment variables or in a `.env` file:

```bash
export N8N_BASE_URL=http://localhost:5678
export N8N_API_KEY=your-api-key
```

You can generate an API key in your n8n instance under **Settings > API**.

## Commands

### Connection

```bash
n8n-agent ping              # Test connection to n8n
n8n-agent list              # List all workflows
```

### Pull / Push

```bash
n8n-agent pull <id>                    # Download workflow as JSON
n8n-agent pull <id> --strip            # Strip volatile fields (id, timestamps)
n8n-agent pull <id> -o workflow.json   # Write to file
n8n-agent pull-all --dir ./workflows   # Download all workflows

n8n-agent push workflow.json --id <id>       # Update existing workflow
n8n-agent push workflow.json --create        # Create new workflow
n8n-agent push workflow.json --id <id> --activate
n8n-agent push workflow.json --dry-run       # Preview without changes
```

### Run / Wait / Check

```bash
n8n-agent run <workflowId>                     # Execute and wait for result
n8n-agent run <workflowId> --async             # Start and return immediately
n8n-agent run <workflowId> --payload '{"key":"value"}'
n8n-agent run <workflowId> --timeout 120000

n8n-agent wait <executionId>                   # Poll until complete
n8n-agent wait <executionId> --timeout 120000 --interval 5000

n8n-agent check <executionId>                  # Check status
# Exit codes: 0 = success, 1 = pending/validation, 2 = runtime error
```

### Compile / Decompile

Convert workflows between JSON and TypeScript:

```bash
n8n-agent decompile workflow.json              # JSON -> TypeScript
n8n-agent decompile workflow.json -o wf.ts

n8n-agent compile wf.ts                        # TypeScript -> JSON
n8n-agent compile wf.ts -o workflow.json
```

### Validate / Diff

```bash
n8n-agent validate workflow.json               # Run all validation rules
n8n-agent validate workflow.json --rules required-fields,no-broken-connections

n8n-agent diff local.json remote:<id>          # Compare local file vs remote
n8n-agent diff remote:<id1> remote:<id2>       # Compare two remote workflows
n8n-agent diff a.json b.json                   # Compare two local files
```

#### Validation rules

| Rule | Description |
|------|-------------|
| `required-fields` | Checks that `nodes` and `connections` exist |
| `no-unknown-nodes` | Warns about unrecognized node types |
| `no-broken-connections` | Ensures all connection targets exist as nodes |
| `no-hardcoded-secrets` | Scans parameters for potential secrets |

## Global flags

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON (for scripting / piping) |
| `--verbose` | Show HTTP request details |
| `--dry-run` | Preview mutations without executing |

## Use with AI coding agents

This CLI is designed to be used by AI coding agents (Claude, Cursor, etc.) as a tool for managing n8n workflows programmatically. The `--json` flag ensures machine-readable output, and all commands are non-interactive by default.

Example agent workflow:

```bash
# Pull current state
n8n-agent pull <id> --strip -o workflow.json

# Make changes to workflow.json...

# Validate before pushing
n8n-agent validate workflow.json

# Push and activate
n8n-agent push workflow.json --id <id> --activate

# Run and verify
n8n-agent run <id> --json
```

## Requirements

- Node.js >= 20
- n8n instance with API access enabled

## License

MIT

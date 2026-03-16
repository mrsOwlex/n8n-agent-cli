# n8n-agent-cli

CLI tool for coding agents to manage n8n workflows via the Public API.

## Stack

- TypeScript, ESM (`"type": "module"`)
- `commander` for CLI routing
- Native `fetch` (Node 20+)
- `vitest` for testing

## Conventions

- All source in `src/`, compiled to `dist/`
- Commands in `src/commands/`, one file per command
- Workflow logic in `src/workflow/` (normalize, validate, diff, compile, decompile)
- No `dotenv` dependency — custom `.env` parser in `src/config.ts`
- HTTP client in `src/client.ts` uses `X-N8N-API-KEY` header
- Errors in `src/errors.ts` with specific classes per HTTP status (401/403/404/5xx)
- Output formatting in `src/output.ts` (human-readable table vs `--json`)
- Global flags: `--json`, `--verbose`, `--dry-run`

## Commands

```
n8n-agent ping                          # Test connection
n8n-agent list                          # List workflows as table
n8n-agent pull <id> [--strip] [-o file] # Download workflow JSON
n8n-agent pull-all [--dir d] [--strip]  # Download all workflows
n8n-agent push <file> [--id] [--create] # Upload/update workflow
n8n-agent run <id> [--async] [--payload]# Execute workflow
n8n-agent wait <execId> [--timeout]     # Poll until execution completes
n8n-agent check <execId>               # Check status (exit codes: 0/1/2)
n8n-agent compile <ts> [-o file]       # TypeScript → JSON
n8n-agent decompile <json> [-o file]   # JSON → TypeScript
n8n-agent validate <file> [--rules]    # Validate workflow JSON
n8n-agent diff <source> <target>       # Compare workflows (file or remote:<id>)
```

## Testing

```bash
npm test               # Unit tests (29 tests, no network)
npm run dev -- ping    # Run via tsx during development
```

## Environment

Copy `.env.example` to `.env` and set your n8n credentials.
For E2E tests, the `.env` from the PoC directory is loaded:
`/Users/owlex/workspace/AIOperatingSystem/poc/AIOS-POC-01-n8n-engine/.env`

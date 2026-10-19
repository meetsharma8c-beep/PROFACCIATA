# Profacciata + Higgsfield for Antigravity

This package contains:
- `mcp_config.json`: connection to the official Higgsfield MCP endpoint.
- `skills/profacciata-higgsfield/SKILL.md`: project-specific visual workflow, brand-safety, and credit safeguards.
- `references/Profacciata-Higgsfield-Prompts.md`: reusable prompt recipes.

Official endpoint: https://mcp.higgsfield.ai/mcp

## Recommended setup: add the official MCP in Antigravity IDE

1. Extract this ZIP.
2. In Antigravity, open the agent side panel's `...` menu and choose **MCP Servers**.
3. Choose **Manage MCP Servers** -> **View raw config**.
4. Merge the entry below into the existing `mcpServers` object. Do not replace or delete other servers.

```json
"higgsfield": {
  "serverUrl": "https://mcp.higgsfield.ai/mcp"
}
```

The full example is in `mcp_config.json`. Save the config. In Settings/Customizations, select Authenticate for Higgsfield if prompted; complete the browser OAuth sign-in using your Higgsfield account and approve access. Refresh/restart Antigravity if the server does not appear immediately.

## Add the workspace skill

Copy `skills/profacciata-higgsfield/` into the Profacciata project's `.agents/skills/profacciata-higgsfield/` folder. Antigravity discovers project skills from `.agents/skills/`. Then reload skills/restart the agent if necessary.

## Optional: install as an Antigravity CLI plugin

If you have Antigravity CLI and its `agy` command available, try installing this extracted local package:

```bash
agy plugin install /absolute/path/to/Profacciata-Higgsfield-Antigravity-Plugin
agy plugin list
```

If local plugin installation isn't supported by your installed version, use the recommended manual MCP + skill setup above.

## Billing / credits warning

Higgsfield says MCP generations consume regular Higgsfield credits at standard rates; web-only unlimited access and free generations do not apply through MCP. An active subscription is required. Check balance before generations and approve costly video/high-resolution/batch requests deliberately. See https://higgsfield.ai/creator-hub/help-center/integrations/what-is-higgsfield-mcp

## Security

This integration uses Higgsfield's official MCP endpoint and its sign-in flow; no API key should be pasted into this package. Do not commit credentials or OAuth data to Git.

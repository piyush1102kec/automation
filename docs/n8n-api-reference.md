# n8n API & Workflow Technical Reference

## 1. Workflow CRUD API Endpoints

The n8n Public API (v1) provides the following endpoints for workflow management. All requests require an `X-N8N-API-KEY` header.

| Method | Path | Description | Request Body | Response Shape (Partial) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/workflows` | List all workflows | Query params: `limit`, `cursor` | `{ "data": [Workflow], "nextCursor": string }` |
| **POST** | `/workflows` | Create a workflow | `{ name, nodes, connections, settings, active }` | `{ Workflow }` |
| **GET** | `/workflows/{id}`| Get a workflow | N/A | `{ Workflow }` |
| **PATCH** | `/workflows/{id}`| Update a workflow | `{ name, nodes, connections, settings, active }` | `{ Workflow }` |
| **DELETE**| `/workflows/{id}`| Delete a workflow | N/A | `{ success: true }` |

## 2. Complete Workflow JSON Schema

A workflow is defined as a JSON object with the following structure:

### Root Object
- `id`: (String, Optional) Internal n8n ID.
- `name`: (String) Name of the workflow.
- `active`: (Boolean) Whether the workflow is currently enabled.
- `nodes`: (Array) List of node objects.
- `connections`: (Object) Map of connections between nodes.
- `settings`: (Object) Workflow-level settings (e.g., `saveExecutionProgress`, `errorWorkflow`).
- `staticData`: (Object, Optional) Data that persists between executions.
- `meta`: (Object) Versioning info.

### Node Object
- `id`: (String) Unique UUID for the node.
- `name`: (String) Unique name (must be unique within the workflow).
- `type`: (String) The internal node type string (e.g., `n8n-nodes-base.webhook`).
- `typeVersion`: (Number) The version of the node being used.
- `position`: ([Number, Number]) X and Y coordinates on the canvas.
- `parameters`: (Object) Key-value pairs of node configuration.
- `credentials`: (Object, Optional) Reference to saved credentials.

### Connections Object
Connections are structured by **source node name**, then **output type** (usually `main`), then **output port index**, and finally the **target node**.
```json
"connections": {
  "SourceNodeName": {
    "main": [
      [
        {
          "node": "TargetNodeName",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}
```

## 3. Node Type String Format
Standard nodes use the prefix `n8n-nodes-base.` followed by the lower-camelCase name of the node.
- `n8n-nodes-base.webhook`
- `n8n-nodes-base.httpRequest`
- `n8n-nodes-base.set`
- `n8n-nodes-base.googleSheets`

## 4. Credential References
Credentials are referenced inside a node's `credentials` object using the **credential type name** as the key.
```json
"credentials": {
  "googleSheetsOAuth2Api": {
    "id": "1",
    "name": "Personal Google Account"
  }
}
```

## 5. 3-Node Workflow Example (Trigger → Set → HTTP Request)
```json
{
  "name": "PoC Workflow",
  "nodes": [
    {
      "parameters": {
        "path": "webhook-poc",
        "options": {}
      },
      "id": "d0e1f2a3-b4c5-d6e7-f8g9-h0i1j2k3l4m5",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [400, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            { "name": "transformed_data", "value": "={{ $json.body.data.toUpperCase() }}" }
          ]
        }
      },
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "name": "Transform Data",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [600, 300]
    },
    {
      "parameters": {
        "url": "https://api.example.com/post",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "result", "value": "={{ $json.transformed_data }}" }
          ]
        }
      },
      "id": "z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4",
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [800, 300]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{ "node": "Transform Data", "type": "main", "index": 0 }]]
    },
    "Transform Data": {
      "main": [[{ "node": "HTTP Request", "type": "main", "index": 0 }]]
    }
  },
  "active": false,
  "settings": {},
  "meta": { "templateId": "poc" }
}
```

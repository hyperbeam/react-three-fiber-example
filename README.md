# react-three-fiber-example

Hyperbeam virtual computers in React Three Fiber!

## Running locally

Clone the repo and run:

```bash
npm install
npm run dev
```

## Using a custom embed URL

1. You'll need to get a Hyperbeam API key. You can get one for free at https://hyperbeam.com
2. Start a virtual computer in Hyperbeam using curl:

```bash
curl -X POST -H 'Authorization: Bearer <your-api-key>' https://engine.hyperbeam.com/v0/vm
```

```json
{
  "session_id": "85a208c0-8fc1-4b27-bcbc-941f6208480b",
  "embed_url": "https://96xljbfypmn3ibra366yqapci.hyperbeam.com/haIIwI_BSye8vJQfYghICw?token=QAWRxLz6exTKbxlFG3MTBxsoPePyDa7_WO3FCxKO73M",
  "admin_token": "OjIulaS-YO4qWHoGap2iK3KqUvAX5qEi9_fDCxESNj0"
}
```

3. Copy the `embed_url` value and paste it into the `embedUrl` variable in `src/App.jsx`

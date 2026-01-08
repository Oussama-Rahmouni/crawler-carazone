## Run Locally
Node.js 18+.
```bash
npm install
npm start
```

## Running with Docker
The Dockerfile uses a root user and Alpine Linux to ensure it runs on any OS (Windows/Mac/Linux) without permission or dependency issues.

1. Build the image

```Bash
docker build -t carzone-bot .
```
2. Run

**Run (PowerShell, Linux, or Mac)**
```bash
docker run --rm -v "$(pwd)/output:/app/output" carzone-bot
```

**Run (Command Prompt / CMD)**
```bash
docker run --rm -v "%cd%/output:/app/output" carzone-bot
```

## approach
**BFS Queue:** Handles discovery of new links without recursion. I used a Set for deduplication so we don't crawl the same car twice.

**Stealth & Resource Blocking:** Uses stealth-plugin to avoid blocks and blocks images/fonts to keep the crawl fast and save bandwidth.

**Healthcheck:** Includes a simple healthcheck.js that triggers if the bot stops writing files for 5 minutes.

**Environment Aware:** It detects if it's in Docker. If not, it opens a visible browser so you can watch it work locally.

## Config
change the limits:

**MAX_PAGES:** default is 200.

**REQUEST_DELAY:** default is 1200ms.
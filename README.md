## Run Locally
Node.js 18+.
```bash
npm install
npm start
```

The Dockerfile uses a root user and Alpine Linux to ensure it runs on any OS (Windows/Mac/Linux) without permission or dependency issues.

## Running with Docker (Default Config, without proxy)

**Run (PowerShell, Linux, or Mac)**
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

## Using Proxy & Custom Config

```bash
docker run --rm \
  -e PROXY_SERVER="http://1.2.3.4:8080" \
  -e MAX_PAGES=200 \
  -v "$(pwd)/output:/app/output" \
  carzone-bot
```

## For proxies requiring authentication:


```bash
docker run --rm \
  -e PROXY_SERVER="proxy_server_url" \
  -e PROXY_USERNAME="your_user" \
  -e PROXY_PASSWORD="your_password" \
  -v "$(pwd)/output:/app/output" \
  carzone-bot
```

## Config

**MAX_PAGES:** default is 200.

**REQUEST_DELAY:** default is 1200ms.

**PROXY_SERVER:**	default null

**OUTPUT_DIR:**	default  /output

## approach
**BFS Queue:** Handles discovery of new links without recursion. I used a Set for deduplication so we don't crawl the same car twice.

**Stealth & Resource Blocking:** Uses stealth-plugin to avoid blocks and blocks images/fonts to keep the crawl fast and save bandwidth.

**Healthcheck:** Includes a simple healthcheck.js that triggers if the bot stops writing files for 5 minutes.

**Environment Aware:** It detects if it's in Docker. If not, it opens a visible browser so you can watch it work locally.


FROM node:18-alpine

# install chromium and deps
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

# env setup
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production \
    OUTPUT_DIR=/app/output

# create a user so we don't run as root
RUN addgroup -S crawler && adduser -S crawler -G crawler
WORKDIR /app

#deps firrst for better caching
COPY package*.json ./

RUN npm install --omit=dev

# copy the rest
COPY . .

RUN mkdir -p /app/output 

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "crawler.js"]
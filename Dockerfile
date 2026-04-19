FROM node:20-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 55154

CMD ["sh", "entrypoint.sh"]
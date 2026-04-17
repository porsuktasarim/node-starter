FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 55154

CMD ["sh", "entrypoint.sh"]
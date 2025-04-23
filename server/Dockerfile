FROM node:14-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Ensure data directory has proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data

EXPOSE 3000

CMD ["node", "server.js"]

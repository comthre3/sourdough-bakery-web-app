FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm install --production
EXPOSE 3000
CMD ["npx", "react-scripts", "start"]

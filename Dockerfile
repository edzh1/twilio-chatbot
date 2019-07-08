FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
RUN npm i -g pm2
COPY . .
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.js"]
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy project
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]


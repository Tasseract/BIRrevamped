FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --production || npm install --production

# Copy source
COPY . .

# Generate Prisma client (optional; migrations will regenerate if needed)
RUN npx prisma generate 2>/dev/null || true

EXPOSE 3000

ENV NODE_ENV=production
CMD [ "node", "server.js" ]

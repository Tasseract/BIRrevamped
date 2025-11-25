FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --production || npm install --production

# Copy source
COPY . .

# Generate Prisma client (requires DATABASE_URL at build if using prisma introspection migrations)
RUN npx prisma generate || true

EXPOSE 3000

ENV NODE_ENV=production
CMD [ "node", "server.js" ]

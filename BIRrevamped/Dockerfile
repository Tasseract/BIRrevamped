FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (skip postinstall script for now)
COPY package*.json ./
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# Copy source and schema BEFORE generating
COPY . .

# Generate Prisma client with a dummy DATABASE_URL (required by Prisma config)
# The real DATABASE_URL will be provided at runtime
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/dummy" npx prisma generate

EXPOSE 3000

ENV NODE_ENV=production
CMD [ "node", "server.js" ]

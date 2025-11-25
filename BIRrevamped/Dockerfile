FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (skip postinstall script for now)
COPY package*.json ./
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# Copy source and schema BEFORE generating
COPY . .

# Now generate Prisma client (schema is present)
RUN npx prisma generate

EXPOSE 3000

ENV NODE_ENV=production
CMD [ "node", "server.js" ]

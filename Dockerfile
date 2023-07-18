# Use the official Node.js 14 image.
# https://hub.docker.com/_/node
FROM node:14

# Create and change to the app directory.
WORKDIR /usr/src/app

ENV RUNNING_IN_DOCKER=true

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Start the app
CMD [ "npm", "start" ]


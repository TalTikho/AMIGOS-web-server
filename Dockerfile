FROM node:16
LABEL authors="Tal Kfir"
LABEL version=0.1

WORKDIR /app

# Copy only package.json and package-lock.json first (to take advantage of layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY ./src ./src
COPY ./config ./config

# Get the env name and set it for npm
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

# Expose the app port (optional, you can add this if your app runs on a specific port)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

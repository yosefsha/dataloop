# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install ts-node globally to ensure it is available
RUN npm install -g ts-node

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the service will run on
EXPOSE 4000

# Command to run the application
CMD ["npm", "start"]
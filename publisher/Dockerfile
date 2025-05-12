FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code
COPY . .

# Expose the API port
EXPOSE 3000

# Start the API using the correct entry point
CMD ["npx", "ts-node", "index.ts"]
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

# Start the API
# CMD ["npx", "ts-node", "publisher-cli.ts"]

# Compile TypeScript to JavaScript
RUN npx tsc

# Run the compiled JavaScript file
ENTRYPOINT ["node", "dist/publisher-cli.js"]
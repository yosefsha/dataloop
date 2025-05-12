FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code, including the shared directory
# COPY ../shared ./shared
COPY . .

# Start the consumer
CMD ["npx", "ts-node", "consumer.ts"]
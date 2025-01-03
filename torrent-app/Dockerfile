# Use a Node.js image for building the React app
FROM node:16 AS build

# Set the working directory
WORKDIR /app

# Copy package files first (leverage Docker cache)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use a lightweight image to serve the app
FROM node:16-slim

# Install the 'serve' package for serving the React app
RUN npm install -g serve

# Copy the build output from the previous stage
COPY --from=build /app/build /app/build

# Set the working directory to the build directory
WORKDIR /app/build

# Serve the React app
CMD ["serve", "-s", ".", "-l", "3000"]

# Expose the port the React app will use
EXPOSE 3000

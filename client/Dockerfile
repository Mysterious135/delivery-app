# Stage 1: Build the React app
# This stage installs all dependencies and builds the production-ready static files.
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the app with a lightweight server
# This stage takes only the built files from Stage 1 and serves them.
# This results in a much smaller and more secure final container.
FROM node:18-alpine

WORKDIR /app
# Copy only the built files from the 'builder' stage
COPY --from=builder /app/build ./build

# Install a simple static server called 'serve'
RUN npm install -g serve

# Make port 3000 available
EXPOSE 3000

# The command to start the server and serve the 'build' folder
CMD [ "serve", "-s", "build" ]


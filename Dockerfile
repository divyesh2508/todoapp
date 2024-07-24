# Base image
FROM node:14

# Install dependencies
RUN apt-get update && \
    apt-get install -y wget

# Install Trivy
RUN wget https://github.com/aquasecurity/trivy/releases/download/v0.41.0/trivy_0.41.0_Linux-64bit.deb && \
    dpkg -i trivy_0.41.0_Linux-64bit.deb && \
    rm trivy_0.41.0_Linux-64bit.deb

# Set Trivy to be accessible from the PATH
ENV PATH="/usr/local/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]

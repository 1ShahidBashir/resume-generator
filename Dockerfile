# Use a lightweight Node image
FROM node:18-slim

# 1. Install LaTeX and essential fonts (this is the magic part)
# We use --no-install-recommends to keep the image size smaller
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    && rm -rf /var/lib/apt/lists/*

# 2. Set up the App
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of your code
COPY . .

# 3. Start the server
EXPOSE 10000
CMD ["node", "server/index.js"]
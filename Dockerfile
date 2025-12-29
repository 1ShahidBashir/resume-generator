# Use a lightweight Node image
FROM node:18-slim

# 1. Install LaTeX and essential fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    && rm -rf /var/lib/apt/lists/*

# 2. Set up the App Directory
WORKDIR /app

# Copy all project files
COPY . .

# --- NEW SECTION: BUILD FRONTEND ---
# Go into the client folder, install deps, and build the React app
WORKDIR /app/client
RUN npm install
RUN npm run build
# -----------------------------------

# 3. Setup Backend
# Go back to the main folder
WORKDIR /app

# Install backend dependencies
RUN npm install

# 4. Start the server
EXPOSE 10000
CMD ["node", "server/index.js"]
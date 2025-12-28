const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
// Ensure you set GEMINI_API_KEY in your .env file or Render Dashboard
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate', async (req, res) => {
    try {
        const { userData } = req.body;

        if (!userData) {
            return res.status(400).json({ error: "User data is required" });
        }

        // Strict System Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `
        You are a LaTeX expert. Convert the following text into a professional one-page resume.
        
        USER DATA:
        "${userData}"

        REQUIREMENTS:
        1. Use the \\documentclass{article} class.
        2. Use \\usepackage{geometry} to set margins to 0.5in.
        3. Do NOT use markdown backticks (like \`\`\`latex).
        4. Output ONLY the raw LaTeX code.
        5. Keep it concise to fit within URL limits (under 3000 chars of code).
        6. Use \\section*{} for headings to save space.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // Cleanup response (Remove markdown if Gemini adds it)
        let latexCode = response.text()
            .replace(/```latex/g, "")
            .replace(/```/g, "")
            .trim();

        console.log("Generated LaTeX length:", latexCode.length);

        // Encode for Latex-Online (Text compilation)
        const encodedLatex = encodeURIComponent(latexCode);
        const pdfUrl = `https://latexonline.cc/compile?text=${encodedLatex}`;

        res.json({ success: true, pdfUrl });

    } catch (error) {
        console.error("Error generating resume:", error);
        res.status(500).json({ error: "Failed to generate resume." });
    }
});

// --- DEPLOYMENT: SERVE STATIC FILES ---
// Point to the client's 'dist' folder (created after build)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all handler for React Routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
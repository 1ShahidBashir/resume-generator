const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate', async (req, res) => {
    try {
        const { userData } = req.body;
        console.log("1. Received request...");

        // --- PHASE 1: GENERATE LATEX WITH GEMINI ---
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `
        You are a professional Resume Writer. Convert this user data into a high-quality LaTeX resume.
        USER DATA: "${userData}"
        
        RULES:
        1. Use \\documentclass[11pt]{article}
        2. Use \\usepackage{geometry} [margin=0.75in]
        3. Make it FILL the page (use \\vspace, \\section, and detailed bullet points).
        4. Output ONLY valid LaTeX code. NO markdown backticks.
        `;

        const result = await model.generateContent(prompt);
        let latexCode = result.response.text()
            .replace(/```latex/g, "")
            .replace(/```/g, "")
            .trim();

        console.log("2. LaTeX Generated. Length:", latexCode.length);

        // --- PHASE 2: COMPILE PDF (THE PRO WAY) ---
        // We create a "virtual file" and POST it to Latex-Online
        const formData = new FormData();
        // The API expects a file upload with key 'file' or just the file stream
        formData.append('file', latexCode, 'resume.tex');

        console.log("3. Sending to Compiler...");

        const compilerResponse = await axios.post('https://latexonline.cc/compile', formData, {
            headers: {
                ...formData.getHeaders(), // Important: Sets multipart/form-data boundaries
            },
            responseType: 'arraybuffer' // Important: We expect a PDF file (binary), not text
        });

        console.log("4. Compilation Success!");

        // --- PHASE 3: STREAM BACK TO CLIENT ---
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
        res.send(compilerResponse.data);

    } catch (error) {
        console.error("Error details:", error.response?.data?.toString() || error.message);
        res.status(500).json({ error: "Generation failed. Ensure text is valid." });
    }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
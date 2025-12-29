const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const latex = require('node-latex'); // <--- NEW IMPORT
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Use 1.5-flash for stability
        
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

        // --- PHASE 2: COMPILE LOCALLY (THE PRO WAY) ---
        console.log("3. Starting Local Compilation...");

        const options = {
            inputs: '.', // Allow includes if needed
            cmd: 'pdflatex',
            passes: 2, // Run twice to fix reference/page numbers if needed
            errorLogs: 'errors.log' // Useful for debugging
        };

        // node-latex uses Streams. We pipe the LaTeX string IN, and pipe the PDF OUT.
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');

        const pdfStream = latex(latexCode, options);

        pdfStream.pipe(res);

        pdfStream.on('error', (err) => {
            console.error("LaTeX Compilation Error:", err);
            // If headers haven't been sent, send 500. Otherwise, the stream just breaks.
            if (!res.headersSent) {
                res.status(500).json({ error: "Compilation failed on server." });
            }
        });

        pdfStream.on('finish', () => {
            console.log("4. PDF Sent to Client!");
        });

    } catch (error) {
        console.error("Server Error:", error);
        if (!res.headersSent) res.status(500).json({ error: "Internal Server Error" });
    }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
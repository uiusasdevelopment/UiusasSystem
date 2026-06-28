const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // For saving config_data.js

// Serve static files from the project root
app.use(express.static(__dirname));

// Ensure media directory exists
const mediaDir = path.join(__dirname, 'media');
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir);
}

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, mediaDir);
    },
    filename: (req, file, cb) => {
        // Keep original name but add timestamp to avoid collisions if they upload the same file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({ storage: storage });

// Endpoint to upload a file (PDF, PPTX)
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    // Return relative path to be saved in config_data.js
    res.json({ filepath: `media/${req.file.filename}` });
});

// Endpoint to upload a base64 thumbnail (from pdf.js extraction)
app.post('/api/upload-base64', (req, res) => {
    const { imageBase64, filename } = req.body;
    if (!imageBase64 || !filename) {
        return res.status(400).json({ error: 'Dados inválidos.' });
    }
    
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const savedName = `thumb-${uniqueSuffix}-${filename}`;
    const filePath = path.join(mediaDir, savedName);
    
    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao salvar miniatura.' });
        }
        res.json({ filepath: `media/${savedName}` });
    });
});

// Endpoint to save config_data.js
app.post('/api/save-config', (req, res) => {
    const { profiles, presentations } = req.body;
    
    if (!profiles || !presentations) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }
    
    const configPath = path.join(__dirname, 'config_data.js');
    
    const configContent = `window.INITIAL_CONFIG = {
    profiles: ${JSON.stringify(profiles, null, 4)},
    presentations: ${JSON.stringify(presentations, null, 4)}
};`;

    fs.writeFile(configPath, configContent, 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao salvar config_data.js' });
        }
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`\n==============================================`);
    console.log(`🚀 Servidor Uiusas System rodando com sucesso!`);
    console.log(`👉 Abra no navegador: http://localhost:${PORT}`);
    console.log(`==============================================\n`);
});

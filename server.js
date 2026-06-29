const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({ storage: storage });

// API endpoints
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    res.json({ filepath: `media/${req.file.filename}` });
});

app.post('/api/upload-base64', (req, res) => {
    const { imageBase64, filename } = req.body;
    if (!imageBase64 || !filename) return res.status(400).json({ error: 'Dados inválidos.' });
    
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const savedName = `thumb-${uniqueSuffix}-${filename}`;
    const filePath = path.join(mediaDir, savedName);
    
    fs.writeFile(filePath, buffer, (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao salvar miniatura.' });
        res.json({ filepath: `media/${savedName}` });
    });
});

app.post('/api/save-config', (req, res) => {
    const { profiles, presentations } = req.body;
    if (!profiles || !presentations) return res.status(400).json({ error: 'Dados incompletos.' });
    
    const configPath = path.join(__dirname, 'config_data.js');
    const configContent = `window.INITIAL_CONFIG = {\n    profiles: ${JSON.stringify(profiles, null, 4)},\n    presentations: ${JSON.stringify(presentations, null, 4)}\n};`;
    
    fs.writeFile(configPath, configContent, 'utf8', (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao salvar config_data.js' });
        res.json({ success: true });
    });
});

// Endpoint para retornar o IP local da máquina
app.get('/api/local-ip', (req, res) => {
    const interfaces = os.networkInterfaces();
    let localIp = 'localhost';
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // Ignore virtual adapters if possible, but taking the first valid one is usually fine
                if (!name.toLowerCase().includes('vmware') && !name.toLowerCase().includes('virtual')) {
                    localIp = iface.address;
                }
            }
        }
    }
    res.json({ ip: localIp });
});

// WebSockets (Socket.IO)
io.on('connection', (socket) => {
    console.log('🔗 Novo dispositivo conectado:', socket.id);

    socket.on('laser_move', (data) => {
        socket.broadcast.emit('laser_move', data);
    });

    socket.on('slide_control', (data) => {
        socket.broadcast.emit('slide_control', data);
    });

    socket.on('disconnect', () => {
        console.log('❌ Dispositivo desconectado:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`\n==============================================`);
    console.log(`🚀 Servidor Uiusas System rodando com sucesso!`);
    console.log(`👉 Abra no navegador: http://localhost:${PORT}`);
    console.log(`==============================================\n`);
});

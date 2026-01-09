// Phantom E2EE Messaging Server
// Zero-knowledge message relay - server cannot decrypt anything

const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

// In-memory storage (use Redis/DB in production)
const users = new Map(); // accountId -> { publicKey, connections: Set<ws> }
const messageQueue = new Map(); // accountId -> [messages]

// Create HTTP server for health check
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            users: users.size,
            timestamp: Date.now()
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

console.log('🔒 Phantom E2EE Server Starting...');

wss.on('connection', (ws) => {
    console.log('📡 New connection established');
    
    let currentAccountId = null;
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            
            switch (message.type) {
                case 'register':
                    handleRegister(ws, message);
                    currentAccountId = message.accountId;
                    break;
                    
                case 'sendMessage':
                    handleSendMessage(ws, message);
                    break;
                    
                case 'getPublicKey':
                    handleGetPublicKey(ws, message);
                    break;
                    
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Invalid message format' 
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('🔌 Connection closed');
        if (currentAccountId && users.has(currentAccountId)) {
            const user = users.get(currentAccountId);
            user.connections.delete(ws);
            if (user.connections.size === 0) {
                console.log(`User ${currentAccountId} offline`);
            }
        }
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Register user and store public key
function handleRegister(ws, message) {
    const { accountId, publicKey, username } = message;
    
    if (!accountId || !publicKey) {
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Missing accountId or publicKey' 
        }));
        return;
    }
    
    if (!users.has(accountId)) {
        users.set(accountId, {
            publicKey,
            username: username || 'Anonymous',
            connections: new Set(),
            registeredAt: Date.now()
        });
    }
    
    const user = users.get(accountId);
    user.connections.add(ws);
    
    console.log(`✅ User registered: ${accountId} (${username})`);
    
    ws.send(JSON.stringify({ 
        type: 'registered',
        accountId,
        onlineUsers: users.size
    }));
    
    // Deliver queued messages
    if (messageQueue.has(accountId)) {
        const queue = messageQueue.get(accountId);
        queue.forEach(msg => {
            ws.send(JSON.stringify(msg));
        });
        messageQueue.delete(accountId);
    }
}

// Relay encrypted message to recipient
function handleSendMessage(ws, message) {
    const { to, encryptedMessage, from } = message;
    
    if (!to || !encryptedMessage || !from) {
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message structure' 
        }));
        return;
    }
    
    const recipient = users.get(to);
    
    const messagePacket = {
        type: 'newMessage',
        from,
        encryptedMessage,
        timestamp: Date.now(),
        id: crypto.randomBytes(16).toString('hex')
    };
    
    if (recipient && recipient.connections.size > 0) {
        let delivered = false;
        recipient.connections.forEach(conn => {
            if (conn.readyState === WebSocket.OPEN) {
                conn.send(JSON.stringify(messagePacket));
                delivered = true;
            }
        });
        
        if (delivered) {
            console.log(`📨 Message delivered: ${from} -> ${to}`);
            ws.send(JSON.stringify({ 
                type: 'messageSent',
                messageId: messagePacket.id,
                status: 'delivered'
            }));
        }
    } else {
        if (!messageQueue.has(to)) {
            messageQueue.set(to, []);
        }
        messageQueue.get(to).push(messagePacket);
        
        console.log(`📥 Message queued: ${from} -> ${to}`);
        ws.send(JSON.stringify({ 
            type: 'messageSent',
            messageId: messagePacket.id,
            status: 'queued'
        }));
    }
}

// Get recipient's public key for encryption
function handleGetPublicKey(ws, message) {
    const { accountId } = message;
    
    const user = users.get(accountId);
    
    if (user) {
        ws.send(JSON.stringify({
            type: 'publicKey',
            accountId,
            publicKey: user.publicKey,
            username: user.username
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'User not found'
        }));
    }
}

// Cleanup old offline messages (run every hour)
setInterval(() => {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    messageQueue.forEach((messages, accountId) => {
        const filtered = messages.filter(msg => 
            now - msg.timestamp < maxAge
        );
        
        if (filtered.length === 0) {
            messageQueue.delete(accountId);
        } else {
            messageQueue.set(accountId, filtered);
        }
    });
    
    console.log(`🧹 Cleanup complete. Queued messages: ${messageQueue.size}`);
}, 60 * 60 * 1000);

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Phantom E2EE Server running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, closing server...');
    wss.clients.forEach(client => {
        client.close();
    });
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

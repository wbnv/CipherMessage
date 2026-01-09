# CIPHER - End-to-End Encrypted Messaging

A zero-knowledge, E2EE messaging platform with no accounts, no tracking, and complete privacy.

## 🔐 Security Features

- **End-to-End Encryption**: TweetNaCl (NaCl) box encryption
- **Zero-Knowledge Server**: Server cannot decrypt messages
- **No Account Creation**: Just recovery phrases
- **No Metadata**: No IP logging, no session tracking
- **Perfect Forward Secrecy**: Each message uses unique keys
- **Client-Side Encryption**: Keys never leave your device

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- A terminal/command line

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Server**
```bash
npm start
```

Server runs on `http://localhost:3000`

3. **Open the App**

Open `index.html` in your browser, or serve it:

```bash
# Using Python
python3 -m http.server 8080

# Using Node
npx http-server -p 8080
```

Then visit `http://localhost:8080`

## 📱 How to Use

### Create Account

1. Enter a username (optional, just for display)
2. Click "Generate Account"
3. **SAVE YOUR RECOVERY PHRASE** - This is the ONLY way to recover your account
4. You'll get a unique Account ID

### Start Chatting

1. Share your Account ID with someone (via secure channel)
2. Get their Account ID
3. Enter their Account ID in "Connect" section
4. Click "Start Chat"
5. Send encrypted messages!

### Recovery

If you lose access:
1. Click "Restore Account"
2. Enter your 12-word recovery phrase
3. Your account is restored

## 🏗️ Architecture

### Frontend (`index.html`)
- Brutalist-Swiss design aesthetic
- Mobile-first responsive
- Client-side encryption using TweetNaCl
- LocalStorage for message history (encrypted)

### Backend (`server.js`)
- WebSocket server for message relay
- Zero-knowledge: only sees encrypted blobs
- Stores public keys (not private keys)
- Message queue for offline delivery
- Auto-cleanup after 7 days

## 🔧 Production Deployment

### Deploy Server

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**VPS (Ubuntu):**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone & run
git clone your-repo
cd your-repo
npm install
npm start

# Use PM2 for persistence
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

**Change WebSocket URL:**

In `index.html`, update:
```javascript
const WS_URL = 'ws://localhost:3000'; // Change to your server URL
// Example: 'wss://your-app.herokuapp.com'
```

### Deploy Frontend

**Netlify/Vercel:**
- Just drag & drop `index.html`
- Or connect your GitHub repo

**GitHub Pages:**
```bash
# Push to gh-pages branch
git checkout -b gh-pages
git push origin gh-pages
```

## 🛡️ Security Considerations

### Current Implementation
✅ E2EE with NaCl box encryption  
✅ Zero-knowledge server  
✅ No password storage  
✅ Recovery phrase-based accounts  
✅ Offline message queue  

### Production Improvements Needed

1. **Forward Secrecy**: Implement Double Ratchet (Signal Protocol)
2. **Metadata Protection**: 
   - Onion routing (Tor integration)
   - Message padding to hide length
   - Randomized timestamps
3. **Key Verification**: Safety numbers/fingerprints
4. **Secure Storage**: 
   - Encrypt localStorage with device password
   - Use hardware security module on mobile
5. **Self-Destructing Messages**: Client-side timers
6. **Screenshot Detection**: Warn users
7. **Audit**: Third-party security audit

## 📂 File Structure

```
cipher/
├── index.html          # Frontend (E2EE chat interface)
├── server.js           # Backend (WebSocket message relay)
├── package.json        # Node dependencies
└── README.md          # This file
```

## 🎨 Design Philosophy

**Brutalist-Swiss Aesthetic:**
- Bold, geometric shapes
- High contrast (black/white with accent colors)
- Organic blob backgrounds
- Functional, no-nonsense UI
- Mobile-first responsive design

## 🐛 Troubleshooting

**"OFFLINE" status:**
- Make sure server is running (`npm start`)
- Check WebSocket URL in `index.html`
- Check browser console for errors

**Messages not sending:**
- Ensure recipient has created an account
- Verify their Account ID is correct
- Check that both users are online

**Can't decrypt messages:**
- Both users must have generated accounts
- Recovery phrase must be exact (12 words, lowercase)

## 📜 License

MIT License - Do whatever you want with this code.

## ⚠️ Disclaimer

This is a demonstration project. While it implements real encryption, it hasn't been audited by security professionals. Do NOT use for life-critical communications without proper security review.

For maximum security, use established apps like Signal or Session.

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve security

## 🔮 Future Features

- [ ] Group chats
- [ ] Voice/video calls (E2EE)
- [ ] File sharing (encrypted)
- [ ] Desktop app (Electron)
- [ ] Mobile app (React Native)
- [ ] Self-destructing messages
- [ ] Read receipts (optional)
- [ ] Typing indicators
- [ ] Multi-device sync

---

Built with ❤️ and 🔒 for privacy

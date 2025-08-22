# Telegram Biometric Bot with Mini App

A complete Telegram bot implementation with biometric authentication capabilities using Grammy library, Node.js with TypeScript, and Vite.js for the frontend mini app.

## Features

🔐 **Biometric Authentication**
- Fingerprint authentication support
- Face ID/Face recognition support
- Secure token storage on device
- Device binding for enhanced security

🤖 **Telegram Bot Integration**
- Built with Grammy framework
- Web App integration
- Session management
- Real-time biometric data handling

🎨 **Modern Frontend**
- Vite.js with TypeScript
- Responsive design with Telegram theme support
- Progressive Web App (PWA) capabilities
- Dark/Light theme support

🛡️ **Security Features**
- JWT token validation
- CORS protection
- Input validation with Zod
- Secure data transmission

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- HTTPS domain for hosting the mini app

## Project Structure

```
telegram-biometric-bot/
├── src/                    # Backend source code
│   ├── index.ts           # Main bot file
│   └── types/             # TypeScript definitions
├── mini-app/              # Frontend mini app
│   ├── src/
│   │   ├── main.ts        # Main app logic
│   │   └── style.css      # Styles
│   ├── index.html         # HTML template
│   ├── vite.config.ts     # Vite configuration
│   └── package.json       # Frontend dependencies
├── package.json           # Backend dependencies
├── tsconfig.json          # TypeScript config
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Development environment
└── README.md              # This file
```

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd telegram-biometric-bot

# Install backend dependencies
npm install

# Install frontend dependencies
cd mini-app
npm install
cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
BOT_TOKEN=your_bot_token_from_botfather
WEB_APP_URL=https://your-mini-app-domain.com
JWT_SECRET=your_super_secure_jwt_secret_here
PORT=3000
NODE_ENV=development
```

### 3. Create Your Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot with `/newbot`
3. Get your bot token and add it to `.env`
4. Set bot commands with `/setcommands`:
   ```
   start - Start the bot and open biometric app
   status - Check biometric setup status
   help - Show help message
   reset - Reset biometric settings
   ```

### 4. Deploy Mini App

#### Option A: Vercel (Recommended)

```bash
cd mini-app

# Build the frontend
npm run build

# Deploy to Vercel
npx vercel --prod

# Update WEB_APP_URL in .env with your Vercel URL
```

#### Option B: Netlify

```bash
cd mini-app
npm run build

# Deploy dist folder to Netlify
# Update WEB_APP_URL in .env with your Netlify URL
```

#### Option C: Self-hosted

```bash
cd mini-app
npm run build

# Serve the dist folder with any static hosting service
# Make sure HTTPS is enabled
```

### 5. Set Web App URL

After deploying the mini app, update your bot's web app URL:

```bash
# Method 1: Using BotFather
# Send /newapp to @BotFather
# Follow the instructions to set your web app URL

# Method 2: Using Bot API (replace YOUR_BOT_TOKEN and YOUR_WEB_APP_URL)
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "🔐 Biometric App",
      "web_app": {
        "url": "YOUR_WEB_APP_URL"
      }
    }
  }'
```

### 6. Run the Bot

#### Development Mode

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend (for development)
cd mini-app
npm run dev
```

#### Production Mode

```bash
# Build and start backend
npm run build
npm start
```

#### Using Docker

```bash
# Build and run with docker-compose
docker-compose up -d
```

## Bot Commands

- `/start` - Initialize the bot and show the biometric app button
- `/status` - Check current biometric authentication status
- `/help` - Display help information
- `/reset` - Reset all biometric settings

## Development

### Backend Development

```bash
# Start in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend Development

```bash
cd mini-app

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and format
npm run lint
npm run format
```

### Testing

```bash
# Test the bot locally using ngrok
npx ngrok http 3000

# Update WEB_APP_URL to your ngrok URL for testing
# Test the mini app at your ngrok URL
```

## Biometric Authentication Flow

1. **Initialization**: User starts the bot with `/start`
2. **Web App Launch**: User opens the biometric mini app
3. **Permission Request**: App requests biometric access if needed
4. **Setup**: User sets up biometric authentication (first time)
5. **Authentication**: User authenticates using biometrics
6. **Data Transmission**: Secure biometric data sent to bot
7. **Verification**: Bot processes and confirms authentication

## Security Considerations

### Data Protection
- Biometric tokens never leave the user's device
- All data transmission is encrypted
- JWT tokens for session validation
- Input validation on all endpoints

### Best Practices
- Use HTTPS for all connections
- Implement rate limiting
- Validate all Telegram Web App data
- Store minimal user data
- Regular security audits

## Deployment Options

### Production Deployment

#### Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku config:set BOT_TOKEN=your_token
heroku config:set WEB_APP_URL=your_webapp_url
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
railway login
railway init
railway add
railway deploy
```

#### DigitalOcean App Platform
```bash
# Use the DigitalOcean App Platform dashboard
# Connect your GitHub repository
# Set environment variables
# Deploy
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Telegram bot token from BotFather | Yes |
| `WEB_APP_URL` | URL where mini app is hosted | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `PORT` | Port for the backend server | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `LOG_LEVEL` | Logging level | No (default: info) |
| `DATABASE_URL` | Database connection string | No |

## API Endpoints

### Health Check
```
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

### Validate Web App Data
```
POST /api/validate-webapp
Body: { "initData": "telegram_init_data" }
Response: { "valid": true, "token": "jwt_token" }
```

### Store Biometric Data
```
POST /api/biometric
Body: { "token": "...", "deviceId": "...", "biometricType": "finger", "userId": 123 }
Response: { "success": true, "message": "..." }
```

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check BOT_TOKEN is correct
   - Ensure bot is not stopped in BotFather
   - Verify network connectivity

2. **Mini app not loading**
   - Check WEB_APP_URL is correct and accessible
   - Ensure HTTPS is enabled
   - Verify CORS headers

3. **Biometric not working**
   - Check device compatibility
   - Ensure Telegram app is updated
   - Verify biometric permissions

4. **Web app validation fails**
   - Check JWT_SECRET configuration
   - Verify initData integrity
   - Ensure proper CORS setup

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Testing Biometric Features

1. Use a physical device (iOS/Android)
2. Ensure biometrics are set up on the device
3. Test in Telegram app (not web browser)
4. Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- 🔐 [Telegram Web Apps Documentation](https://core.telegram.org/bots/webapps)
- 🤖 [Grammy Framework Documentation](https://grammy.dev/)
- ⚡ [Vite.js Documentation](https://vitejs.dev/)

## Changelog

### v1.0.0
- Initial release
- Basic biometric authentication
- Telegram bot integration
- Mini app with Vite.js
- Docker support
- Comprehensive documentation
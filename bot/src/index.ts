import { Bot, Context, session, InlineKeyboard } from 'grammy';
import type { SessionFlavor } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import type { ConversationFlavor } from '@grammyjs/conversations';
// WebApp import removed - not needed for server-side bot code
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Types
interface SessionData {
  userId?: number;
  biometricEnabled?: boolean;
  biometricToken?: string | undefined;
  deviceId?: string | undefined;
}

type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;

// Validation schemas
const BiometricDataSchema = z.object({
  token: z.string(),
  deviceId: z.string(),
  success: z.boolean(),
  biometricType: z.enum(['finger', 'face', 'unknown']).optional(),
});

const WebAppDataSchema = z.object({
  user: z.object({
    id: z.number(),
    first_name: z.string(),
    username: z.string().optional(),
  }),
  auth_date: z.number(),
  hash: z.string(),
});

class TelegramBiometricBot {
  private bot: Bot<MyContext>;
  private app: express.Application;
  private readonly botToken: string;
  private readonly webAppUrl: string;
  private readonly jwtSecret: string;

  constructor() {
    this.botToken = process.env.BOT_TOKEN!;
    this.webAppUrl = process.env.WEB_APP_URL || 'https://your-app.vercel.app';
    this.jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';

    if (!this.botToken) {
      throw new Error('BOT_TOKEN is required');
    }

    this.bot = new Bot<MyContext>(this.botToken);
    this.app = express();
    
    this.setupMiddleware();
    this.setupBot();
    this.setupWebServer();
  }

  private setupMiddleware() {
    // Express middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "'unsafe-inline'", "telegram.org"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "telegram.org"],
          "connect-src": ["'self'", "telegram.org"],
        },
      },
    }));
    this.app.use(cors({
      origin: [this.webAppUrl, 'https://web.telegram.org'],
      credentials: true,
    }));
    this.app.use(express.json());

    // Bot middleware
    this.bot.use(session({
      initial: (): SessionData => ({}),
    }));
    
    this.bot.use(conversations());
    // Note: WebApp middleware is not needed for basic functionality
  }

  private setupBot() {
    // Start command
    this.bot.command('start', async (ctx) => {
      const keyboard = new InlineKeyboard()
        .webApp('🔐 Open Biometric App', this.webAppUrl)
        .row()
        .text('ℹ️ About Biometrics', 'about_biometrics');

      await ctx.reply(
        '🤖 Welcome to the Biometric Security Bot!\n\n' +
        '🔒 This bot demonstrates secure biometric authentication using Telegram\'s Web App platform.\n\n' +
        '✨ Features:\n' +
        '• Fingerprint authentication\n' +
        '• Face recognition support\n' +
        '• Secure token storage\n' +
        '• Device binding\n\n' +
        'Click the button below to open the biometric app:',
        { reply_markup: keyboard }
      );
    });

    // About biometrics callback
    this.bot.callbackQuery('about_biometrics', async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        '🔐 About Biometric Authentication:\n\n' +
        '🔹 **Fingerprint**: Uses your device\'s fingerprint sensor\n' +
        '🔹 **Face Recognition**: Uses your device\'s face recognition\n' +
        '🔹 **Secure Storage**: Biometric tokens are stored securely on your device\n' +
        '🔹 **Device Binding**: Each token is tied to your specific device\n\n' +
        '⚡ Supported on devices with:\n' +
        '• iOS with Touch ID or Face ID\n' +
        '• Android with fingerprint or face unlock\n\n' +
        '🛡️ Your biometric data never leaves your device!'
      );
    });

    // Handle Web App data
    this.bot.on('message:web_app_data', async (ctx) => {
      try {
        const webAppData = ctx.message.web_app_data?.data;
        if (!webAppData) {
          await ctx.reply('❌ Invalid web app data received');
          return;
        }

        // Parse and validate the data
        const parsedData = JSON.parse(webAppData);
        const validation = BiometricDataSchema.safeParse(parsedData);

        if (!validation.success) {
          await ctx.reply('❌ Invalid biometric data format');
          return;
        }

        const { token, deviceId, success, biometricType } = validation.data;

        if (success) {
          // Store biometric data in session
          ctx.session.userId = ctx.from.id;
          ctx.session.biometricEnabled = true;
          ctx.session.biometricToken = token;
          ctx.session.deviceId = deviceId;

          const typeEmoji = this.getBiometricEmoji(biometricType);
          
          await ctx.reply(
            `✅ Biometric authentication successful!\n\n` +
            `${typeEmoji} **Type**: ${biometricType || 'unknown'}\n` +
            `📱 **Device ID**: ${deviceId.substring(0, 8)}...\n` +
            `🔐 **Status**: Enabled\n\n` +
            `Your biometric profile has been securely saved!`,
            { parse_mode: 'Markdown' }
          );
        } else {
          await ctx.reply(
            '❌ Biometric authentication failed\n\n' +
            'Please try again or check if biometrics are properly set up on your device.'
          );
        }
      } catch (error) {
        console.error('Error processing web app data:', error);
        await ctx.reply('❌ Error processing biometric data. Please try again.');
      }
    });

    // Status command
    this.bot.command('status', async (ctx) => {
      const { biometricEnabled, biometricToken, deviceId } = ctx.session;

      if (biometricEnabled && biometricToken) {
        await ctx.reply(
          '🔐 **Biometric Status**: Enabled ✅\n\n' +
          `📱 **Device**: ${deviceId?.substring(0, 8)}...\n` +
          `🕒 **Last Updated**: ${new Date().toLocaleDateString()}\n\n` +
          'Your biometric authentication is active and secure!',
          { parse_mode: 'Markdown' }
        );
      } else {
        const keyboard = new InlineKeyboard()
          .webApp('🔐 Setup Biometrics', this.webAppUrl);

        await ctx.reply(
          '🔓 **Biometric Status**: Not Configured\n\n' +
          'Click the button below to set up biometric authentication:',
          { 
            reply_markup: keyboard,
            parse_mode: 'Markdown'
          }
        );
      }
    });

    // Help command
    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        '🤖 **Biometric Bot Commands**:\n\n' +
        '🔹 `/start` - Start the bot and open biometric app\n' +
        '🔹 `/status` - Check your biometric setup status\n' +
        '🔹 `/help` - Show this help message\n' +
        '🔹 `/reset` - Reset biometric settings\n\n' +
        '💡 **Tips**:\n' +
        '• Make sure your device supports biometrics\n' +
        '• Grant permissions when prompted\n' +
        '• Keep your device secure',
        { parse_mode: 'Markdown' }
      );
    });

    // Reset command
    this.bot.command('reset', async (ctx) => {
      ctx.session.biometricEnabled = false;
      ctx.session.biometricToken = undefined;
      ctx.session.deviceId = undefined;

      await ctx.reply(
        '🔄 Biometric settings have been reset.\n\n' +
        'Use /start to set up biometric authentication again.'
      );
    });

    // Error handling
    this.bot.catch((err) => {
      console.error('Bot error:', err);
    });
  }

  private setupWebServer() {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Validate Telegram Web App data
    this.app.post('/api/validate-webapp', (req: Request, res: Response) => {
      try {
        const { initData } = req.body;
        
        if (!initData) {
          res.status(400).json({ error: 'Missing initData' });
        }else{

        // Validate the init data hash
        const isValid = this.validateTelegramWebAppData(initData);
        
        if (!isValid) {
            res.status(401).json({ error: 'Invalid init data' });
        }else{


        // Generate JWT token for the session
        const token = jwt.sign(
            { initData, timestamp: Date.now() },
            this.jwtSecret,
            { expiresIn: '1h' }
          );
  
          res.json({ valid: true, token });
        }
    }
      } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ error: 'Validation failed' });
      }
    });

    // Store biometric data
    this.app.post('/api/biometric', (req: Request, res: Response) => {
      try {
        const { token, deviceId, biometricType, userId } = req.body;

        // In a real app, you'd store this in a database
        console.log('Biometric data received:', {
          userId,
          deviceId: deviceId.substring(0, 8) + '...',
          biometricType,
          timestamp: new Date().toISOString()
        });

        res.json({ 
          success: true, 
          message: 'Biometric data stored successfully' 
        });
      } catch (error) {
        console.error('Biometric storage error:', error);
        res.status(500).json({ error: 'Failed to store biometric data' });
      }
    });
  }

  private validateTelegramWebAppData(initData: string): boolean {
    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      if (!hash) {
        console.error('No hash found in initData');
        return false;
      }

      // Remove hash from params for validation
      urlParams.delete('hash');

      // Create data-check-string: sort alphabetically and join with \n
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      console.log('Data check string:', dataCheckString);

      // Step 1: Create secret key = HMAC_SHA256(bot_token, "WebAppData")
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(this.botToken)
        .digest();

      // Step 2: Calculate hash = HMAC_SHA256(data_check_string, secret_key)
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      console.log('Expected hash:', hash);
      console.log('Calculated hash:', calculatedHash);

      // Check auth_date to prevent use of outdated data (optional but recommended)
      const authDate = urlParams.get('auth_date');
      if (authDate) {
        const authTimestamp = parseInt(authDate);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeDiff = currentTimestamp - authTimestamp;
        
        // Reject data older than 24 hours (86400 seconds)
        if (timeDiff > 86400) {
          console.error('Auth date is too old:', timeDiff, 'seconds');
          return false;
        }
      }

      return calculatedHash === hash;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  private getBiometricEmoji(type?: string): string {
    switch (type) {
      case 'finger':
      case 'fingerprint':
        return '👆';
      case 'face':
        return '👤';
      default:
        return '🔐';
    }
  }

  public async start() {
    // Start the web server
    const port = process.env.PORT || 3000;
    this.app.listen(port, () => {
      console.log(`🚀 Web server running on port ${port}`);
    });

    // Start the bot
    await this.bot.start({
      onStart: (botInfo) => {
        console.log(`🤖 Bot @${botInfo.username} started successfully!`);
      },
    });
  }
}

// Initialize and start the bot
async function main() {
  try {
    const bot = new TelegramBiometricBot();
    await bot.start();
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main().catch(console.error);
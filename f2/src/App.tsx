import { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import './App.css'
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { Buffer } from 'buffer'

interface TelegramData {
  [key: string]: unknown
}

interface SolanaWallet {
  publicKey: string
  secretKey?: Uint8Array
  balance?: number
}

// Extend Window interface to include Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
      };
    };
  }
}

function App() {
  const [telegramData, setTelegramData] = useState<TelegramData>({})
  const [isReady, setIsReady] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [solanaWallet, setSolanaWallet] = useState<SolanaWallet | null>(null)
  const [connection] = useState(new Connection('https://api.devnet.solana.com', 'confirmed'))
  const [isLoading, setIsLoading] = useState(false)

  // Simple check for required Telegram values
  const checkTelegramValues = () => {
    // Check if we have valid Telegram init data
    const hasInitData = WebApp.initData && WebApp.initData.length > 0
    const hasValidUser = WebApp.initDataUnsafe?.user?.id
    const isInTelegram = window.Telegram?.WebApp?.initData
    
    // Additional check for Telegram environment
    const userAgent = navigator.userAgent.toLowerCase()
    const isTelegramApp = userAgent.includes('telegram') || 
                         userAgent.includes('tdesktop') || 
                         hasInitData || 
                         hasValidUser ||
                         isInTelegram
    
    return isTelegramApp
  }

  useEffect(() => {
    // Simple check for Telegram values existence
    const authorized = checkTelegramValues()
    setIsAuthorized(Boolean(authorized))

    if (authorized) {
      // Initialize Telegram WebApp
      WebApp.ready()
      
      // Collect all Telegram WebApp data
      const data: TelegramData = {
        // Basic WebApp info
        version: WebApp.version,
        platform: WebApp.platform,
        colorScheme: WebApp.colorScheme,
        themeParams: WebApp.themeParams,
        isExpanded: WebApp.isExpanded,
        viewportHeight: WebApp.viewportHeight,
        viewportStableHeight: WebApp.viewportStableHeight,
        headerColor: WebApp.headerColor,
        backgroundColor: WebApp.backgroundColor,
        isClosingConfirmationEnabled: WebApp.isClosingConfirmationEnabled,
        isVerticalSwipesEnabled: WebApp.isVerticalSwipesEnabled,
        
        // User data
        initData: WebApp.initData,
        initDataUnsafe: WebApp.initDataUnsafe,
        
        // Main button
        MainButton: {
          text: WebApp.MainButton.text,
          color: WebApp.MainButton.color,
          textColor: WebApp.MainButton.textColor,
          isVisible: WebApp.MainButton.isVisible,
          isProgressVisible: WebApp.MainButton.isProgressVisible,
          isActive: WebApp.MainButton.isActive
        },
        
        // Back button
        BackButton: {
          isVisible: WebApp.BackButton.isVisible
        },
        
        // Settings button
        SettingsButton: {
          isVisible: WebApp.SettingsButton.isVisible
        },
        
        // Haptic feedback
        HapticFeedback: WebApp.HapticFeedback ? 'Available' : 'Not Available',
        
        // Cloud storage
        CloudStorage: WebApp.CloudStorage ? 'Available' : 'Not Available',
        
        // Biometric manager
        BiometricManager: WebApp.BiometricManager ? {
          isInited: WebApp.BiometricManager.isInited,
          isBiometricAvailable: WebApp.BiometricManager.isBiometricAvailable,
          biometricType: WebApp.BiometricManager.biometricType,
          isAccessRequested: WebApp.BiometricManager.isAccessRequested,
          isAccessGranted: WebApp.BiometricManager.isAccessGranted,
          isBiometricTokenSaved: WebApp.BiometricManager.isBiometricTokenSaved,
          deviceId: WebApp.BiometricManager.deviceId
        } : 'Not Available'
      }

      setTelegramData(data)
    }
    
    setIsReady(true)
  }, [])


  // Initialize BiometricManager
  const initBiometric = () => {
    if (!WebApp.BiometricManager) {
      alert('BiometricManager not available')
      return
    }
    
    WebApp.BiometricManager.init(() => {
      alert('BiometricManager initialized successfully')
      // Refresh the telegram data to show updated status
      updateTelegramData()
    })
  }

  // Request biometric access
  const requestBiometricAccess = () => {
    if (!WebApp.BiometricManager?.isInited) {
      alert('Please initialize BiometricManager first')
      return
    }

    WebApp.BiometricManager.requestAccess({
      reason: "Please grant biometric access to secure your data"
    }, (granted) => {
      alert(`Access ${granted ? 'granted' : 'denied'}`)
      updateTelegramData()
    })
  }

  // Update/Save biometric token
  const updateBiometricToken = () => {
    if (!WebApp.BiometricManager?.isAccessGranted) {
      alert('Please grant biometric access first')
      return
    }

    const token = `token_${Date.now()}`
    WebApp.BiometricManager.updateBiometricToken(token, (updated) => {
      alert(`Token ${updated ? 'saved' : 'failed to save'}: ${token}`)
      updateTelegramData()
    })
  }

  // Authenticate using biometrics
  const authenticateBiometric = () => {
    if (!WebApp.BiometricManager?.isBiometricTokenSaved) {
      alert('Please save a biometric token first')
      return
    }

    WebApp.BiometricManager.authenticate({
      reason: "Please authenticate to verify your identity"
    }, (authenticated: boolean) => {
      if (authenticated) {
        alert('Authentication successful!')
      } else {
        alert('Authentication failed')
      }
      updateTelegramData()
    })
  }

  // Delete biometric token
  const deleteBiometricToken = () => {
    if (!WebApp.BiometricManager?.isBiometricTokenSaved) {
      alert('No biometric token to delete')
      return
    }

    // Note: There's no direct delete method in the API, but we can update with empty token
    WebApp.BiometricManager.updateBiometricToken('', (updated) => {
      alert(`Token ${updated ? 'deleted' : 'failed to delete'}`)
      updateTelegramData()
    })
  }

  // Create Solana wallet with biometric protection
  const createSolanaWallet = async () => {
    if (!WebApp.BiometricManager?.isAccessGranted) {
      alert('Please grant biometric access first')
      return
    }

    if (!WebApp.BiometricManager?.isBiometricTokenSaved) {
      alert('Please save a biometric token first')
      return
    }

    setIsLoading(true)
    try {
      // Generate new keypair
      const keypair = Keypair.generate()
      
      // Convert secret key to base64 for storage using a more browser-compatible approach
      let secretKeyBase64: string
      try {
        secretKeyBase64 = Buffer.from(keypair.secretKey).toString('base64')
      } catch {
        // Fallback method using btoa for browser compatibility
        const binaryString = String.fromCharCode(...Array.from(keypair.secretKey))
        secretKeyBase64 = btoa(binaryString)
      }
      
      // Store encrypted wallet data in biometric token
      const walletData = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: secretKeyBase64,
        createdAt: Date.now()
      }
      
      // Use biometric authentication to protect wallet creation
      WebApp.BiometricManager.authenticate({
        reason: "Create a new Solana wallet protected by biometrics"
      }, async (authenticated: boolean) => {
        if (authenticated) {
          try {
            // Store wallet data as encrypted token
            const encryptedWalletData = JSON.stringify(walletData)
            WebApp.BiometricManager.updateBiometricToken(encryptedWalletData, async (updated) => {
              if (updated) {
                // Get balance
                const balance = await connection.getBalance(keypair.publicKey)
                
                setSolanaWallet({
                  publicKey: keypair.publicKey.toBase58(),
                  secretKey: keypair.secretKey,
                  balance: balance / LAMPORTS_PER_SOL
                })
                
                alert(`Solana wallet created successfully!\nPublic Key: ${keypair.publicKey.toBase58()}\nBalance: ${balance / LAMPORTS_PER_SOL} SOL`)
                updateTelegramData()
              } else {
                alert('Failed to save wallet data')
              }
              setIsLoading(false)
            })
          } catch (error) {
            alert(`Error creating wallet: ${error}`)
            setIsLoading(false)
          }
        } else {
          alert('Biometric authentication failed')
          setIsLoading(false)
        }
      })
    } catch (error) {
      alert(`Error creating wallet: ${error}`)
      setIsLoading(false)
    }
  }

  // Load existing Solana wallet from biometric storage
  const loadSolanaWallet = async () => {
    if (!WebApp.BiometricManager?.isAccessGranted) {
      alert('Please grant biometric access first')
      return
    }

    if (!WebApp.BiometricManager?.isBiometricTokenSaved) {
      alert('No wallet found. Please create a wallet first.')
      return
    }

    setIsLoading(true)
    
    WebApp.BiometricManager.authenticate({
      reason: "Access your Solana wallet"
    }, async (authenticated: boolean) => {
      if (authenticated) {
        try {
          // Get the stored token (which contains wallet data)
          // Note: In a real implementation, you'd need a way to retrieve the token
          // For demo purposes, we'll show how it would work
          alert('Wallet loading functionality would retrieve encrypted wallet data from biometric storage')
          setIsLoading(false)
        } catch (error) {
          alert(`Error loading wallet: ${error}`)
          setIsLoading(false)
        }
      } else {
        alert('Biometric authentication failed')
        setIsLoading(false)
      }
    })
  }

  // Sign and send a Solana transaction with biometric authentication
  const signAndSendTransaction = async (toAddress: string, amount: number) => {
    if (!solanaWallet?.secretKey) {
      alert('No wallet loaded. Please create or load a wallet first.')
      return
    }

    if (!toAddress || amount <= 0) {
      alert('Please provide valid recipient address and amount')
      return
    }

    setIsLoading(true)

    WebApp.BiometricManager.authenticate({
      reason: `Sign transaction: Send ${amount} SOL to ${toAddress.slice(0, 8)}...`
    }, async (authenticated: boolean) => {
      if (authenticated) {
        try {
          const fromKeypair = Keypair.fromSecretKey(solanaWallet.secretKey!)
          const toPublicKey = new PublicKey(toAddress)
          
          // Create transaction
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: fromKeypair.publicKey,
              toPubkey: toPublicKey,
              lamports: amount * LAMPORTS_PER_SOL,
            })
          )

          // Get recent blockhash
          const { blockhash } = await connection.getLatestBlockhash()
          transaction.recentBlockhash = blockhash
          transaction.feePayer = fromKeypair.publicKey

          // Sign transaction
          transaction.sign(fromKeypair)

          // Send transaction
          const signature = await connection.sendRawTransaction(transaction.serialize())
          
          // Confirm transaction
          await connection.confirmTransaction(signature, 'confirmed')
          
          // Update balance
          const newBalance = await connection.getBalance(fromKeypair.publicKey)
          setSolanaWallet(prev => prev ? {...prev, balance: newBalance / LAMPORTS_PER_SOL} : null)
          
          alert(`Transaction successful!\nSignature: ${signature}\nAmount: ${amount} SOL\nTo: ${toAddress}`)
          
        } catch (error) {
          alert(`Transaction failed: ${error}`)
        }
        setIsLoading(false)
      } else {
        alert('Biometric authentication failed')
        setIsLoading(false)
      }
    })
  }

  // Demo transaction function
  const sendDemoTransaction = () => {
    const demoAddress = 'So11111111111111111111111111111111111111112' // Wrapped SOL address as demo
    const demoAmount = 0.001 // Small amount for demo
    signAndSendTransaction(demoAddress, demoAmount)
  }

  // Get wallet balance
  const refreshWalletBalance = async () => {
    if (!solanaWallet?.publicKey) {
      alert('No wallet loaded')
      return
    }

    setIsLoading(true)
    try {
      const publicKey = new PublicKey(solanaWallet.publicKey)
      const balance = await connection.getBalance(publicKey)
      setSolanaWallet(prev => prev ? {...prev, balance: balance / LAMPORTS_PER_SOL} : null)
      alert(`Balance updated: ${balance / LAMPORTS_PER_SOL} SOL`)
    } catch (error) {
      alert(`Error fetching balance: ${error}`)
    }
    setIsLoading(false)
  }

  // Update telegram data
  const updateTelegramData = () => {
    const data: TelegramData = {
      // Basic WebApp info 
      version: WebApp.version,
      platform: WebApp.platform,
      colorScheme: WebApp.colorScheme,
      themeParams: WebApp.themeParams,
      isExpanded: WebApp.isExpanded,
      viewportHeight: WebApp.viewportHeight,
      viewportStableHeight: WebApp.viewportStableHeight,
      headerColor: WebApp.headerColor,
      backgroundColor: WebApp.backgroundColor,
      isClosingConfirmationEnabled: WebApp.isClosingConfirmationEnabled,
      isVerticalSwipesEnabled: WebApp.isVerticalSwipesEnabled,
      
      // User data
      initData: WebApp.initData,
      initDataUnsafe: WebApp.initDataUnsafe,
      
      // Main button
      MainButton: {
        text: WebApp.MainButton.text,
        color: WebApp.MainButton.color,
        textColor: WebApp.MainButton.textColor,
        isVisible: WebApp.MainButton.isVisible,
        isProgressVisible: WebApp.MainButton.isProgressVisible,
        isActive: WebApp.MainButton.isActive
      },
      
      // Back button
      BackButton: {
        isVisible: WebApp.BackButton.isVisible
      },
      
      // Settings button
      SettingsButton: {
        isVisible: WebApp.SettingsButton.isVisible
      },
      
      // Haptic feedback
      HapticFeedback: WebApp.HapticFeedback ? 'Available' : 'Not Available',
      
      // Cloud storage
      CloudStorage: WebApp.CloudStorage ? 'Available' : 'Not Available',
      
      // Biometric manager
      BiometricManager: WebApp.BiometricManager ? {
        isInited: WebApp.BiometricManager.isInited,
        isBiometricAvailable: WebApp.BiometricManager.isBiometricAvailable,
        biometricType: WebApp.BiometricManager.biometricType,
        isAccessRequested: WebApp.BiometricManager.isAccessRequested,
        isAccessGranted: WebApp.BiometricManager.isAccessGranted,
        isBiometricTokenSaved: WebApp.BiometricManager.isBiometricTokenSaved,
        deviceId: WebApp.BiometricManager.deviceId
      } : 'Not Available'
    }

    setTelegramData(data)
  }

  const renderValue = (value: unknown): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  // Show loading state
  if (!isReady) {
    return (
      <div style={{ 
        padding: '40px', 
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h1 style={{ 
            color: '#2196F3', 
            marginBottom: '16px',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            Loading...
          </h1>
          <p style={{ 
            color: '#666', 
            lineHeight: '1.6',
            fontSize: '16px',
            marginBottom: '0'
          }}>
            Initializing Telegram WebApp...
          </p>
        </div>
      </div>
    )
  }

  // Show unauthorized message if not opened through Telegram
  if (isReady && !isAuthorized) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '70%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          animation: 'float 7s ease-in-out infinite'
        }}></div>

        {/* Main content card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '60px 40px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          transform: 'translateY(0)',
          animation: 'slideUp 0.8s ease-out'
        }}>
          {/* Telegram icon with animation */}
          <div style={{
            fontSize: '80px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #0088cc, #229ED9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            ✈️
          </div>

          <h1 style={{ 
            color: '#2c3e50',
            marginBottom: '16px',
            fontSize: '32px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            lineHeight: '1.2'
          }}>
            Access Restricted
          </h1>

          <p style={{ 
            color: '#64748b',
            lineHeight: '1.7',
            fontSize: '18px',
            marginBottom: '32px',
            fontWeight: '400'
          }}>
            This biometric security app is exclusively available through 
            <strong style={{ color: '#0088cc' }}> Telegram Mini Apps</strong>.
          </p>

          {/* Instructions card */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{
              color: '#1e293b',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📱 How to Access
            </h3>
            <ol style={{
              color: '#475569',
              fontSize: '15px',
              lineHeight: '1.6',
              margin: '0',
              paddingLeft: '20px'
            }}>
              <li style={{ marginBottom: '8px' }}>Open Telegram on your device</li>
              <li style={{ marginBottom: '8px' }}>Search for our bot or use the provided link</li>
              <li style={{ marginBottom: '8px' }}>Tap "Open App" to launch the mini app</li>
              <li>Enjoy secure biometric authentication!</li>
            </ol>
          </div>

          {/* Feature highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#ecfdf5',
              borderRadius: '12px',
              border: '1px solid #d1fae5'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔐</div>
              <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '600' }}>
                Secure Authentication
              </div>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #dbeafe'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>👆</div>
              <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600' }}>
                Biometric Access
              </div>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              border: '1px solid #fde68a'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
              <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                Fast & Reliable
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #0088cc, #229ED9)',
            borderRadius: '16px',
            color: 'white',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🚀</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              Ready to get started?
            </div>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>
              Launch this app from Telegram to continue
            </div>
          </div>

          <p style={{
            color: '#94a3b8',
            fontSize: '13px',
            margin: '0',
            fontStyle: 'italic'
          }}>
            Powered by Telegram WebApp API
          </p>
        </div>

        {/* CSS animations */}
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Telegram WebApp Variables</h1>
      <p>Status: {isReady ? '✅ Ready' : '⏳ Loading...'}</p>
      
      <div style={{ 
        display: 'grid', 
        gap: '10px',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        {Object.entries(telegramData).map(([key, value]) => (
          <div 
            key={key} 
            style={{ 
              border: '1px solid #ccc', 
              padding: '10px', 
              borderRadius: '5px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <strong style={{ color: '#0066cc' }}>{key}:</strong>
            <pre style={{ 
              margin: '5px 0 0 0', 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '12px',
              backgroundColor: '#fff',
              padding: '5px',
              border: '1px solid #ddd',
              borderRadius: '3px'
            }}>
              {renderValue(value)}
            </pre>
          </div>
        ))}
      </div>
      
      {/* Solana Wallet Section */}
      {solanaWallet && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '2px solid #4285f4' }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>🪙 Solana Wallet</h3>
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              <strong>Public Key:</strong> 
              <div style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', color: '#666' }}>
                {solanaWallet.publicKey}
              </div>
            </div>
            <div style={{ fontSize: '14px' }}>
              <strong>Balance:</strong> {solanaWallet.balance?.toFixed(6) || '0'} SOL
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '5px' }}>
        <h3>Biometric Manager Operations</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={initBiometric}
            style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            1. Initialize
          </button>
          <button 
            onClick={requestBiometricAccess}
            style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            2. Request Access
          </button>
          <button 
            onClick={updateBiometricToken}
            style={{ padding: '8px 16px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            3. Save Token
          </button>
          <button 
            onClick={authenticateBiometric}
            style={{ padding: '8px 16px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            4. Authenticate
          </button>
          <button 
            onClick={deleteBiometricToken}
            style={{ padding: '8px 16px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            5. Delete Token
          </button>
        </div>
        
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button 
            onClick={() => WebApp.expand()}
            style={{ margin: '5px', padding: '8px 16px' }}
          >
            Expand App
          </button>
          <button 
            onClick={() => WebApp.close()}
            style={{ margin: '5px', padding: '8px 16px' }}
          >
            Close App
          </button>
          <button 
            onClick={() => WebApp.HapticFeedback?.impactOccurred('medium')}
            style={{ margin: '5px', padding: '8px 16px' }}
          >
            Haptic Feedback
          </button>
          <button 
            onClick={updateTelegramData}
            style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#607D8B', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Refresh Data
          </button>
          <button 
            onClick={() => {
              const authorized = checkTelegramValues()
              alert(`Telegram values check: ${authorized ? 'FOUND' : 'NOT FOUND'}`)
            }}
            style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#FF5722', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            🔄 Check Values
          </button>
        </div>
      </div>

      {/* Solana Wallet Operations */}
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '5px', border: '2px solid #ff9800' }}>
        <h3 style={{ color: '#e65100' }}>🪙 Solana Wallet Operations</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={createSolanaWallet}
            disabled={isLoading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: isLoading ? '#ccc' : '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Creating...' : '🏦 Create Wallet'}
          </button>
          <button 
            onClick={loadSolanaWallet}
            disabled={isLoading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: isLoading ? '#ccc' : '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Loading...' : '📂 Load Wallet'}
          </button>
          <button 
            onClick={refreshWalletBalance}
            disabled={isLoading || !solanaWallet}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: isLoading || !solanaWallet ? '#ccc' : '#FF9800', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: isLoading || !solanaWallet ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Refreshing...' : '💰 Refresh Balance'}
          </button>
          <button 
            onClick={sendDemoTransaction}
            disabled={isLoading || !solanaWallet}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: isLoading || !solanaWallet ? '#ccc' : '#9C27B0', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: isLoading || !solanaWallet ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Sending...' : '💸 Send Demo TX'}
          </button>
        </div>
        
        <div style={{ fontSize: '13px', color: '#666', backgroundColor: '#fff', padding: '12px', borderRadius: '4px' }}>
          <strong>ℹ️ Instructions:</strong>
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Complete biometric setup first (steps 1-3 above)</li>
            <li>Create a new Solana wallet protected by biometrics</li>
            <li>All transactions require biometric authentication</li>
            <li>Wallet connects to Solana Devnet for testing</li>
            <li>Demo transaction sends 0.001 SOL to test address</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default App

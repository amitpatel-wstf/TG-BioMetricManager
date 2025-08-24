import { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import './App.css'

interface TelegramData {
  [key: string]: any
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

  const renderValue = (value: any): string => {
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
    </div>
  )
}

export default App

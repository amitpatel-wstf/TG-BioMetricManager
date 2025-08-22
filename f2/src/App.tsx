import { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import './App.css'

interface TelegramData {
  [key: string]: any
}

function App() {
  const [telegramData, setTelegramData] = useState<TelegramData>({})
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready()
    setIsReady(true)

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

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Telegram WebApp Variables</h1>
      <p>Status: {isReady ? '✅ Ready' : '⏳ Loading...'}</p>
      
      <div style={{ 
        display: 'grid', 
        gap: '10px',
        maxHeight: '80vh',
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
        </div>
      </div>
    </div>
  )
}

export default App

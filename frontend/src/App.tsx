import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import MainMenu from './pages/MainMenu';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import ProfileSetup from './components/ProfileSetup';
import LoginButton from './components/LoginButton';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

type View = 'menu' | 'game' | 'leaderboard';

// Extend Window interface for paywall
declare global {
  interface Window {
    paywallHandshake?: () => Promise<boolean>;
  }
}

const PAYWALL_STORAGE_KEY = 'ic-paywall-session';
const GRACE_PERIOD_MS = 60000; // 60 seconds
const RECHECK_INTERVAL_MS = 30000; // 30 seconds
const PRODUCTION_URL = 'https://3d-asteroids-arcade-game-cho.caffeine.xyz';

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentView, setCurrentView] = useState<View>('menu');
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const lastSuccessfulCheckRef = useRef<number>(0);
  const recheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const paywallCheckedRef = useRef(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Check if we're on production
  const isProduction = window.location.origin === PRODUCTION_URL;

  // Check if we have a valid session in localStorage
  const hasValidStoredSession = (): boolean => {
    try {
      const stored = localStorage.getItem(PAYWALL_STORAGE_KEY);
      if (!stored) return false;
      
      const session = JSON.parse(stored);
      // Check if session exists and has a valid timestamp
      if (session && session.timestamp && session.hasAccess === true) {
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        // Consider session valid if it's within 24 hours
        return sessionAge < 24 * 60 * 60 * 1000;
      }
      return false;
    } catch (error) {
      console.error('Error reading paywall session:', error);
      return false;
    }
  };

  // Store successful payment session
  const storePaymentSession = () => {
    try {
      const session = {
        timestamp: Date.now(),
        hasAccess: true
      };
      localStorage.setItem(PAYWALL_STORAGE_KEY, JSON.stringify(session));
      console.log('Paywall session stored successfully');
    } catch (error) {
      console.error('Error storing paywall session:', error);
    }
  };

  // Check if we're within grace period after last successful check
  const isWithinGracePeriod = (): boolean => {
    if (lastSuccessfulCheckRef.current === 0) return false;
    const timeSinceLastCheck = Date.now() - lastSuccessfulCheckRef.current;
    return timeSinceLastCheck < GRACE_PERIOD_MS;
  };

  // Paywall check function
  const checkPaywall = async (): Promise<void> => {
    // If not in production, grant access immediately
    if (!isProduction) {
      console.log('Not in production environment, granting access');
      setHasAccess(true);
      setCheckingPayment(false);
      return;
    }

    // Check for valid stored session first
    if (hasValidStoredSession()) {
      console.log('Valid stored session found, granting access');
      setHasAccess(true);
      lastSuccessfulCheckRef.current = Date.now();
      setCheckingPayment(false);
      return;
    }

    // If within grace period, maintain access
    if (isWithinGracePeriod()) {
      console.log('Within grace period, maintaining access');
      setHasAccess(true);
      setCheckingPayment(false);
      return;
    }

    // Wait for paywall script to load
    let attempts = 0;
    const maxAttempts = 30; // 15 seconds max wait
    
    while (typeof window.paywallHandshake !== 'function' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    if (typeof window.paywallHandshake === 'function') {
      try {
        console.log('Invoking paywall handshake...');
        const result = await window.paywallHandshake();
        
        console.log('Paywall handshake result:', result);
        
        if (result === true) {
          // Payment successful - store session and grant access
          console.log('Payment verified, granting access');
          storePaymentSession();
          setHasAccess(true);
          lastSuccessfulCheckRef.current = Date.now();
        } else {
          // No access - but check grace period and stored session as fallback
          if (isWithinGracePeriod() || hasValidStoredSession()) {
            console.log('Fallback: granting access via grace period or stored session');
            setHasAccess(true);
            lastSuccessfulCheckRef.current = Date.now();
          } else {
            console.log('No valid payment found');
            setHasAccess(false);
          }
        }
      } catch (error) {
        console.error('Paywall handshake error:', error);
        
        // On error, check if we have recent successful check or stored session
        if (isWithinGracePeriod() || hasValidStoredSession()) {
          console.log('Error fallback: granting access via grace period or stored session');
          setHasAccess(true);
          lastSuccessfulCheckRef.current = Date.now();
        } else {
          console.log('Error and no fallback available');
          setHasAccess(false);
        }
      }
    } else {
      console.warn('Paywall handshake function not available after waiting');
      
      // If handshake not available but we have stored session, grant access
      if (hasValidStoredSession()) {
        console.log('Handshake unavailable but stored session valid, granting access');
        setHasAccess(true);
        lastSuccessfulCheckRef.current = Date.now();
      } else {
        console.log('Handshake unavailable and no stored session');
        setHasAccess(false);
      }
    }
    
    setCheckingPayment(false);
  };

  // Initial paywall check - ONLY after authentication completes
  useEffect(() => {
    // Don't check paywall until authentication is complete
    if (isInitializing) {
      return;
    }

    // Only check once
    if (paywallCheckedRef.current) {
      return;
    }

    paywallCheckedRef.current = true;
    console.log('Starting paywall check after authentication');
    checkPaywall();
  }, [isInitializing]);

  // Set up periodic recheck (every 30 seconds) when user has access
  useEffect(() => {
    if (!checkingPayment && hasAccess && isProduction) {
      console.log('Setting up periodic paywall recheck');
      recheckIntervalRef.current = setInterval(() => {
        console.log('Periodic paywall recheck');
        checkPaywall();
      }, RECHECK_INTERVAL_MS);

      return () => {
        if (recheckIntervalRef.current) {
          clearInterval(recheckIntervalRef.current);
        }
      };
    }
  }, [checkingPayment, hasAccess]);

  // Listen for payment completion events from paywall script
  useEffect(() => {
    const handlePaymentSuccess = (event: Event) => {
      console.log('Payment success event received:', event);
      storePaymentSession();
      setHasAccess(true);
      lastSuccessfulCheckRef.current = Date.now();
    };

    window.addEventListener('paywall-payment-success', handlePaymentSuccess);
    
    return () => {
      window.removeEventListener('paywall-payment-success', handlePaymentSuccess);
    };
  }, []);

  if (isInitializing || checkingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto" />
          <p className="text-cyan-300 text-xl">
            {isInitializing ? 'Initializing...' : 'Verifying access...'}
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess && isProduction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/60 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg p-8 text-center space-y-6">
          <h1 className="text-3xl font-bold text-white">Payment Required</h1>
          <p className="text-gray-300">
            Please complete payment to access the game.
          </p>
          <p className="text-sm text-gray-400">
            This page will automatically update once payment is confirmed.
          </p>
          <button
            onClick={() => {
              paywallCheckedRef.current = false;
              setCheckingPayment(true);
              checkPaywall();
            }}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Retry Payment Check
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white tracking-wider drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]">
              ASTEROIDS 3D
            </h1>
            <p className="text-cyan-300 text-xl drop-shadow-lg">
              A Modern Space Arcade Experience
            </p>
          </div>

          <div className="bg-black/60 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg p-8 space-y-6">
            <p className="text-gray-300 text-lg">
              Please log in to start your space adventure
            </p>
            <LoginButton />
          </div>

          <div className="text-gray-400 text-sm">
            Navigate your spaceship through asteroid fields and survive as long as possible!
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
        <ProfileSetup />
        <Toaster />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto" />
          <p className="text-cyan-300 text-xl">Loading profile...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentView === 'menu' && (
        <MainMenu
          onPlayGame={() => setCurrentView('game')}
          onViewLeaderboard={() => setCurrentView('leaderboard')}
        />
      )}
      {currentView === 'game' && (
        <Game
          onBackToMenu={() => setCurrentView('menu')}
          onViewLeaderboard={() => setCurrentView('leaderboard')}
        />
      )}
      {currentView === 'leaderboard' && (
        <Leaderboard
          onBackToMenu={() => setCurrentView('menu')}
          onPlayGame={() => setCurrentView('game')}
        />
      )}
      <Toaster />
    </div>
  );
}

export default App;

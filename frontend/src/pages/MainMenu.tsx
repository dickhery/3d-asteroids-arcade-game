import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Play, Rocket } from 'lucide-react';
import LoginButton from '../components/LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface MainMenuProps {
  onPlayGame: () => void;
  onViewLeaderboard: () => void;
}

export default function MainMenu({ onPlayGame, onViewLeaderboard }: MainMenuProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [backgroundError, setBackgroundError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/assets/generated/space-background.dim_1920x1080.png';
    
    img.onload = () => {
      setBackgroundLoaded(true);
      setBackgroundError(false);
    };
    
    img.onerror = () => {
      console.warn('Failed to load space background image, falling back to procedural stars');
      setBackgroundError(true);
      setBackgroundLoaded(true);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background layer */}
      {backgroundLoaded && !backgroundError ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-slow-drift"
          style={{ 
            backgroundImage: `url('/assets/generated/space-background.dim_1920x1080.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ) : (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-gray-900 via-purple-900/20 to-black">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
      )}

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Login button in top right */}
      <div className="absolute top-6 right-6 z-10">
        <LoginButton />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-12 px-4">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Rocket className="w-16 h-16 text-cyan-400 animate-pulse" />
            <h1 className="text-7xl font-bold text-white tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
              ASTEROIDS
              <span className="text-cyan-400">3D</span>
            </h1>
          </div>
          <p className="text-xl text-cyan-300 font-light tracking-wide drop-shadow-lg">
            Navigate the cosmos. Destroy asteroids. Survive.
          </p>
        </div>

        <div className="flex flex-col gap-6 items-center">
          <Button
            onClick={onPlayGame}
            disabled={!isAuthenticated}
            size="lg"
            className="w-64 h-16 text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-6 h-6 mr-2" />
            Play Game
          </Button>

          <Button
            onClick={onViewLeaderboard}
            size="lg"
            variant="outline"
            className="w-64 h-16 text-xl font-bold border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300 hover:scale-105"
          >
            <Trophy className="w-6 h-6 mr-2" />
            Leaderboard
          </Button>

          {!isAuthenticated && (
            <p className="text-yellow-400 text-sm mt-4 animate-pulse drop-shadow-lg">
              Please login to play the game
            </p>
          )}
        </div>

        <div className="text-gray-300 text-sm space-y-2 mt-12 bg-black/30 backdrop-blur-sm rounded-lg p-4 inline-block">
          <p className="font-semibold text-cyan-300">Desktop Controls:</p>
          <p>Arrow Keys - Rotate & Accelerate</p>
          <p>Space (hold) - Shoot | Space (double-tap) - Bomb</p>
          <p className="font-semibold text-cyan-300 mt-3">Mobile Controls:</p>
          <p>Tap Left/Right - Rotate | Tap Arrows - Move</p>
        </div>
      </div>

      <footer className="absolute bottom-6 text-center text-gray-400 text-sm z-10 drop-shadow-lg">
        © 2025. Built with love using{' '}
        <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
          caffeine.ai
        </a>
      </footer>

      <style>{`
        .stars, .stars2, .stars3 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .stars {
          background: transparent;
          animation: twinkle 8s ease-in-out infinite, parallaxDrift 200s linear infinite;
        }

        .stars2 {
          background: transparent;
          animation: twinkle 10s ease-in-out infinite 1s, parallaxDrift 280s linear infinite;
        }

        .stars3 {
          background: transparent;
          animation: twinkle 12s ease-in-out infinite 2s, parallaxDrift 360s linear infinite;
        }

        .stars::before,
        .stars2::before,
        .stars3::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.4), transparent),
            radial-gradient(1px 1px at 60% 70%, rgba(255, 255, 255, 0.35), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.3), transparent),
            radial-gradient(1px 1px at 80% 10%, rgba(255, 255, 255, 0.38), transparent),
            radial-gradient(1px 1px at 90% 60%, rgba(255, 255, 255, 0.32), transparent),
            radial-gradient(1px 1px at 33% 80%, rgba(255, 255, 255, 0.35), transparent),
            radial-gradient(1px 1px at 15% 90%, rgba(255, 255, 255, 0.4), transparent);
          background-size: 200% 200%;
          background-position: 0% 0%;
        }

        .stars2::before {
          background-image: 
            radial-gradient(1.5px 1.5px at 40% 20%, rgba(34, 211, 238, 0.25), transparent),
            radial-gradient(1.5px 1.5px at 70% 80%, rgba(34, 211, 238, 0.2), transparent),
            radial-gradient(1.5px 1.5px at 25% 60%, rgba(34, 211, 238, 0.22), transparent),
            radial-gradient(1.5px 1.5px at 85% 40%, rgba(34, 211, 238, 0.25), transparent);
          background-size: 250% 250%;
        }

        .stars3::before {
          background-image: 
            radial-gradient(2px 2px at 10% 40%, rgba(168, 85, 247, 0.15), transparent),
            radial-gradient(2px 2px at 55% 15%, rgba(168, 85, 247, 0.18), transparent),
            radial-gradient(2px 2px at 75% 75%, rgba(168, 85, 247, 0.12), transparent),
            radial-gradient(2px 2px at 30% 95%, rgba(168, 85, 247, 0.15), transparent);
          background-size: 300% 300%;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }

        @keyframes parallaxDrift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-15px, -25px); }
        }

        @keyframes slow-drift {
          0% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-20px, -20px) scale(1.15); }
          100% { transform: translate(0, 0) scale(1.1); }
        }

        .animate-slow-drift {
          animation: slow-drift 60s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

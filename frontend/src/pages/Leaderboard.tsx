import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock, Award, ArrowLeft, Play } from 'lucide-react';
import { useGetTopScores, useGetLeaderboardStats } from '../hooks/useQueries';

interface LeaderboardProps {
  onBackToMenu: () => void;
  onPlayGame: () => void;
}

export default function Leaderboard({ onBackToMenu, onPlayGame }: LeaderboardProps) {
  const { data: topScores, isLoading: scoresLoading } = useGetTopScores();
  const { data: stats, isLoading: statsLoading } = useGetLeaderboardStats();
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

  const formatTime = (ms: bigint) => {
    const seconds = Number(ms) / 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString();
  };

  const handleBackToMenu = () => {
    onBackToMenu();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4">
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

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          onClick={handleBackToMenu}
          variant="outline"
          size="lg"
          className="border-2 border-cyan-500 bg-black/70 text-cyan-300 hover:bg-cyan-500/30 hover:text-white hover:border-cyan-400 transition-all duration-200 cursor-pointer shadow-lg shadow-cyan-500/30 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Menu
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-white tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
            <Trophy className="inline w-12 h-12 text-yellow-400 mr-4" />
            LEADERBOARD
          </h1>
          <p className="text-cyan-300 text-lg drop-shadow-lg">Top Pilots of the Galaxy</p>
        </div>

        {/* Statistics Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-black/60 backdrop-blur-sm border-cyan-500/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Top Player
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{stats.topPlayer}</p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-sm border-purple-500/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-300 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Longest Survivor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{stats.longestSurvivor}</p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-sm border-yellow-500/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-300 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Most Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{stats.mostWinsPlayer}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Scores Table */}
        <Card className="bg-black/60 backdrop-blur-sm border-cyan-500/50">
          <CardHeader>
            <CardTitle className="text-cyan-300 text-xl">Top 10 High Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {scoresLoading ? (
              <div className="text-center text-gray-400 py-8">Loading scores...</div>
            ) : topScores && topScores.length > 0 ? (
              <div className="space-y-2">
                {topScores.map((score, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      index === 0
                        ? 'bg-yellow-500/20 border border-yellow-500/50'
                        : index === 1
                        ? 'bg-gray-400/20 border border-gray-400/50'
                        : index === 2
                        ? 'bg-orange-500/20 border border-orange-500/50'
                        : 'bg-gray-800/40 hover:bg-gray-700/40'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span
                        className={`text-2xl font-bold w-8 ${
                          index === 0
                            ? 'text-yellow-400'
                            : index === 1
                            ? 'text-gray-300'
                            : index === 2
                            ? 'text-orange-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-lg">{score.username}</p>
                        <p className="text-gray-400 text-sm">{formatDate(score.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-300 font-bold text-xl">{Number(score.score).toLocaleString()}</p>
                      <p className="text-purple-300 text-sm flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {formatTime(score.survivalTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No scores yet. Be the first to play!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={onPlayGame}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/50"
          >
            <Play className="w-5 h-5 mr-2" />
            Play Now
          </Button>
        </div>
      </div>

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

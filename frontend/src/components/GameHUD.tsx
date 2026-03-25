import { Heart, Target, Clock, Bomb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GameHUDProps {
  lives: number;
  score: number;
  survivalTime: number;
  isPaused: boolean;
  bombAvailable: boolean;
  bombCooldownPercent: number;
}

export default function GameHUD({ 
  lives, 
  score, 
  survivalTime, 
  isPaused,
  bombAvailable,
  bombCooldownPercent,
}: GameHUDProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 p-6 z-10 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-start">
        {/* Lives */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-6 py-3 border border-red-500/30">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-white font-bold text-xl">Lives:</span>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-6 py-3 border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            <span className="text-white font-bold text-xl">Score:</span>
            <span className="text-cyan-400 font-bold text-2xl">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* Time */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-6 py-3 border border-purple-500/30">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-400" />
            <span className="text-white font-bold text-xl">Time:</span>
            <span className="text-purple-400 font-bold text-2xl">{formatTime(survivalTime)}</span>
          </div>
        </div>
      </div>

      {/* Bomb Status Indicator */}
      <div className="mt-4 flex justify-center">
        <div className={`bg-black/60 backdrop-blur-sm rounded-lg px-6 py-3 border ${
          bombAvailable ? 'border-orange-500/50' : 'border-gray-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <Bomb className={`w-7 h-7 ${
              bombAvailable ? 'text-orange-400 animate-pulse' : 'text-gray-500'
            }`} />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">Bomb:</span>
                <span className={`font-bold text-lg ${
                  bombAvailable ? 'text-orange-400' : 'text-gray-400'
                }`}>
                  {bombAvailable ? 'READY' : 'COOLING DOWN'}
                </span>
              </div>
              {!bombAvailable && (
                <div className="w-32">
                  <Progress value={bombCooldownPercent} className="h-2" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="mt-4 text-center">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block border border-gray-500/30">
          <p className="text-gray-300 text-sm font-medium">
            <span className="text-cyan-400">←→</span> Rotate | 
            <span className="text-cyan-400"> ↑</span> Accelerate | 
            <span className="text-cyan-400"> ↓</span> Reverse | 
            <span className="text-cyan-400"> SPACE</span> Shoot | 
            <span className="text-orange-400"> Double-tap SPACE</span> Bomb | 
            <span className="text-cyan-400"> ESC</span> Pause
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Mobile: Tap left/right sides to rotate | Double-tap screen for bomb
          </p>
        </div>
      </div>
    </div>
  );
}

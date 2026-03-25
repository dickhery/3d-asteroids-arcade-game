import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import GameScene from '../components/GameScene';
import GameHUD from '../components/GameHUD';
import GameOverDialog from '../components/GameOverDialog';
import { Loader2 } from 'lucide-react';
import { useSubmitGameResults } from '../hooks/useQueries';
import { toast } from 'sonner';

interface GameProps {
  onBackToMenu: () => void;
  onViewLeaderboard: () => void;
}

export default function Game({ onBackToMenu, onViewLeaderboard }: GameProps) {
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bombAvailable, setBombAvailable] = useState(true);
  const [bombCooldownPercent, setBombCooldownPercent] = useState(100);
  const [resultsSubmitted, setResultsSubmitted] = useState(false);
  const [submissionAttempts, setSubmissionAttempts] = useState(0);

  const submitGameResults = useSubmitGameResults();

  useEffect(() => {
    // Simulate asset loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Submit game results when game is over
  useEffect(() => {
    if (isGameOver && !resultsSubmitted && score > 0 && submissionAttempts === 0) {
      setSubmissionAttempts(1);
      
      submitGameResults.mutate(
        { score, survivalTime },
        {
          onSuccess: () => {
            setResultsSubmitted(true);
            toast.success('Score submitted to leaderboard!');
          },
          onError: (error: any) => {
            console.error('Failed to submit game results:', error);
            const errorMessage = error?.message || 'Failed to submit score';
            toast.error(errorMessage);
            
            // Allow manual retry by resetting submission attempts after a delay
            setTimeout(() => {
              setSubmissionAttempts(0);
            }, 3000);
          },
        }
      );
    }
  }, [isGameOver, resultsSubmitted, score, survivalTime, submissionAttempts, submitGameResults]);

  const handleLoseLife = () => {
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setIsGameOver(true);
    }
  };

  const handleScoreUpdate = (points: number) => {
    setScore((prev) => prev + points);
  };

  const handleSurvivalUpdate = (time: number) => {
    setSurvivalTime(time);
  };

  const handlePauseToggle = (paused: boolean) => {
    setIsPaused(paused);
  };

  const handleBombStatusChange = (available: boolean, cooldownPercent: number) => {
    setBombAvailable(available);
    setBombCooldownPercent(cooldownPercent);
  };

  const handlePlayAgain = () => {
    setLives(3);
    setScore(0);
    setSurvivalTime(0);
    setIsGameOver(false);
    setIsPaused(false);
    setBombAvailable(true);
    setBombCooldownPercent(100);
    setResultsSubmitted(false);
    setSubmissionAttempts(0);
  };

  const handleRetrySubmission = () => {
    if (!resultsSubmitted && score > 0) {
      setSubmissionAttempts(0);
      // Trigger re-submission by updating attempts
      setTimeout(() => {
        setSubmissionAttempts(1);
        submitGameResults.mutate(
          { score, survivalTime },
          {
            onSuccess: () => {
              setResultsSubmitted(true);
              toast.success('Score submitted to leaderboard!');
            },
            onError: (error: any) => {
              console.error('Failed to submit game results:', error);
              const errorMessage = error?.message || 'Failed to submit score';
              toast.error(errorMessage);
              setSubmissionAttempts(0);
            },
          }
        );
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto" />
          <p className="text-cyan-300 text-xl">Loading game assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        camera={{ position: [0, 70, 0], fov: 75 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#000000']} />
        <GameScene
          lives={lives}
          onLoseLife={handleLoseLife}
          onScoreUpdate={handleScoreUpdate}
          onSurvivalUpdate={handleSurvivalUpdate}
          isGameOver={isGameOver}
          isPaused={isPaused}
          onPauseToggle={handlePauseToggle}
          onBombStatusChange={handleBombStatusChange}
        />
      </Canvas>

      <GameHUD
        lives={lives}
        score={score}
        survivalTime={survivalTime}
        isPaused={isPaused}
        bombAvailable={bombAvailable}
        bombCooldownPercent={bombCooldownPercent}
      />

      <GameOverDialog
        isOpen={isGameOver}
        score={score}
        survivalTime={survivalTime}
        isSubmitting={submitGameResults.isPending}
        submissionFailed={submitGameResults.isError && !resultsSubmitted}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={onBackToMenu}
        onViewLeaderboard={onViewLeaderboard}
        onRetrySubmission={handleRetrySubmission}
      />

      {isPaused && !isGameOver && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">PAUSED</h2>
            <p className="text-cyan-300">Press ESC to resume</p>
          </div>
        </div>
      )}
    </div>
  );
}

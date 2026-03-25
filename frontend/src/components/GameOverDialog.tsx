import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Play, Home, Clock, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  survivalTime: number;
  isSubmitting?: boolean;
  submissionFailed?: boolean;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onBackToMenu: () => void;
  onRetrySubmission?: () => void;
}

export default function GameOverDialog({
  isOpen,
  score,
  survivalTime,
  isSubmitting = false,
  submissionFailed = false,
  onPlayAgain,
  onViewLeaderboard,
  onBackToMenu,
  onRetrySubmission,
}: GameOverDialogProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-purple-900 border-2 border-cyan-500/50">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Game Over
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300 text-lg mt-2">
            Your mission has ended
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <div className="bg-black/40 rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-semibold">Final Score:</span>
              <span className="text-cyan-400 font-bold text-2xl">{score.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 font-semibold">Survival Time:</span>
              </div>
              <span className="text-purple-400 font-bold text-xl">{formatTime(survivalTime)}</span>
            </div>
          </div>

          {isSubmitting && (
            <div className="bg-black/40 rounded-lg p-3 border border-yellow-500/30">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Submitting score to leaderboard...</span>
              </div>
            </div>
          )}

          {submissionFailed && onRetrySubmission && (
            <div className="bg-black/40 rounded-lg p-3 border border-red-500/30">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Failed to submit score</span>
                </div>
                <Button
                  onClick={onRetrySubmission}
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-300 hover:bg-red-500/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Submission
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onPlayAgain}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
          >
            <Play className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          <Button 
            onClick={onViewLeaderboard} 
            disabled={isSubmitting}
            variant="outline" 
            className="w-full border-yellow-500 text-yellow-300 hover:bg-yellow-500/20 disabled:opacity-50"
          >
            <Trophy className="w-5 h-5 mr-2" />
            View Leaderboard
          </Button>
          <Button 
            onClick={onBackToMenu} 
            disabled={isSubmitting}
            variant="ghost" 
            className="w-full text-gray-400 hover:text-white disabled:opacity-50"
          >
            <Home className="w-5 h-5 mr-2" />
            Main Menu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

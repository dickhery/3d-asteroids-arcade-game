import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRegisterUsername, useValidateUsername } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Rocket } from 'lucide-react';

export default function ProfileSetup() {
  const [username, setUsername] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const registerUsername = useRegisterUsername();
  const validateUsername = useValidateUsername();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      toast.error('Username must be less than 20 characters');
      return;
    }

    try {
      setIsValidating(true);
      const isValid = await validateUsername.mutateAsync(username.trim());

      if (!isValid) {
        toast.error('Username is already taken');
        return;
      }

      await registerUsername.mutateAsync(username.trim());
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Failed to create profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-gray-900/80 backdrop-blur-sm border-cyan-500/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Rocket className="w-16 h-16 text-cyan-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Welcome, Pilot!</CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            Choose your callsign to begin your mission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white font-semibold">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-cyan-500/30 text-white placeholder:text-gray-500"
                maxLength={20}
                autoFocus
              />
              <p className="text-sm text-gray-400">3-20 characters</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold"
              disabled={registerUsername.isPending || isValidating}
            >
              {registerUsername.isPending || isValidating ? 'Creating Profile...' : 'Start Mission'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <style>{`
        .stars {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: block;
          background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><circle cx="1" cy="1" r="1" fill="white"/></svg>') repeat;
          animation: animateStars 50s linear infinite;
        }

        @keyframes animateStars {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
      `}</style>
    </div>
  );
}

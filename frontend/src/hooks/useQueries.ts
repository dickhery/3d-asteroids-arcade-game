import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, T__1, LeaderboardStats } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRegisterUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUsername(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useValidateUsername() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.validateUsername(username);
    },
  });
}

export function useSubmitGameResults() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ score, survivalTime }: { score: number; survivalTime: number }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Validate inputs
      if (score < 0 || survivalTime < 0) {
        throw new Error('Invalid score or survival time');
      }

      try {
        // Call the backend update method with proper BigInt conversion
        await actor.submitGameResults(BigInt(Math.floor(score)), BigInt(Math.floor(survivalTime)));
      } catch (error: any) {
        // Log the error for debugging
        console.error('Submit game results error:', error);
        
        // Check for specific error types
        if (error.message?.includes('net::ERR_FAILED') || 
            error.message?.includes('network') ||
            error.message?.includes('fetch')) {
          throw new Error('Network error: Please check your connection and try again');
        }
        
        if (error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
          throw new Error('Backend resource error: Please try again in a moment');
        }
        
        // Re-throw the error to be handled by the mutation
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Retry once for network errors or transient backend errors
      if (failureCount < 1) {
        const errorMessage = error?.message || '';
        return (
          errorMessage.includes('Network error') ||
          errorMessage.includes('network') ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('ERR_INSUFFICIENT_RESOURCES')
        );
      }
      return false;
    },
    retryDelay: 2000, // Wait 2 seconds before retrying
    onSuccess: () => {
      // Invalidate queries to refresh leaderboard and profile data
      queryClient.invalidateQueries({ queryKey: ['topScores'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetTopScores() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<T__1[]>({
    queryKey: ['topScores'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTopScores();
      } catch (error) {
        console.log('No scores yet');
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetLeaderboardStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LeaderboardStats | null>({
    queryKey: ['leaderboardStats'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getLeaderboardStats();
      } catch (error) {
        console.log('No stats yet');
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

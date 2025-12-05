import { useState, useEffect } from 'react';
import { apolloClient } from '@/lib/apollo-client';
import { GET_ALL_USERS } from '@/graphql/queries';
import { useSequence } from '@/contexts/SequenceContext';
import { profileService } from '@/services/profileService';

interface SuggestedUser {
  id: string;
  username: string;
  displayName: string;
  avatarHash?: string;
  isVerified: boolean;
  isArtist: boolean;
}

export const useSuggestedUsers = (limit: number = 3) => {
  const { smartAccountAddress } = useSequence();
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedUsers, setDismissedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!smartAccountAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch users from subgraph
        const result = await apolloClient.query({
          query: GET_ALL_USERS,
          variables: {
            first: 50, // Fetch more to filter out current user and dismissed
            skip: 0,
            orderBy: 'createdAt',
            orderDirection: 'desc'
          },
          fetchPolicy: 'network-only'
        });

        if ((result.data as any)?.userProfiles) {
          console.log('👥 [SUGGESTED_USERS] Raw data from GraphQL:', (result.data as any).userProfiles.slice(0, 2));
          
          // Filter out current user and dismissed users
          const graphqlUsers = (result.data as any).userProfiles
            .filter((user: any) => 
              user.username && 
              user.id.toLowerCase() !== smartAccountAddress.toLowerCase() &&
              !dismissedUsers.has(user.id)
            )
            // Sort: verified > artist > recent
            .sort((a: any, b: any) => {
              if (a.isVerified && !b.isVerified) return -1;
              if (!a.isVerified && b.isVerified) return 1;
              if (a.isArtist && !b.isArtist) return -1;
              if (!a.isArtist && b.isArtist) return 1;
              return 0;
            })
            .slice(0, limit);

          // ✅ Enrich with profile data from smart contract (for avatarHash)
          const enrichedUsers = await Promise.all(
            graphqlUsers.map(async (user: any) => {
              try {
                // Get full profile from smart contract
                const profile = await profileService.getProfile(user.id);
                
                return {
                  id: user.id,
                  username: user.username,
                  displayName: user.displayName || user.username,
                  avatarHash: profile?.avatarHash || user.avatarHash, // Use smart contract data first
                  isVerified: user.isVerified || false,
                  isArtist: user.isArtist || false
                };
              } catch (error) {
                console.warn('Failed to enrich profile for', user.username, error);
                // Fallback to GraphQL data
                return {
                  id: user.id,
                  username: user.username,
                  displayName: user.displayName || user.username,
                  avatarHash: user.avatarHash,
                  isVerified: user.isVerified || false,
                  isArtist: user.isArtist || false
                };
              }
            })
          );

          setUsers(enrichedUsers);
          
          // Debug: Log first user's avatar info
          if (enrichedUsers.length > 0) {
            console.log('👥 [SUGGESTED_USERS] Enriched user:', {
              username: enrichedUsers[0].username,
              avatarHash: enrichedUsers[0].avatarHash,
              hasAvatar: !!enrichedUsers[0].avatarHash,
              avatarUrl: enrichedUsers[0].avatarHash ? `https://ipfs.io/ipfs/${enrichedUsers[0].avatarHash}` : 'none'
            });
          }
        } else {
          setUsers([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch suggested users:', err);
        setError(err.message || 'Failed to load suggested users');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [smartAccountAddress, limit, dismissedUsers]);

  const dismissUser = (userId: string) => {
    setDismissedUsers(prev => new Set([...prev, userId]));
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const refresh = () => {
    setDismissedUsers(new Set());
  };

  return {
    users,
    isLoading,
    error,
    dismissUser,
    refresh
  };
};

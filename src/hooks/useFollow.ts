import { useState } from 'react';
import { useSequence } from '@/contexts/SequenceContext';
import { useWalletClient } from 'wagmi';
import { somniaDatastreamServiceV3 } from '@/services/somniaDatastreamService.v3';
import { toast } from 'sonner';

export const useFollow = () => {
  const { smartAccountAddress } = useSequence();
  const { data: walletClient } = useWalletClient();
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());

  const followUser = async (targetAddress: string, targetUsername?: string) => {
    if (!smartAccountAddress || !walletClient) {
      toast.error('Please connect your wallet');
      return false;
    }

    if (smartAccountAddress.toLowerCase() === targetAddress.toLowerCase()) {
      toast.error("You can't follow yourself");
      return false;
    }

    // Add to loading state
    setLoadingUsers(prev => new Set([...prev, targetAddress]));

    try {
      // Call DataStream service to follow
      await somniaDatastreamServiceV3.followUser(
        smartAccountAddress,
        targetAddress,
        walletClient
      );

      // Update local state
      setFollowingUsers(prev => new Set([...prev, targetAddress]));

      toast.success(
        targetUsername 
          ? `You are now following @${targetUsername}` 
          : 'Successfully followed user'
      );

      // Emit event for UI updates
      window.dispatchEvent(new CustomEvent('followChanged', {
        detail: { follower: smartAccountAddress, followed: targetAddress, action: 'follow' }
      }));

      return true;
    } catch (error: any) {
      console.error('Failed to follow user:', error);
      toast.error(error.message || 'Failed to follow user');
      return false;
    } finally {
      // Remove from loading state
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetAddress);
        return newSet;
      });
    }
  };

  const unfollowUser = async (targetAddress: string, targetUsername?: string) => {
    if (!smartAccountAddress || !walletClient) {
      toast.error('Please connect your wallet');
      return false;
    }

    // Add to loading state
    setLoadingUsers(prev => new Set([...prev, targetAddress]));

    try {
      // Call DataStream service to unfollow
      await somniaDatastreamServiceV3.unfollowUser(
        smartAccountAddress,
        targetAddress,
        walletClient
      );

      // Update local state
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetAddress);
        return newSet;
      });

      toast.success(
        targetUsername 
          ? `You unfollowed @${targetUsername}` 
          : 'Successfully unfollowed user'
      );

      // Emit event for UI updates
      window.dispatchEvent(new CustomEvent('followChanged', {
        detail: { follower: smartAccountAddress, followed: targetAddress, action: 'unfollow' }
      }));

      return true;
    } catch (error: any) {
      console.error('Failed to unfollow user:', error);
      toast.error(error.message || 'Failed to unfollow user');
      return false;
    } finally {
      // Remove from loading state
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetAddress);
        return newSet;
      });
    }
  };

  const toggleFollow = async (targetAddress: string, targetUsername?: string) => {
    const isFollowing = followingUsers.has(targetAddress);
    
    if (isFollowing) {
      return await unfollowUser(targetAddress, targetUsername);
    } else {
      return await followUser(targetAddress, targetUsername);
    }
  };

  const isFollowing = (targetAddress: string) => {
    return followingUsers.has(targetAddress);
  };

  const isLoading = (targetAddress: string) => {
    return loadingUsers.has(targetAddress);
  };

  return {
    followUser,
    unfollowUser,
    toggleFollow,
    isFollowing,
    isLoading
  };
};

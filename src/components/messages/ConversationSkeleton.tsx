// Skeleton loader for conversation list
import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ConversationSkeleton = memo(() => (
  <div className="flex items-center gap-3 px-4 py-3">
    <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-3 w-48" />
    </div>
  </div>
));

ConversationSkeleton.displayName = 'ConversationSkeleton';

export const ConversationListSkeleton = memo(() => (
  <div className="space-y-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <ConversationSkeleton key={i} />
    ))}
  </div>
));

ConversationListSkeleton.displayName = 'ConversationListSkeleton';

// Skeleton loader for messages
import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageSkeletonProps {
  isOwn?: boolean;
}

export const MessageSkeleton = memo(({ isOwn = false }: MessageSkeletonProps) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
    <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
      <div className="space-y-1">
        <Skeleton className={`h-16 w-64 ${isOwn ? 'rounded-l-2xl rounded-tr-2xl' : 'rounded-r-2xl rounded-tl-2xl'}`} />
      </div>
    </div>
  </div>
));

MessageSkeleton.displayName = 'MessageSkeleton';

export const MessageListSkeleton = memo(() => (
  <div className="space-y-3 p-6">
    <MessageSkeleton isOwn={false} />
    <MessageSkeleton isOwn={true} />
    <MessageSkeleton isOwn={false} />
    <MessageSkeleton isOwn={true} />
    <MessageSkeleton isOwn={false} />
  </div>
));

MessageListSkeleton.displayName = 'MessageListSkeleton';

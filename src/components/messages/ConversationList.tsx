/**
 * Conversation List Component - Optimized
 */

import { useState, useMemo, useCallback } from 'react'
import { SDK } from '@somnia-chain/streams'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MessageSquare } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchUserConversationsV2 } from '@/services/messagingServiceV2'
import NewConversationDialog from '@/components/messages/NewConversationDialog'
import { generateConversationId } from '@/lib/conversationUtils'
import { useUserProfile } from '@/hooks/useRegisteredUsers'
import { getAvatarUrl } from '@/lib/avatarUtils'
import { ConversationListSkeleton } from '@/components/messages/ConversationSkeleton'
import { useAdaptivePolling } from '@/hooks/useAdaptivePolling'
import { messageCacheManager } from '@/hooks/useMessageCache'

interface Conversation {
  id: string
  name: string
  address: string
  avatarHash?: string
  lastMessage: string
  lastMessageTime: number
  unreadCount: number
  isOnline: boolean
  isEncrypted: boolean
}

interface ConversationListProps {
  sdk: SDK | null
  currentUserAddress: string
  selectedConversation: string | null
  onSelectConversation: (id: string, recipientAddress: string) => void
  type: 'direct' | 'groups'
}

export default function ConversationList({
  sdk,
  currentUserAddress,
  selectedConversation,
  onSelectConversation,
  type
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true) // Only show spinner on first load

  // ⚡ Optimized: Load conversations with caching and adaptive polling
  const loadConversations = useCallback(async () => {
    if (!sdk || !currentUserAddress) return;

    try {
      // Check cache first
      const cacheKey = `conversations-${currentUserAddress}`;
      const cached = messageCacheManager.get<Conversation[]>(cacheKey);
      
      if (cached && !initialLoading) {
        // Use cached data for instant display
        setConversations(cached);
      } else {
        setInitialLoading(true);
      }
      
      // Fetch fresh data from blockchain
      const convs = await fetchUserConversationsV2(sdk, currentUserAddress as `0x${string}`);
      
      // Convert to UI format
      const uiConversations: Conversation[] = convs.map(conv => ({
        id: conv.conversationId,
        name: conv.otherParticipant.substring(0, 10) + '...', // Will be updated by profile
        address: conv.otherParticipant,
        lastMessage: conv.lastMessage || 'No messages yet',
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount,
        isOnline: false, // Will be updated by presence
        isEncrypted: false // V2 is not encrypted
      }));
      
      // Update cache
      messageCacheManager.set(cacheKey, uiConversations);
      setConversations(uiConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setInitialLoading(false);
    }
  }, [sdk, currentUserAddress, initialLoading]);

  // ⚡ Use adaptive polling (3s active, 10s inactive)
  useAdaptivePolling({
    activeInterval: 3000,
    inactiveInterval: 10000,
    onPoll: loadConversations,
    enabled: !!sdk && !!currentUserAddress
  });

  const handleNewConversation = useCallback((recipientAddress: string, recipientName: string, avatarHash?: string) => {
    console.log('🆕 [CONVERSATION LIST] Creating new conversation')
    console.log('   Recipient:', recipientAddress)
    console.log('   Name:', recipientName)
    
    // Create conversation ID using helper function
    const conversationId = generateConversationId(currentUserAddress, recipientAddress)
    
    console.log('   Conversation ID:', conversationId)
    
    // Add to conversations if not exists
    const exists = conversations.find(c => c.address.toLowerCase() === recipientAddress.toLowerCase())
    if (!exists) {
      const newConv: Conversation = {
        id: conversationId,
        name: recipientName,
        address: recipientAddress,
        avatarHash,
        lastMessage: 'Start chatting...',
        lastMessageTime: Date.now(),
        unreadCount: 0,
        isOnline: false,
        isEncrypted: true
      }
      console.log('   Adding new conversation to list')
      setConversations(prev => [newConv, ...prev])
    } else {
      console.log('   Conversation already exists, selecting it')
    }
    
    // Select the conversation and open chat
    console.log('   Opening chat window...')
    onSelectConversation(conversationId, recipientAddress)
    setShowNewDialog(false)
  }, [conversations, currentUserAddress, onSelectConversation]);

  // ⚡ Memoize filtered conversations
  const filteredConversations = useMemo(() => 
    conversations.filter(conv =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.address.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [conversations, searchQuery]
  );

  // ⚡ Memoize formatTime to prevent re-creating function on every render
  const formatTime = useCallback((timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }, [])

  return (
    <>
      {/* Search */}
      <div className="relative mb-3 md:mb-4 px-4 md:px-0">
        <Search className="absolute left-7 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 md:h-10 bg-muted/50 border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>

      {/* New Conversation Button - Hidden, use dialog trigger in header if needed */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="bg-[#1a1625] border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-[20px] font-semibold">
              New Message
            </DialogTitle>
          </DialogHeader>
          <NewConversationDialog
            sdk={sdk}
            currentUserAddress={currentUserAddress}
            type={type}
            onClose={() => setShowNewDialog(false)}
            onCreateConversation={handleNewConversation}
          />
        </DialogContent>
      </Dialog>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {initialLoading ? (
          <ConversationListSkeleton />
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 md:p-8 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xs md:text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Start a new conversation to begin messaging
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedConversation === conv.id}
              onSelect={() => onSelectConversation(conv.id, conv.address)}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </>
  )
}

/**
 * Conversation Item Component with Profile Loading
 */
function ConversationItem({ 
  conversation, 
  isSelected, 
  onSelect, 
  formatTime 
}: { 
  conversation: Conversation
  isSelected: boolean
  onSelect: () => void
  formatTime: (timestamp: number) => string
}) {
  const { profile, loading } = useUserProfile(conversation.address as `0x${string}`);

  const displayName = loading 
    ? conversation.name 
    : (profile?.displayName || conversation.address.substring(0, 10) + '...');

  return (
    <button
      onClick={onSelect}
      className={`w-full px-4 py-3 md:py-3 flex items-center gap-3 hover:bg-muted/50 active:bg-muted/70 transition-all relative border-l-0 md:border-l-2 ${
        isSelected ? 'bg-primary/5 md:border-l-primary' : 'md:border-l-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-12 h-12 md:w-11 md:h-11">
          <AvatarImage 
            src={getAvatarUrl(profile?.avatarHash)}
            alt={displayName}
          />
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
            {displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {profile?.isOnline && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm md:text-sm truncate text-foreground">
            {displayName}
          </h3>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {formatTime(conversation.lastMessageTime)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs md:text-xs text-muted-foreground truncate leading-tight">
            {conversation.lastMessage}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-2 min-w-[18px] h-[18px] px-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Image,
  Video,
  Smile,
  AtSign,
  Music,
  X,
  Repeat2,
  Loader2
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import EmojiPicker from 'emoji-picker-react';
import { useState, useRef, useMemo, useEffect } from "react";
import { useOwnedNFTs } from "@/hooks/useOwnedNFTs";
import { useSomniaDatastream } from "@/contexts/SomniaDatastreamContext";
import { CONTRACT_ADDRESSES } from "@/lib/web3-config";
import { ipfsService } from "@/services/ipfsService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuotePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quoteText: string, attachments: any[]) => Promise<void>;
  quotedPost: {
    id: number | string;
    author: string;
    content: string;
    timestamp: number;
    authorProfile?: {
      username: string;
      displayName: string;
      avatarHash?: string;
      isVerified?: boolean;
    };
  };
  currentUserProfile?: any;
}

const QuotePostModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  quotedPost,
  currentUserProfile 
}: QuotePostModalProps) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [musicType, setMusicType] = useState<'single' | 'playlist' | 'album'>('single');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { ownedNFTs, isLoading: isLoadingNFTs } = useOwnedNFTs();
  const { readAllUserProfiles, isConnected } = useSomniaDatastream();

  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Fetch users for mention
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch from Subgraph
        let subgraphUsers: any[] = [];
        try {
          const { apolloClient } = await import('@/lib/apollo-client');
          const { GET_ALL_USERS } = await import('@/graphql/queries');

          const result = await apolloClient.query({
            query: GET_ALL_USERS,
            variables: {
              first: 100,
              skip: 0,
              orderBy: 'followerCount',
              orderDirection: 'desc'
            },
            fetchPolicy: 'network-only'
          });

          if ((result.data as any)?.userProfiles) {
            subgraphUsers = (result.data as any).userProfiles
              .filter((p: any) => p.username)
              .map((p: any) => ({
                username: p.username,
                displayName: p.displayName || p.username,
                avatar: p.avatarHash || '',
                isArtist: p.isArtist || false,
                isVerified: p.isVerified || false,
                userAddress: p.id,
                followerCount: p.followerCount || 0
              }));
          }
        } catch (error) {
          console.warn('⚠️ Subgraph fetch failed:', error);
        }

        // Fetch from DataStream
        let datastreamUsers: any[] = [];
        if (isConnected) {
          try {
            const profiles = await readAllUserProfiles();
            if (profiles) {
              datastreamUsers = profiles
                .filter((p: any) => p.username)
                .map((p: any) => ({
                  username: p.username,
                  displayName: p.displayName || p.username,
                  avatar: p.avatarHash || p.avatar || '',
                  isArtist: p.isArtist || false,
                  isVerified: p.isVerified || false,
                  userAddress: p.userAddress
                }));
            }
          } catch (error) {
            console.warn('⚠️ DataStream fetch failed:', error);
          }
        }

        // Merge users
        const userMap = new Map<string, any>();
        subgraphUsers.forEach(user => userMap.set(user.username.toLowerCase(), user));
        datastreamUsers.forEach(user => {
          const key = user.username.toLowerCase();
          if (!userMap.has(key)) userMap.set(key, user);
        });

        const mergedUsers = Array.from(userMap.values())
          .sort((a, b) => {
            if (a.isVerified && !b.isVerified) return -1;
            if (!a.isVerified && b.isVerified) return 1;
            if (a.isArtist && !b.isArtist) return -1;
            if (!a.isArtist && b.isArtist) return 1;
            if (a.followerCount && b.followerCount) return b.followerCount - a.followerCount;
            return a.username.localeCompare(b.username);
          })
          .slice(0, 100);

        setAllUsers(mergedUsers);
      } catch (error) {
        console.error('❌ Failed to fetch users:', error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, isConnected, readAllUserProfiles]);

  // Filter users based on mention search
  const filteredUsers = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];

    if (!mentionSearch) {
      const artists = allUsers.filter(u => u.isArtist).slice(0, 3);
      const others = allUsers.filter(u => !u.isArtist).slice(0, 2);
      return [...artists, ...others];
    }

    return allUsers
      .filter(user => 
        user.username.toLowerCase().includes(mentionSearch.toLowerCase()) ||
        user.displayName.toLowerCase().includes(mentionSearch.toLowerCase())
      )
      .sort((a, b) => {
        const aExact = a.username.toLowerCase() === mentionSearch.toLowerCase();
        const bExact = b.username.toLowerCase() === mentionSearch.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        if (a.isArtist && !b.isArtist) return -1;
        if (!a.isArtist && b.isArtist) return 1;
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        return 0;
      })
      .slice(0, 5);
  }, [allUsers, mentionSearch]);

  const getIPFSUrl = (hash: string) => {
    if (!hash) return '';
    if (hash.startsWith('http')) return hash;
    const cleanHash = hash.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${cleanHash}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const compressImage = async (file: File, maxWidthOrHeight: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidthOrHeight) {
              height = Math.round((height * maxWidthOrHeight) / width);
              width = maxWidthOrHeight;
            }
          } else {
            if (height > maxWidthOrHeight) {
              width = Math.round((width * maxWidthOrHeight) / height);
              height = maxWidthOrHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error('Please upload only images or videos');
        continue;
      }

      let processedFile = file;

      if (isImage) {
        try {
          toast.loading('Compressing image...', { id: 'compress' });
          const { compressPostImage } = await import('@/utils/imageCompression');
          processedFile = await compressPostImage(file);
          toast.dismiss('compress');
          toast.success(`Compressed: ${(file.size / 1024).toFixed(0)}KB → ${(processedFile.size / 1024).toFixed(0)}KB`);
        } catch (error) {
          toast.dismiss('compress');
          processedFile = file;
        }
      }

      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (processedFile.size > maxSize) {
        toast.error(`${isVideo ? 'Video' : 'Image'} must be less than ${isVideo ? '50MB' : '5MB'}`);
        continue;
      }

      // ⚡ INSTANT UPLOAD: Upload to IPFS immediately when file is selected
      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const previewUrl = e.target?.result as string;
        if (!previewUrl) return;

        // Add to attachments with preview URL and uploading state
        const tempAttachment = {
          type: isVideo ? 'video' : 'image',
          url: previewUrl,
          file: processedFile,
          name: processedFile.name,
          uploading: true,
          uploadProgress: 0,
          uploadId,
          ipfsHash: undefined
        };

        setAttachments(prev => [...prev, tempAttachment]);
        console.log(`📷 [Quote] Added ${isVideo ? 'video' : 'image'}, starting IPFS upload...`);

        // ⚡ Upload to IPFS in background
        try {
          const ipfsResult = await ipfsService.uploadFile(processedFile);
          
          const hash = typeof ipfsResult === 'string' 
            ? ipfsResult 
            : (ipfsResult.IpfsHash || ipfsResult.ipfsHash);

          if (!hash) {
            throw new Error('No IPFS hash returned');
          }

          console.log(`✅ [Quote] ${isVideo ? 'Video' : 'Image'} uploaded to IPFS:`, hash);

          // Update attachment with IPFS hash
          setAttachments(prev => prev.map(att => 
            att.uploadId === uploadId
              ? {
                  ...att,
                  ipfsHash: hash,
                  url: `https://ipfs.io/ipfs/${hash}`,
                  uploading: false,
                  uploadProgress: 100
                }
              : att
          ));

        } catch (error) {
          console.error(`❌ [Quote] Failed to upload ${isVideo ? 'video' : 'image'} to IPFS:`, error);
          
          // Mark as failed
          setAttachments(prev => prev.map(att => 
            att.uploadId === uploadId
              ? { ...att, uploading: false, uploadFailed: true }
              : att
          ));
          
          toast.error(`Failed to upload ${isVideo ? 'video' : 'image'}`);
        }
      };
      
      reader.onerror = (error) => {
        console.error('❌ Error reading file:', error);
        toast.error('Failed to load file');
      };
      
      reader.readAsDataURL(processedFile);
    }

    event.target.value = '';
  };

  const handleEmojiClick = (emojiData: any) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const emoji = emojiData.emoji;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      setShowEmojiPicker(false);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
  };

  const handleMention = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart || content.length;
      const newContent = content.substring(0, start) + "@" + content.substring(start);
      setContent(newContent);
      setShowMentionSuggestions(true);
      setMentionSearch('');
      setMentionPosition(start + 1);
      setSelectedMentionIndex(0);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = newContent.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
          setShowMentionSuggestions(true);
          setMentionSearch(textAfterAt);
          setMentionPosition(lastAtIndex);
          setSelectedMentionIndex(0);
        } else {
          setShowMentionSuggestions(false);
        }
      } else {
        setShowMentionSuggestions(false);
      }
    }
  };

  const selectMention = (username: string) => {
    const beforeMention = content.substring(0, mentionPosition);
    const afterCursor = content.substring(textareaRef.current?.selectionStart || content.length);
    const newContent = beforeMention + '@' + username + ' ' + afterCursor;
    
    setContent(newContent);
    setShowMentionSuggestions(false);
    setMentionSearch('');
    
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const newCursorPos = beforeMention.length + username.length + 2;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleMusicSelect = (item: any, type: 'single' | 'playlist' | 'album') => {
    const formattedItem = {
      ...item,
      tokenId: item.tokenId,
      contractAddress: CONTRACT_ADDRESSES.songNFT,
      title: item.metadata?.title || item.title || 'Untitled',
      artist: item.metadata?.artist || item.artist || 'Unknown Artist',
      cover: item.imageUrl || (item.metadata?.image || '/assets/default-cover.jpg'),
      audioUrl: item.audioUrl,
      imageUrl: item.imageUrl,
      ipfsHash: item.ipfsMetadataHash,
      ipfsAudioHash: item.ipfsAudioHash,
      ipfsImageHash: item.ipfsArtworkHash,
      genre: item.metadata?.genre || item.genre,
      duration: item.metadata?.duration || item.duration,
      isNFT: true,
      type: type
    };

    setSelectedTrack(formattedItem);
    setAttachments(prev => [...prev, {
      type: 'music',
      musicType: type,
      item: formattedItem
    }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    if (selectedTrack && attachments[index]?.type === 'music') {
      setSelectedTrack(null);
    }
  };

  const canPost = useMemo(() => {
    return content.trim().length > 0 || attachments.length > 0;
  }, [content, attachments]);

  const handleSubmit = async () => {
    if (!canPost || isSubmitting) return;

    // ⚡ Check if any attachments are still uploading
    const stillUploading = attachments.some(att => att.uploading);
    if (stillUploading) {
      toast.error("Please wait for media upload to complete");
      return;
    }
    
    // Check if any uploads failed
    const hasFailed = attachments.some(att => att.uploadFailed);
    if (hasFailed) {
      toast.error("Some media uploads failed. Please remove and try again");
      return;
    }

    setIsSubmitting(true);
    try {
      // ⚡ NO UPLOAD NEEDED: Files already uploaded to IPFS when selected!
      // Just pass through attachments with ipfsHash
      const validAttachments = attachments
        .filter(att => {
          // Music attachments are kept as-is
          if (att.type === 'music') return true;
          
          // Image/video must have ipfsHash (already uploaded)
          if ((att.type === 'image' || att.type === 'video') && att.ipfsHash) {
            return true;
          }
          
          console.warn('⚠️ Attachment missing IPFS hash:', att);
          return false;
        })
        .map(att => ({
          type: att.type,
          ipfsHash: att.ipfsHash,
          url: att.url,
          name: att.name,
          item: att.item // For music attachments
        }));
      
      await onSubmit(content, validAttachments);
      
      // Reset form
      setContent("");
      setAttachments([]);
      setSelectedTrack(null);
      setShowEmojiPicker(false);
      onClose();
    } catch (error) {
      console.error('Failed to submit quote:', error);
      toast.error("Failed to submit quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent("");
      setAttachments([]);
      setSelectedTrack(null);
      setShowEmojiPicker(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[95vw] sm:w-full">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-lg">Quote Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
          {/* User Avatar and Input */}
          <div className="flex gap-2 sm:gap-3">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <AvatarImage 
                src={getIPFSUrl(currentUserProfile?.avatarHash || '')} 
                alt={currentUserProfile?.displayName || 'User'} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                {currentUserProfile?.displayName?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 relative min-w-0">
              <Textarea
                ref={textareaRef}
                placeholder="Add your thoughts..."
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[80px] sm:min-h-[100px] border-none resize-none focus:ring-0 p-0 text-sm sm:text-base"
                autoFocus
                onKeyDown={(e) => {
                  if (showMentionSuggestions && filteredUsers.length > 0) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSelectedMentionIndex((prev) => 
                        prev < filteredUsers.length - 1 ? prev + 1 : prev
                      );
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSelectedMentionIndex((prev) => prev > 0 ? prev - 1 : 0);
                    } else if (e.key === 'Enter' || e.key === 'Tab') {
                      e.preventDefault();
                      selectMention(filteredUsers[selectedMentionIndex].username);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setShowMentionSuggestions(false);
                    }
                  }
                }}
              />

              {/* Mention Suggestions */}
              {showMentionSuggestions && filteredUsers.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-w-sm bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user.username}
                      className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer transition-colors ${
                        index === selectedMentionIndex ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => selectMention(user.username)}
                    >
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                        <AvatarImage src={getIPFSUrl(user.avatar)} />
                        <AvatarFallback className="text-[10px] sm:text-xs">
                          {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-xs sm:text-sm truncate">{user.displayName}</span>
                          {user.isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground truncate">@{user.username}</span>
                      </div>
                      {user.isArtist && (
                        <Music className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative">
                  {attachment.type === 'image' && (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img 
                        src={attachment.url} 
                        alt="Preview" 
                        className={`w-full max-h-48 sm:max-h-64 object-cover ${attachment.uploading ? 'opacity-60' : ''}`}
                      />
                      {attachment.uploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg">
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white mb-2" />
                          <span className="text-white text-[10px] sm:text-xs">Uploading to IPFS...</span>
                        </div>
                      )}
                      {attachment.uploadFailed && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
                          <span className="text-red-500 text-[10px] sm:text-xs font-semibold">Upload Failed</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 h-6 w-6 sm:h-8 sm:w-8 p-0"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  )}
                  {attachment.type === 'video' && (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <video 
                        src={attachment.url} 
                        controls 
                        className={`w-full max-h-48 sm:max-h-64 ${attachment.uploading ? 'opacity-60' : ''}`}
                      />
                      {attachment.uploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg pointer-events-none">
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white mb-2" />
                          <span className="text-white text-[10px] sm:text-xs">Uploading to IPFS...</span>
                        </div>
                      )}
                      {attachment.uploadFailed && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg pointer-events-none">
                          <span className="text-red-500 text-[10px] sm:text-xs font-semibold">Upload Failed</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 h-6 w-6 sm:h-8 sm:w-8 p-0"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  )}
                  {attachment.type === 'music' && (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg border border-border">
                      <img 
                        src={attachment.item.cover} 
                        alt={attachment.item.title}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{attachment.item.title}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{attachment.item.artist}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(index)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quoted Post Preview */}
          <div className="border border-border/50 rounded-lg p-2.5 sm:p-4 bg-muted/20">
            <div className="flex items-start gap-2 mb-1.5 sm:mb-2">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                <AvatarImage 
                  src={getIPFSUrl(quotedPost.authorProfile?.avatarHash || '')} 
                  alt={quotedPost.authorProfile?.displayName || 'User'} 
                />
                <AvatarFallback className="text-[10px] sm:text-xs">
                  {(quotedPost.authorProfile?.displayName || quotedPost.author).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs sm:text-sm flex-wrap">
                  <span className="font-semibold truncate max-w-[120px] sm:max-w-none">
                    {quotedPost.authorProfile?.displayName || `${quotedPost.author.slice(0, 6)}...${quotedPost.author.slice(-4)}`}
                  </span>
                  {quotedPost.authorProfile?.isVerified && <VerifiedBadge size="sm" />}
                  <span className="text-muted-foreground truncate max-w-[80px] sm:max-w-none">
                    @{quotedPost.authorProfile?.username || quotedPost.author.slice(0, 8)}
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">·</span>
                  <span className="text-muted-foreground text-[10px] sm:text-xs">
                    {formatTimeAgo(quotedPost.timestamp)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-4 mt-1">
                  {quotedPost.content}
                </p>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-2 sm:pt-3 border-t border-border">
            <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto pb-1 sm:pb-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:text-primary hover:bg-primary/10 h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                title="Upload image"
              >
                <Image className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:text-primary hover:bg-primary/10 h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                title="Upload video"
              >
                <Video className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-primary hover:text-primary hover:bg-primary/10 h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                  title="Add emoji"
                >
                  <Smile className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </Button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleMention}
                className="text-primary hover:text-primary hover:bg-primary/10 h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                title="Mention user"
              >
                <AtSign className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </Button>

              {/* Music Selector - Simplified for now */}
              {!selectedTrack && ownedNFTs && (ownedNFTs.singles.length > 0 || ownedNFTs.playlists.length > 0 || ownedNFTs.albums.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10 h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                  onClick={() => toast.info('Music attachment coming soon!')}
                  title="Attach music"
                >
                  <Music className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </Button>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleClose} 
                disabled={isSubmitting}
                className="flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!canPost || isSubmitting}
                className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Posting...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Repeat2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Quote Post</span>
                    <span className="sm:hidden">Quote</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotePostModal;

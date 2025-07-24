'use client';

import type { Conversation } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilePlus2, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id:string) => void;
}

export default function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
    
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    setConversationToDelete(conversation);
  };
  
  const confirmDelete = () => {
    if(conversationToDelete) {
        onDeleteConversation(conversationToDelete.id);
        setConversationToDelete(null);
    }
  }

  const sortedConversations = [...conversations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AlertDialog>
        <div className="flex flex-1 flex-col min-h-0 bg-background text-foreground">
        <div className="p-2 border-b flex-shrink-0">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onNewConversation}>
            <FilePlus2 className="h-5 w-5" />
            New Chat
            </Button>
        </div>
        <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
            {sortedConversations.map((convo) => (
                <div key={convo.id} className="group relative">
                    <button
                        onClick={() => onSelectConversation(convo.id)}
                        className={cn(
                        'w-full text-left p-2 rounded-md truncate text-sm flex items-center gap-2',
                        currentConversationId === convo.id
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50'
                        )}
                    >
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{convo.title}</span>
                    </button>
                    <AlertDialogTrigger asChild>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                            onClick={(e) => handleDeleteClick(e, convo)}
                        >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                    </AlertDialogTrigger>
                </div>
            ))}
            </div>
        </ScrollArea>
        </div>
        {conversationToDelete && (
             <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the chat titled &quot;{conversationToDelete.title}&quot;.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConversationToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/80"
                    onClick={confirmDelete}
                >
                    Delete
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        )}
    </AlertDialog>
  );
}

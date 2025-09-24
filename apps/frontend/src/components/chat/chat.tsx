import { useEffect, useRef, useState } from "react";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import { useMessages } from "@/store/messages";

interface Props {
  droppedFile?: string | null;
  onClearFile?: () => void;
}

export const Chat = ({ droppedFile, onClearFile }: Props) => {
  const { messages } = useMessages();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="max-w-screen-md mx-auto py-8 px-4">
          {messages.length === 0 ? (
            <div className="flex w-full h-full items-center justify-center">
              <p className="text-center text-muted-foreground">
                Start a conversation with the AI assistant.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  isTyping={
                    isTyping &&
                    index === messages.length - 1 &&
                    message.role === "assistant"
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="w-full bg-background z-20 p-4 border-t">
        <div className="max-w-screen-md mx-auto">
          <ChatInput
            onTypingChange={setIsTyping}
            droppedFile={droppedFile}
            onClearFile={onClearFile}
          />
        </div>
      </div>
    </div>
  );
};

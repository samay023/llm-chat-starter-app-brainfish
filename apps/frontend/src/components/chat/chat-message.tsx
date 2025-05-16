import ReactMarkdown from "react-markdown";

import { TypingIndicator } from "@/components/chat/typing-indicator";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export const ChatMessage = ({ message, isTyping }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-lg p-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {message.content ? (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        ) : isTyping ? (
          <TypingIndicator />
        ) : null}
      </div>
    </div>
  );
};

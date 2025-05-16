export const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 px-3 py-2 text-sm text-muted-foreground">
      <div className="flex space-x-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
};

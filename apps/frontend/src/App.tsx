import { Chat } from "@/components/chat/chat";
import { FileDropZone } from "./components/ui/file-drop-zone";
import { useState } from "react";

const App = () => {
  const [droppedFile, setDroppedFile] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background flex items-center justify-center h-14 w-full flex-none">
        <h1 className="text-lg font-semibold">
          LLM Chat <span className="text-sm text-muted-foreground">v1.0</span>
        </h1>
      </header>
      <main className="flex-1 min-h-0">
        <FileDropZone
          onFileDrop={(files) => {
            setDroppedFile(files[0]?.content || null);
          }}
        >
          <Chat
            droppedFile={droppedFile}
            onClearFile={() => setDroppedFile(null)}
          />
        </FileDropZone>
      </main>
    </div>
  );
};

export default App;

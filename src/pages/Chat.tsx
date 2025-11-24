import ChatInterface from "@/components/ChatInterface";
import Navigation from "@/components/Navigation";

const Chat = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      <Navigation />
      
      {/* Full-screen chat - Apple Messages style */}
      <main className="flex-1 flex flex-col pt-14 md:pt-16 pb-16 md:pb-0 overflow-hidden">
        <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
};

export default Chat;
import ChatInterface from "@/components/ChatInterface";
import Navigation from "@/components/Navigation";

const Chat = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle pattern-overlay">
      <Navigation />
      
      {/* Main Content */}
      <main className="pt-16 md:pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-gentle overflow-hidden h-[calc(100vh-8rem)]">
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
import { useState } from "react";
import { Send, Camera, Clock, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const quickActions = [
  { label: "Vegetarian", icon: "🥬" },
  { label: "20-min meals", icon: "⏰" },
  { label: "Use chicken", icon: "🐔" },
  { label: "Spicy dishes", icon: "🌶️" },
];

const shortcuts = [
  { label: "Upload Ingredient", icon: Camera },
  { label: "My Recipes", icon: Heart },
  { label: "Community", icon: Users },
  { label: "Resume Cooking", icon: Clock },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "မင်္ဂလာပါ! Welcome to your Burmese cooking assistant. I'm here to help you discover delicious recipes and cooking techniques. What would you like to cook today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Simulate assistant response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: "Let me help you find the perfect recipe! Based on what you're looking for, I'd recommend trying Mohinga - it's Myanmar's national dish. Would you like the traditional recipe or a quick 30-minute version?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-gradient-subtle">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-foreground">Burmese Cuisine Assistant</h2>
        <p className="text-sm text-muted-foreground">Your personal cooking companion</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble ${message.isUser ? 'user' : 'assistant'}`}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button key={action.label} className="action-chip">
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Shortcuts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {shortcuts.map((shortcut) => (
            <Button key={shortcut.label} variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
              <shortcut.icon className="w-4 h-4" />
              <span className="text-xs">{shortcut.label}</span>
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about recipes, ingredients, or cooking tips..."
            className="flex-1 rounded-full"
          />
          <Button onClick={sendMessage} size="sm" className="rounded-full px-4">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Send, Camera, Clock, Heart, Users, Bookmark, Share2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text?: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'recipe' | 'step' | 'nutrition';
  data?: any;
}

interface RecipeData {
  title: string;
  image: string;
  tags: string[];
  rating: number;
  cookTime: string;
}

interface StepData {
  stepNumber: number;
  instruction: string;
  timerMinutes?: number;
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
      type: 'text'
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate assistant response with rich content
    setTimeout(() => {
      setIsTyping(false);
      const responses: Message[] = [
        {
          id: (Date.now() + 1).toString(),
          text: "Perfect! I found some delicious Burmese recipes for you. Here's a popular one:",
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        },
        {
          id: (Date.now() + 2).toString(),
          isUser: false,
          timestamp: new Date(),
          type: 'recipe',
          data: {
            title: "Traditional Mohinga",
            image: "/src/assets/mohinga-dish.jpg",
            tags: ["Traditional", "30 min", "Comfort Food"],
            rating: 4.8,
            cookTime: "30 min"
          }
        }
      ];
      
      responses.forEach((response, index) => {
        setTimeout(() => {
          setMessages((prev) => [...prev, response]);
        }, index * 500);
      });
    }, 1500);
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
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
          >
            {message.type === 'text' ? (
              <div className={`message-bubble ${message.isUser ? 'user' : 'assistant'}`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : message.type === 'recipe' ? (
              <RecipeEmbedCard data={message.data} />
            ) : message.type === 'step' ? (
              <StepCard data={message.data} />
            ) : message.type === 'nutrition' ? (
              <NutritionCard data={message.data} />
            ) : null}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <TypingIndicator />
          </div>
        )}
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
        <div className="flex gap-2 items-end">
          <Button variant="outline" size="sm" className="rounded-full p-2">
            <Camera className="w-4 h-4" />
          </Button>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me what to cook today..."
            className="flex-1 rounded-full bg-muted/50 border-border"
          />
          <Button onClick={sendMessage} size="sm" className="rounded-full px-4 bg-gradient-warm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Recipe Embed Card Component
function RecipeEmbedCard({ data }: { data: RecipeData }) {
  return (
    <div className="bg-card rounded-xl border border-border max-w-sm overflow-hidden shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Button size="sm" variant="outline" className="rounded-full bg-background/80 backdrop-blur-sm">
            <Bookmark className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base leading-tight mb-1">{data.title}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>⭐ {data.rating}</span>
            <span>•</span>
            <span>{data.cookTime}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 rounded-full bg-gradient-warm">
            <Play className="w-3 h-3 mr-1" />
            Cook Now
          </Button>
          <Button size="sm" variant="outline" className="rounded-full">
            <Share2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step Card Component
function StepCard({ data }: { data: StepData }) {
  return (
    <div className="bg-accent-light rounded-xl border border-accent/20 max-w-md p-4">
      <div className="flex items-start gap-3">
        <div className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
          {data.stepNumber}
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-foreground mb-3">{data.instruction}</p>
          {data.timerMinutes && (
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="w-3 h-3" />
              Start {data.timerMinutes}min timer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Nutrition Card Component  
function NutritionCard({ data }: { data: NutritionData }) {
  return (
    <div className="bg-gradient-earth rounded-xl max-w-sm p-4 text-secondary-foreground">
      <h3 className="font-semibold mb-3 text-sm">Nutrition Per Serving</h3>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="text-center">
          <div className="font-semibold text-lg">{data.calories}</div>
          <div className="opacity-90">Calories</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg">{data.protein}g</div>
          <div className="opacity-90">Protein</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg">{data.carbs}g</div>
          <div className="opacity-90">Carbs</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg">{data.fat}g</div>
          <div className="opacity-90">Fat</div>
        </div>
      </div>
    </div>
  );
}

// Typing Indicator Component
function TypingIndicator() {
  return (
    <div className="message-bubble assistant">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
        </div>
        <span className="text-xs text-muted-foreground ml-2">Assistant is typing...</span>
      </div>
    </div>
  );
}
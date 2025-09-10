import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send, Camera, Clock, Heart, Users, Bookmark, Share2, Play, ArrowRight, RotateCcw, Pause, ChefHat, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  tips?: string;
}

interface CookingSession {
  recipeTitle: string;
  steps: StepData[];
  currentStep: number;
  isActive: boolean;
  isPaused: boolean;
}

interface Timer {
  id: string;
  label: string;
  duration: number;
  remaining: number;
  isActive: boolean;
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
  const location = useLocation();
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
  const [cookingSession, setCookingSession] = useState<CookingSession | null>(null);
  const [timers, setTimers] = useState<Timer[]>([]);

  // Sample cooking steps for demo
  const sampleSteps: StepData[] = [
    {
      stepNumber: 1,
      instruction: "Soak rice noodles in warm water for 30 minutes until soft.",
      timerMinutes: 30,
      tips: "The noodles should be flexible but still have a slight bite."
    },
    {
      stepNumber: 2,
      instruction: "Heat oil in a large pot over medium heat. Add onions and cook until golden brown.",
      timerMinutes: 5,
      tips: "Golden brown onions add sweetness to the broth."
    },
    {
      stepNumber: 3,
      instruction: "Add garlic, ginger, and lemongrass. Stir-fry for 2 minutes until fragrant.",
      timerMinutes: 2
    },
    {
      stepNumber: 4,
      instruction: "Add fish paste and turmeric. Cook for 1 minute, stirring constantly.",
      timerMinutes: 1,
      tips: "Be careful not to burn the turmeric - it can become bitter."
    },
    {
      stepNumber: 5,
      instruction: "Pour in coconut milk and fish stock. Bring to a gentle simmer.",
      timerMinutes: 10,
      tips: "Gentle simmer prevents the coconut milk from curdling."
    }
  ];

  // Timer management
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(timer => {
        if (timer.isActive && timer.remaining > 0) {
          return { ...timer, remaining: timer.remaining - 1 };
        }
        return timer;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle recipe data from navigation
  useEffect(() => {
    const state = location.state as { recipe?: any; startCooking?: boolean } | null;
    if (state?.recipe && state?.startCooking) {
      // Add recipe message
      const recipeMessage: Message = {
        id: Date.now().toString(),
        text: `Let's cook ${state.recipe.title}! I'll guide you through each step. Ready to start?`,
        isUser: false,
        timestamp: new Date(),
        type: 'recipe',
        data: state.recipe
      };
      
      setMessages(prev => [...prev, recipeMessage]);
      startCookingSession(state.recipe.title);
    }
  }, [location.state]);

  const startCookingSession = (recipeTitle: string) => {
    setCookingSession({
      recipeTitle,
      steps: sampleSteps,
      currentStep: 0,
      isActive: true,
      isPaused: false
    });
  };

  const nextStep = () => {
    if (!cookingSession) return;
    if (cookingSession.currentStep < cookingSession.steps.length - 1) {
      setCookingSession(prev => prev ? { ...prev, currentStep: prev.currentStep + 1 } : null);
    }
  };

  const repeatStep = () => {
    // Just trigger a visual indication that step is being repeated
    const stepElement = document.querySelector('.current-cooking-step');
    if (stepElement) {
      stepElement.classList.add('animate-pulse');
      setTimeout(() => stepElement.classList.remove('animate-pulse'), 1000);
    }
  };

  const pauseCooking = () => {
    if (!cookingSession) return;
    setCookingSession(prev => prev ? { ...prev, isPaused: !prev.isPaused } : null);
  };

  const exitCookingMode = () => {
    setCookingSession(null);
    setTimers([]);
  };

  const startTimer = (label: string, minutes: number) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      label,
      duration: minutes * 60,
      remaining: minutes * 60,
      isActive: true
    };
    setTimers(prev => [...prev, newTimer]);
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, isActive: !timer.isActive } : timer
    ));
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

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

  // Render cooking mode if active
  if (cookingSession?.isActive) {
    return (
      <CookingMode 
        session={cookingSession}
        timers={timers}
        onNextStep={nextStep}
        onRepeatStep={repeatStep}
        onPauseCooking={pauseCooking}
        onStartTimer={startTimer}
        onToggleTimer={toggleTimer}
        onRemoveTimer={removeTimer}
        onExitCooking={exitCookingMode}
      />
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-gradient-subtle">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <ChefHat className="w-5 h-5" />
          Burmese Cuisine Assistant
        </h2>
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
              <RecipeEmbedCard data={message.data} onStartCooking={startCookingSession} />
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
function RecipeEmbedCard({ data, onStartCooking }: { data: RecipeData; onStartCooking: (title: string) => void }) {
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
          <Button 
            size="sm" 
            className="flex-1 rounded-full bg-gradient-warm"
            onClick={() => onStartCooking(data.title)}
          >
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

// Cooking Mode Component
interface CookingModeProps {
  session: CookingSession;
  timers: Timer[];
  onNextStep: () => void;
  onRepeatStep: () => void;
  onPauseCooking: () => void;
  onStartTimer: (label: string, minutes: number) => void;
  onToggleTimer: (id: string) => void;
  onRemoveTimer: (id: string) => void;
  onExitCooking: () => void;
}

function CookingMode({ 
  session, 
  timers, 
  onNextStep, 
  onRepeatStep, 
  onPauseCooking, 
  onStartTimer, 
  onToggleTimer, 
  onRemoveTimer, 
  onExitCooking 
}: CookingModeProps) {
  const currentStep = session.steps[session.currentStep];
  const progress = ((session.currentStep + 1) / session.steps.length) * 100;
  const isLastStep = session.currentStep === session.steps.length - 1;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-gradient-subtle">
      {/* Cooking Header */}
      <div className="p-4 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              {session.recipeTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              Step {session.currentStep + 1} of {session.steps.length}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onExitCooking}>
            Exit Cooking
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Active Timers */}
      {timers.length > 0 && (
        <div className="p-4 border-b border-border bg-accent/20">
          <div className="flex flex-wrap gap-2">
            {timers.map((timer) => (
              <TimerCard
                key={timer.id}
                timer={timer}
                onToggle={() => onToggleTimer(timer.id)}
                onRemove={() => onRemoveTimer(timer.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Current Step */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="current-cooking-step max-w-2xl w-full">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-gentle">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full text-xl font-bold mb-4">
                {currentStep.stepNumber}
              </div>
              <h3 className="text-2xl font-semibold text-foreground leading-relaxed">
                {currentStep.instruction}
              </h3>
            </div>

            {/* Tips */}
            {currentStep.tips && (
              <div className="bg-accent/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>💡 Tip:</strong> {currentStep.tips}
                </p>
              </div>
            )}

            {/* Timer Button */}
            {currentStep.timerMinutes && (
              <div className="flex justify-center mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => onStartTimer(`Step ${currentStep.stepNumber}`, currentStep.timerMinutes!)}
                  className="gap-2 bg-gradient-warm text-primary-foreground border-0"
                >
                  <Clock className="w-4 h-4" />
                  Start {currentStep.timerMinutes}min timer
                </Button>
              </div>
            )}

            {/* Step Controls */}
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={onRepeatStep}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Repeat
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onPauseCooking}
                className="gap-2"
              >
                <Pause className="w-4 h-4" />
                {session.isPaused ? 'Resume' : 'Pause'}
              </Button>

              {!isLastStep ? (
                <Button 
                  onClick={onNextStep}
                  className="gap-2 bg-gradient-warm"
                  disabled={session.isPaused}
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={onExitCooking}
                  className="gap-2 bg-gradient-earth"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Recipe
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Timer Card Component
function TimerCard({ timer, onToggle, onRemove }: { 
  timer: Timer; 
  onToggle: () => void; 
  onRemove: () => void; 
}) {
  const minutes = Math.floor(timer.remaining / 60);
  const seconds = timer.remaining % 60;
  const isFinished = timer.remaining === 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      isFinished 
        ? 'bg-destructive/20 border-destructive text-destructive' 
        : timer.isActive 
          ? 'bg-primary/20 border-primary text-primary' 
          : 'bg-muted border-border text-muted-foreground'
    }`}>
      <Clock className="w-3 h-3" />
      <span className="text-sm font-medium">
        {timer.label}: {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
      {!isFinished && (
        <Button size="sm" variant="ghost" onClick={onToggle} className="h-auto p-1">
          {timer.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={onRemove} className="h-auto p-1 text-destructive">
        ×
      </Button>
    </div>
  );
}
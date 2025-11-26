import { useState, useEffect, useRef } from "react";
import { Send, Bookmark, Star, Clock, ChefHat, Pause, Play, RotateCcw, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { chatService } from "@/services/chat.service";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import type { ChatMessage as APIChatMessage, Recipe } from "@/types/api.types";
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

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [waitingTime, setWaitingTime] = useState(0);
  const [cookingSession, setCookingSession] = useState<CookingSession | null>(null);
  const [timers, setTimers] = useState<Timer[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Add missing cooking session functions
  const nextStep = () => {
    if (cookingSession) {
      setCookingSession(prev => prev ? { ...prev, currentStep: prev.currentStep + 1 } : null);
    }
  };

  const repeatStep = () => {
    // Repeat current step logic
  };

  const pauseCooking = () => {
    if (cookingSession) {
      setCookingSession(prev => prev ? { ...prev, isPaused: !prev.isPaused } : null);
    }
  };

  const startTimer = (label: string, minutes: number) => {
    const newTimer: Timer = {
      id: `timer-${Date.now()}`,
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

  const exitCookingMode = () => {
    setCookingSession(null);
    setTimers([]);
  };

  // Load chat history on mount (only if on /chat page, not on home)
  useEffect(() => {
    // Don't load history on home page for non-logged-in users
    const isHomePage = window.location.pathname === '/';
    
    if (isHomePage) {
      // Just show welcome message on home page
      setMessages([{
        id: "welcome",
        text: "မင်္ဂလာပါ! Welcome to your Burmese cooking assistant. I'm here to help you discover delicious recipes and cooking techniques. What would you like to cook today?",
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      }]);
      setLoading(false);
      return;
    }

    // Load history for chat page
    (async () => {
      try {
        const history = await chatService.getHistory();
        const mapped: Message[] = [];
        history.forEach((h) => {
          // User message
          if (h.user_message) {
            mapped.push({
              id: `user-${h.message_id}`,
              text: h.user_message,
              isUser: true,
              timestamp: new Date(h.created_at),
              type: 'text',
            });
          }
          // AI reply
          if (h.ai_reply) {
            mapped.push({
              id: `ai-${h.message_id}`,
              text: h.ai_reply,
              isUser: false,
              timestamp: new Date(h.created_at),
              type: 'text',
            });
          }
          // Recipe recommendation if present
          if (h.cooking_recipe) {
            mapped.push({
              id: `recipe-${h.message_id}`,
              isUser: false,
              timestamp: new Date(h.created_at),
              type: 'recipe',
              data: h.cooking_recipe,
            });
          }
        });
        if (mapped.length === 0) {
          mapped.push({
            id: "welcome",
            text: "မင်္ဂလာပါ! Welcome to your Burmese cooking assistant. I'm here to help you discover delicious recipes and cooking techniques. What would you like to cook today?",
            isUser: false,
            timestamp: new Date(),
            type: 'text',
          });
        }
        setMessages(mapped);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setMessages([{
          id: "welcome",
          text: "မင်္ဂလာပါ! Welcome to your Burmese cooking assistant. I'm here to help you discover delicious recipes and cooking techniques. What would you like to cook today?",
          isUser: false,
          timestamp: new Date(),
          type: 'text',
        }]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) {
        clearInterval(waitingTimerRef.current);
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputText;
    setInputText("");
    setIsTyping(true);
    setWaitingTime(0);

    // Start waiting timer
    waitingTimerRef.current = setInterval(() => {
      setWaitingTime((prev) => prev + 1);
    }, 1000);

    try {
      const res = await chatService.sendMessage(query);
      
      // Clear timer
      if (waitingTimerRef.current) {
        clearInterval(waitingTimerRef.current);
        waitingTimerRef.current = null;
      }
      setIsTyping(false);
      setWaitingTime(0);

      // AI reply message
      if (res.ai_reply) {
        const assistantMessage: Message = {
          id: `ai-${res.message_id}`,
          text: res.ai_reply,
          isUser: false,
          timestamp: new Date(),
          type: 'text',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Add recipe recommendation if present
      if (res.cooking_recipe) {
        setTimeout(() => {
          const recipeMsg: Message = {
            id: `recipe-${res.message_id}`,
            isUser: false,
            timestamp: new Date(),
            type: 'recipe',
            data: res.cooking_recipe,
          };
          setMessages((prev) => [...prev, recipeMsg]);
        }, 400);
      }
    } catch (err: any) {
      // Clear timer
      if (waitingTimerRef.current) {
        clearInterval(waitingTimerRef.current);
        waitingTimerRef.current = null;
      }
      setIsTyping(false);
      setWaitingTime(0);
      
      const errorMsg = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')
        ? "Request timed out. AI is taking too long to respond. Please try again."
        : err?.message || "Failed to send message";
      
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
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
    <div className="flex flex-col h-full w-full bg-background">
      {/* Messages Area - Apple Messages style */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3">
        {loading && <div className="text-center text-sm text-muted-foreground py-8">Loading...</div>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'text' ? (
              <div 
                className={`max-w-[85%] md:max-w-[70%] rounded-[20px] px-4 py-2.5 ${
                  message.isUser 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                  {message.text}
                </p>
              </div>
            ) : message.type === 'recipe' ? (
              <div className="max-w-[85%] md:max-w-[70%]">
                <RecipeEmbedCard data={message.data} />
              </div>
            ) : message.type === 'step' ? (
              <StepCard data={message.data} />
            ) : message.type === 'nutrition' ? (
              <NutritionCard data={message.data} />
            ) : null}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-[20px] px-4 py-3">
              <TypingIndicator waitingTime={waitingTime} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom, Apple style */}
      <div className="border-t bg-background/95 backdrop-blur-lg px-4 md:px-6 py-3 safe-area-inset-bottom">
        {/* Quick Actions - Only show if no messages yet */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action) => (
              <button 
                key={action.label}
                onClick={() => setInputText(action.label)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="h-11 rounded-[22px] bg-muted border-0 px-4 text-[15px] placeholder:text-muted-foreground/60"
              disabled={isTyping}
            />
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={!inputText.trim() || isTyping}
            size="icon"
            className="h-11 w-11 rounded-full shadow-sm shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Recipe Embed Card Component
function RecipeEmbedCard({ data }: { data: Recipe }) {
  const totalMins = (data.preparation_time || 0) + (data.cooking_time || 0);
  const cookTime = totalMins ? `${totalMins}min` : '-';
  const image = data.image_url || "/placeholder.svg";
  const rating = data.average_rating || 0;
  
  return (
    <Link to={`/recipes/${data.id}`} className="block">
      <div className="bg-card rounded-xl border border-border max-w-sm overflow-hidden shadow-card hover:shadow-lg transition-shadow">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={data.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            {data.difficulty_level && (
              <Badge>{data.difficulty_level}</Badge>
            )}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-base leading-tight mb-1">{data.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>⭐ {Number(rating.toFixed(1))}</span>
              <span>•</span>
              <span>{cookTime}</span>
              {data.servings && (
                <>
                  <span>•</span>
                  <span>{data.servings} servings</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {data.cuisine_type && (
              <Badge variant="secondary" className="text-xs">{data.cuisine_type}</Badge>
            )}
            {data.difficulty_level && (
              <Badge variant="outline" className="text-xs">{data.difficulty_level}</Badge>
            )}
          </div>
          
          <Button size="sm" className="w-full rounded-full">
            View Recipe
          </Button>
        </div>
      </div>
    </Link>
  );
}

// Step Card Component
function StepCard({ data }: { data: StepData }) {
  return (
    <div className="bg-accent rounded-xl border border-accent/20 max-w-md p-4">
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
    <div className="bg-secondary rounded-xl max-w-sm p-4 text-secondary-foreground">
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
function TypingIndicator({ waitingTime }: { waitingTime: number }) {
  const getMessage = () => {
    if (waitingTime < 5) return "Assistant is typing...";
    if (waitingTime < 15) return "Thinking deeply...";
    if (waitingTime < 30) return "AI is processing your request...";
    if (waitingTime < 60) return `Still working... (${waitingTime}s)`;
    return `This is taking longer than usual... (${waitingTime}s)`;
  };

  return (
    <div className="message-bubble assistant">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
        </div>
        <span className="text-xs text-muted-foreground ml-2">{getMessage()}</span>
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
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-background">
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
        <div className="max-w-2xl w-full">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-md">
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
                  className="gap-2 bg-primary text-primary-foreground border-0"
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
                  className="gap-2 bg-primary"
                  disabled={session.isPaused}
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={onExitCooking}
                  className="gap-2 bg-secondary"
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
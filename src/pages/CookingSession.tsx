import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { recipesService } from "@/services/recipes.service";
import { cookingSessionService } from "@/services/cooking-session.service";
import { chatService } from "@/services/chat.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  X, ChevronLeft, ChevronRight, Play, Pause, Check, 
  Clock, Send, Loader2, Menu, MessageSquare, Timer, 
  Thermometer, ChefHat, Lightbulb, AlertCircle
} from "lucide-react";
import type { Recipe } from "@/types/api.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CookingSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sessionNotes, setSessionNotes] = useState("");
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([{
    id: "welcome",
    text: "Hi! I'm your cooking assistant. Ask me anything about this recipe!",
    isUser: false
  }]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Mobile view toggle
  const [showChat, setShowChat] = useState(false);
  
  // Exit confirmation
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // Quick reply suggestions
  const quickReplies = [
    { icon: Thermometer, text: "What temperature?", query: "What temperature should I use?" },
    { icon: Timer, text: "How long?", query: "How long does this step take?" },
    { icon: ChefHat, text: "Any tips?", query: "Do you have any tips for this step?" },
    { icon: Lightbulb, text: "Alternative?", query: "What's an alternative ingredient?" },
  ];

  // Fetch recipe
  const { data: recipe, isLoading } = useQuery<Recipe>({
    queryKey: ["recipe", id],
    queryFn: () => recipesService.getById(id!),
    enabled: !!id,
  });

  const steps = recipe?.steps?.sort((a, b) => a.step_number - b.step_number).map(s => s.instruction_text) || [];
  
  // Calculate time remaining
  const totalTime = (recipe?.preparation_time || 0) + (recipe?.cooking_time || 0);
  const estimatedTimePerStep = totalTime > 0 ? totalTime / steps.length : 0;
  const estimatedTimeRemaining = Math.max(0, Math.round(estimatedTimePerStep * (steps.length - currentStep - 1)));

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Start session mutation
  const startSessionMut = useMutation({
    mutationFn: () => cookingSessionService.start({ recipe_id: id! }),
    onSuccess: (data) => {
      setSessionId(String(data.id));
      setIsRunning(true);
      toast({ title: "Cooking session started!" });
    },
  });

  // End session mutation
  const endSessionMut = useMutation({
    mutationFn: () => cookingSessionService.end(sessionId!, { notes: sessionNotes }),
    onSuccess: () => {
      toast({ title: "Session completed!", description: "Great cooking!" });
      navigate(`/recipes/${id}`);
    },
  });

  // Send chat message with proper API integration
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMessage = chatInput.trim();
    const contextMessage = `I'm cooking "${recipe?.title}" (Step ${currentStep + 1}/${steps.length}: ${steps[currentStep]}). ${userMessage}`;
    const userMsgId = Date.now().toString();
    
    // Add user message immediately
    setChatMessages(prev => [...prev, { id: userMsgId, text: userMessage, isUser: true }]);
    setChatInput("");
    setIsSending(true);

    try {
      // Send with recipe context
      const response = await chatService.sendMessage(contextMessage);
      
      // Add AI response
      if (response.ai_reply) {
        setChatMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          text: response.ai_reply,
          isUser: false
        }]);
      }

      // If AI recommended a recipe, show it
      if (response.cooking_recipe) {
        setChatMessages(prev => [...prev, {
          id: `recipe-${Date.now()}`,
          text: `📖 Recommended: ${response.cooking_recipe.title}\n${response.cooking_recipe.description || ''}`,
          isUser: false
        }]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: "Sorry, I couldn't process your message. Please try again.",
        isUser: false
      }]);
      toast({
        title: "Failed to send message",
        description: error?.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Auto-start session
  useEffect(() => {
    if (recipe && !sessionId) {
      startSessionMut.mutate();
    }
  }, [recipe]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch(e.key) {
        case 'ArrowRight':
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
          break;
        case 'ArrowLeft':
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
          }
          break;
        case ' ':
          e.preventDefault();
          setIsRunning(!isRunning);
          break;
        case 'm':
        case 'M':
          handleStepComplete(currentStep);
          break;
        case '/':
          e.preventDefault();
          document.querySelector<HTMLInputElement>('[data-chat-input]')?.focus();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, steps.length, isRunning]);
  
  // Prevent accidental exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStepComplete = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handleFinish = () => {
    setIsRunning(false);
    endSessionMut.mutate();
  };
  
  const handleExit = () => {
    if (isRunning) {
      setShowExitDialog(true);
    } else {
      navigate(`/recipes/${id}`);
    }
  };
  
  const handleQuickReply = (query: string) => {
    setChatInput(query);
    handleSendMessage();
  };
  
  // Highlight ingredients in step text (simple bold)
  const highlightIngredients = (text: string) => {
    // Common cooking keywords to highlight
    const keywords = ['chicken', 'salt', 'pepper', 'oil', 'water', 'garlic', 'onion', 'ginger', 'sauce', 'heat', 'temperature', 'minutes', 'until'];
    let highlighted = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      highlighted = highlighted.replace(regex, '<strong>$1</strong>');
    });
    return highlighted;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExit}
            className="flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold truncate text-base">{recipe?.title}</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              <Clock className="w-3 h-3" />
              <span>{formatTime(elapsedTime)}</span>
              <span>•</span>
              <span>Step {currentStep + 1}/{steps.length}</span>
              {estimatedTimeRemaining > 0 && (
                <>
                  <span>•</span>
                  <span>~{estimatedTimeRemaining}m</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRunning(!isRunning)}
            className="hidden md:flex"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant={showChat ? "default" : "outline"}
            onClick={() => setShowChat(!showChat)}
            className="md:hidden"
          >
            {showChat ? (
              <>
                <ChefHat className="w-4 h-4 mr-1" />
                <span className="text-xs">Steps</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-1" />
                <span className="text-xs">AI Chat</span>
              </>
            )}
          </Button>
          <Button size="sm" onClick={handleFinish} disabled={endSessionMut.isPending}>
            Finish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-background to-muted/10">
        <div className="h-full grid md:grid-cols-2 gap-0 divide-x divide-border">
          {/* Left: Cooking Steps */}
          <div className={`flex flex-col bg-background/50 backdrop-blur-sm ${showChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Progress bar */}
            <div className="px-4 py-3 border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Progress</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {completedSteps.length}/{steps.length}
                </span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-border/30">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-primary/80 to-secondary transition-all duration-500 shadow-sm"
                  style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Step - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-border/50">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-base shadow-lg">
                    {currentStep + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Current Step</p>
                    <p className="font-bold text-sm truncate">Step {currentStep + 1} of {steps.length}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={completedSteps.includes(currentStep) ? "default" : "outline"}
                    onClick={() => handleStepComplete(currentStep)}
                    className="shadow-sm flex-shrink-0"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {completedSteps.includes(currentStep) ? "Done" : "Mark"}
                  </Button>
                </div>

                <Card className="p-5 bg-gradient-to-br from-card to-muted/20 border-2 shadow-lg">
                  <div 
                    className="text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightIngredients(steps[currentStep]) }}
                  />
                </Card>
                
                {/* Next Step Preview */}
                {currentStep < steps.length - 1 && (
                  <Card className="p-3 bg-muted/30 border border-dashed border-border/50">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {currentStep + 2}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Next</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{steps[currentStep + 1]}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* All Steps Overview - Hidden on mobile */}
                <div className="pt-4 border-t-2 border-border/50 hidden md:block">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Recipe Steps</h3>
                        <p className="text-xs text-muted-foreground">Click to jump to any step</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-7 px-2.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">{completedSteps.length}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">/ {steps.length}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
                    {steps.map((step, idx) => {
                      const isCompleted = completedSteps.includes(idx);
                      const isCurrent = idx === currentStep;
                      const isPast = idx < currentStep;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentStep(idx)}
                          className={`group relative w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                            isCurrent
                              ? 'bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary shadow-md hover:shadow-lg' 
                              : isCompleted
                              ? 'bg-gradient-to-r from-green-500/5 to-green-500/10 border-green-500/30 hover:border-green-500/50 hover:shadow-md'
                              : 'bg-card/50 border-border/40 hover:border-border hover:shadow-sm hover:bg-card'
                          }`}
                        >
                          {/* Progress indicator line */}
                          {isCurrent && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/80 to-secondary" />
                          )}
                          
                          <div className="flex items-start gap-3 p-3">
                            {/* Step number/status */}
                            <div className="relative flex-shrink-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                                isCompleted
                                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-110' 
                                  : isCurrent
                                  ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md ring-2 ring-primary/20'
                                  : isPast
                                  ? 'bg-muted text-muted-foreground'
                                  : 'bg-background border-2 border-border text-muted-foreground group-hover:border-primary/50'
                              }`}>
                                {isCompleted ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              {/* Connection line for non-last items */}
                              {idx < steps.length - 1 && (
                                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-2 ${
                                  isCompleted || isCurrent ? 'bg-primary/30' : 'bg-border/50'
                                }`} />
                              )}
                            </div>
                            
                            {/* Step content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold ${
                                  isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                                }`}>
                                  Step {idx + 1}
                                </span>
                                {isCurrent && (
                                  <Badge variant="default" className="h-4 px-1.5 text-xs">Active</Badge>
                                )}
                                {isCompleted && !isCurrent && (
                                  <Badge variant="secondary" className="h-4 px-1.5 text-xs bg-green-500/10 text-green-600 border-green-500/20">Done</Badge>
                                )}
                              </div>
                              <p className={`text-xs leading-relaxed line-clamp-2 ${
                                isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                              }`}>
                                {step}
                              </p>
                            </div>
                            
                            {/* Arrow indicator */}
                            {isCurrent && (
                              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Progress summary */}
                  <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Overall Progress</span>
                      <span className="font-bold text-foreground">
                        {Math.round((completedSteps.length / steps.length) * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                        style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="border-t border-border/50 p-3 bg-card/50 backdrop-blur-sm sticky bottom-0 shadow-lg">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex-1 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="text-xs text-muted-foreground font-medium px-1.5">
                  {currentStep + 1}/{steps.length}
                </div>
                <Button
                  onClick={() => {
                    if (currentStep < steps.length - 1) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      handleFinish();
                    }
                  }}
                  className="flex-1 shadow-sm"
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Right: AI Assistant */}
          <div className={`flex flex-col bg-gradient-to-b from-muted/10 to-muted/20 ${!showChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 py-3 flex items-center gap-2.5 sticky top-0 z-10 shadow-sm">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-lg">🤖</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">AI Assistant</p>
                <p className="text-xs text-muted-foreground truncate">Press / to focus</p>
              </div>
              <Badge variant="secondary" className="text-xs">#{currentStep + 1}</Badge>
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2.5 border-b border-border/50 bg-muted/10">
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((reply, idx) => {
                  const Icon = reply.icon;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply.query)}
                      disabled={isSending}
                      className="h-7 text-xs gap-1 px-2"
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{reply.text}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Chat Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 shadow-sm ${
                      msg.isUser
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                        : 'bg-card border border-border/50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-card border rounded-2xl px-4 py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-3 sticky bottom-0 shadow-lg">
              <div className="flex gap-2">
                <Input
                  data-chat-input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask about ingredients, timing, techniques..."
                  disabled={isSending}
                  className="flex-1 shadow-sm"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!chatInput.trim() || isSending}
                  size="icon"
                  className="shadow-sm"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                <span>Enter • /</span>
                <div className="hidden md:flex gap-1.5 items-center">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">← →</kbd>
                  <span>Nav</span>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">M</kbd>
                  <span>Mark</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Exit Session?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Your session is active. Progress will be saved but timer will stop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm">Continue</AlertDialogCancel>
            <AlertDialogAction className="text-sm" onClick={() => {
              setIsRunning(false);
              navigate(`/recipes/${id}`);
            }}>
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

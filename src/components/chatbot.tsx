'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, Send, User, X, Mic, MicOff } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { chat } from '@/ai/flows/chatbot';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // API not supported
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Prioritize Hindi, but most browsers will auto-detect English

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInput(input + finalTranscript + interimTranscript);
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = `Error: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = 'Microphone access denied. Please allow it in your browser settings.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech was detected. Please try again.';
      }
      toast({
          variant: 'destructive',
          title: 'Speech Recognition Error',
          description: errorMessage,
      });
      setIsListening(false);
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        toast({
            variant: 'destructive',
            title: 'Not Supported',
            description: 'Your browser does not support voice recognition.',
        });
        return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput(''); // Clear input before starting
      try {
        recognitionRef.current.start();
        toast({ title: 'Listening...' });
      } catch(e) {
        toast({
            variant: 'destructive',
            title: 'Could not start listening',
            description: 'Please ensure microphone permissions are enabled.',
        });
      }
    }
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat({ history: newMessages });
      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages([...newMessages, modelMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast({
        variant: 'destructive',
        title: 'Chatbot Error',
        description: 'Sorry, something went wrong. Please try again later.',
      });
      setMessages(messages); // Revert to previous messages
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-7 w-7" />
        <span className="sr-only">Open Chatbot</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Bot /> JANConnect Lite Helper
            </DialogTitle>
            <DialogDescription>
              Ask me any questions about using the app.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[50vh] p-6 border-y">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                  <AvatarFallback>
                    <Bot size={20}/>
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p>Hello! How can I assist you with the JANConnect Lite app today?</p>
                </div>
              </div>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' && 'justify-end'
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                       <AvatarFallback>
                        <Bot size={20}/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                   <div
                    className={cn(
                      'rounded-lg p-3 text-sm max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p>{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback>
                        <User size={20}/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                   <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                       <AvatarFallback>
                        <Bot size={20}/>
                      </AvatarFallback>
                    </Avatar>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className='p-6 pt-4'>
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or speak your message..."
                disabled={isLoading}
              />
               <Button type="button" variant={isListening ? 'destructive' : 'outline'} size="icon" onClick={toggleListening} disabled={isLoading}>
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span className="sr-only">{isListening ? 'Stop Listening' : 'Start Listening'}</span>
              </Button>
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

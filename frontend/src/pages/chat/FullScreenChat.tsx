import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/src/components/ui/!to-migrate/button';
import { Input } from '@/src/components/ui/!to-migrate/input';
import { ScrollArea } from '@/src/components/ui/!to-migrate/scroll-area';
import { Send, Loader2, X, Minimize2 } from 'lucide-react';
import { getAIFeedback } from '@/src/services/ai';
import getHistory from '@/src/api/message/requests/getHistory';
import { Conversation, ApiMessage } from '@/src/api/message/utils/types';

interface FullscreenChatProps {
  onClose: () => void;
  initialMessage?: string;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function FullscreenChat({ onClose, initialMessage, setIsFullscreen }: FullscreenChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentInitialMessage = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const sendInitialMessage = async () => {
      if (initialMessage && messages.length === 0 && !hasSentInitialMessage.current) {
        hasSentInitialMessage.current = true;
        await handleSend(initialMessage);
      }
    };

    sendInitialMessage();
  }, [initialMessage]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory();

        // Map the conversation data to the Message format
        const allMessages: Message[] = [];
        response.forEach((conversation: Conversation) => {
          conversation.messages.forEach((msg: ApiMessage) => {
            allMessages.push({
              role: msg.role,
              content: msg.content
            });
          });
        });

        setMessages(allMessages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage = textToSend;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const userData = {
        age: sessionStorage.getItem('age') || '',
        cycleLength: sessionStorage.getItem('cycleLength') || '',
        periodDuration: sessionStorage.getItem('periodDuration') || '',
        flowHeaviness: sessionStorage.getItem('flowLevel') || '',
        painLevel: sessionStorage.getItem('painLevel') || '',
        symptoms: JSON.parse(sessionStorage.getItem('symptoms') || '[]')
      };

      const aiResponse = await getAIFeedback(userData, userMessage);
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I apologize, but I'm having trouble processing your request right now. Please try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex w-full flex-col bg-white dark:bg-gray-900">
      <div className="container mx-auto flex h-full max-w-6xl flex-col rounded-lg border border-gray-200 p-0 shadow-lg dark:border-slate-800">
        <header className="flex items-center justify-between rounded-t-lg border-b bg-gradient-to-r from-pink-50 to-white p-4 dark:from-gray-900 dark:to-black">
          <h1 className="text-lg font-bold text-pink-600">Chat with Dottie</h1>
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(false)}
              className="rounded-full hover:bg-pink-100"
            >
              <Minimize2 className="h-4 w-4 text-pink-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-pink-100"
            >
              <X className="h-4 w-4 text-pink-600" />
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fadeIn`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      message.role === 'user'
                        ? 'bg-pink-600 text-white'
                        : 'border border-gray-100 bg-gray-50 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex animate-fadeIn justify-start">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex gap-2 rounded-b-lg border-t bg-white p-4 dark:bg-gray-900">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              className="rounded-full border-gray-200 focus:border-pink-300 focus:ring-pink-200"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading}
              className="rounded-full bg-pink-600 text-white hover:bg-pink-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

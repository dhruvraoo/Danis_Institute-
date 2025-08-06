import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  User,
  Bot,
  BookOpen,
  School,
  HelpCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const quickQuestions = [
  {
    icon: School,
    question: "How do I apply for admission?",
    category: "Admissions",
  },
  {
    icon: BookOpen,
    question: "What courses do you offer?",
    category: "Courses",
  },
  {
    icon: HelpCircle,
    question: "How do I access my dashboard?",
    category: "Website Help",
  },
  {
    icon: Zap,
    question: "What are the fee structures?",
    category: "Fees",
  },
];

const botResponses: Record<string, string> = {
  "how do i apply for admission":
    "To apply for admission at DaNi's Institute of Science, click the 'Sign Up' button in the top navigation and fill out the student registration form. You'll need to provide your full name, email, select your class (9th-12th), and choose your subjects. For classes 11th and 12th, note that Math and Biology are mutually exclusive.",

  "what courses do you offer":
    "We offer comprehensive programs for grades 9th-12th including:\n• Foundation courses (9th-10th): Math, Science, Social Studies, English\n• Science courses (11th-12th): PCM and PCB streams\n• Competitive exam preparation: IIT-JEE, NEET, GUJCET\n\nVisit our Courses page for detailed information about each program.",

  "how do i access my dashboard":
    "After registration and login, you'll be directed to your role-specific dashboard:\n• Students: Access marks, performance graphs, practice questions, and book recommendations\n• Teachers: Manage student data, grades, and view feedback\n• Principal: Oversee teachers, students, and analytics\n• Admin: Handle attendance and system administration",

  "what are the fee structures":
    "For detailed fee information, please contact our admissions office. Fee structures vary based on the program and grade level. We offer various payment plans and scholarship opportunities for deserving students. You can reach out through our Contact page or speak with our admissions counselor.",

  default:
    "I'm here to help with questions about DaNi's Institute of Science, our courses, admissions, and website navigation. You can ask me about:\n• Admission process and requirements\n• Course offerings and curriculum\n• How to use website features\n• Fee structures and scholarships\n• Student life and facilities\n\nWhat would you like to know?",
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your DIS assistant. I can help you with questions about our institute, courses, admissions, and website features. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    for (const [key, response] of Object.entries(botResponses)) {
      if (key !== "default" && lowerMessage.includes(key)) {
        return response;
      }
    }

    // Check for keywords
    if (
      lowerMessage.includes("course") ||
      lowerMessage.includes("program") ||
      lowerMessage.includes("subject")
    ) {
      return botResponses["what courses do you offer"];
    }
    if (
      lowerMessage.includes("admission") ||
      lowerMessage.includes("apply") ||
      lowerMessage.includes("registration")
    ) {
      return botResponses["how do i apply for admission"];
    }
    if (
      lowerMessage.includes("dashboard") ||
      lowerMessage.includes("login") ||
      lowerMessage.includes("access")
    ) {
      return botResponses["how do i access my dashboard"];
    }
    if (
      lowerMessage.includes("fee") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("price")
    ) {
      return botResponses["what are the fee structures"];
    }
    if (lowerMessage.includes("faculty") || lowerMessage.includes("teacher")) {
      return "Our institute has 150+ expert faculty members with Ph.D. qualifications. You can learn more about our faculty team on the Faculty page, where you'll find detailed profiles of our professors across different departments including Computer Science, Mathematics, Physics, Chemistry, and Engineering.";
    }
    if (lowerMessage.includes("event") || lowerMessage.includes("activity")) {
      return "We organize various events throughout the year including debates, MUNs, workshops, conferences, and social impact programs. Check our Events page to see upcoming events where you can register, and completed events with photo galleries.";
    }
    if (lowerMessage.includes("news") || lowerMessage.includes("update")) {
      return "Stay updated with the latest news and announcements on our News page. We regularly share academic updates, UGC/AICTE notifications, and institute news. You can also use our AI-powered news verification tool to check the authenticity of news articles.";
    }

    return botResponses["default"];
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(
      () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getBotResponse(text),
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1000,
    );
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-40 flex items-center justify-center transition-colors"
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.3 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">DIS Assistant</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Questions */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Quick questions:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(q.question)}
                    className="p-2 text-left text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <q.icon className="h-3 w-3 text-blue-600" />
                    <span className="truncate">{q.category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <div className="flex items-start space-x-2 mb-1">
                      {message.sender === "bot" && (
                        <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                      )}
                      {message.sender === "user" && (
                        <User className="h-4 w-4 mt-0.5" />
                      )}
                      <span className="text-xs font-medium">
                        {message.sender === "bot" ? "DIS Assistant" : "You"}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {message.text}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 text-sm dark:bg-gray-700 dark:border-gray-600"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputValue.trim() || isTyping}
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Loader2,
  Trash2,
  Minimize2,
  Maximize2,
  Sparkles,
  User,
  Plus,
  MessageSquare,
  History,
  ChevronLeft,
  ChevronRight,
  Trash,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const OUT_OF_SCOPE_MESSAGE =
  "I don't have information about that. I am only the ASTU MSJ Summer Bootcamp Assistant.";

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);



  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);



  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");

  const isAuthenticated = Boolean(token);

  let currentUserId = null;

  try {
    const user = storedUser ? JSON.parse(storedUser) : null;
    currentUserId = user?._id || user?.id || null;
  } catch {
    currentUserId = null;
  }



  const previousUserIdRef = useRef(currentUserId);

  useEffect(() => {
    if (previousUserIdRef.current !== currentUserId) {
      setMessages([]);
      setCurrentChatId(null);
      setInput("");
      setChats([]);

      previousUserIdRef.current = currentUserId;
    }
  }, [currentUserId]);


  const getChatId = (chat) => {
    return chat?._id || chat?.id || chat?.chatId;
  };

  const getChatTitle = (chat) => {
    return chat?.title || chat?.name || chat?.subject || "New conversation";
  };

  const normalizeMessage = (message, index = 0) => {
    return {
      id: message?._id || message?.id || `message-${Date.now()}-${index}`,

      role:
        message?.role ||
        message?.sender ||
        (message?.isUser ? "user" : "assistant"),

      content: message?.content || message?.message || message?.text || "",

      sources: message?.sources || [],
      error: message?.error || false,
    };
  };

  const normalizeChats = (data) => {
    const possibleChats =
      data?.chats || data?.data?.chats || data?.data || data || [];

    return Array.isArray(possibleChats) ? possibleChats : [];
  };

 

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, open, minimized]);



  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, minimized, currentChatId]);


  const loadChatHistory = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setHistoryLoading(true);

      const response = await api.get("/chat");

      const chatList = normalizeChats(response.data);

      setChats(chatList);

      if (chatList.length === 0) {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };


  useEffect(() => {
    if (open && isAuthenticated) {
      loadChatHistory();
    }
  }, [open, isAuthenticated]);

 

  const loadChat = async (chatId) => {
    if (!isAuthenticated || !chatId) {
      return;
    }

    try {
      setChatLoading(true);

      const response = await api.get(`/chat/${chatId}`);

      const data = response.data;

      const chat = data?.chat || data?.data?.chat || data?.data || data;

      const chatMessages =
        chat?.messages || data?.messages || data?.data?.messages || [];

      setCurrentChatId(chatId);

      setMessages(
        Array.isArray(chatMessages)
          ? chatMessages.map((message, index) =>
              normalizeMessage(message, index),
            )
          : [],
      );
    } catch (error) {
      console.error("Failed to load chat:", error);

      toast.error(
        error.response?.data?.message || "Unable to load this conversation.",
      );
    } finally {
      setChatLoading(false);
    }
  };

  

  const createNewChat = async () => {
    if (!isAuthenticated || creatingChat) {
      return;
    }

    try {
      setCreatingChat(true);

      const response = await api.post("/chat", {
        title: "New conversation",
      });

      const data = response.data;

      const newChat = data?.chat || data?.data?.chat || data?.data || data;

      const newChatId = getChatId(newChat);

      if (!newChatId) {
        throw new Error("Chat was created but no chat ID was returned.");
      }

      setChats((prev) => [newChat, ...prev]);

      setCurrentChatId(newChatId);

      setMessages([]);

      setInput("");

      setHistoryOpen(true);

      toast.success("New chat created");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Failed to create chat:", error);

      toast.error(
        error.response?.data?.message || "Unable to create a new chat.",
      );
    } finally {
      setCreatingChat(false);
    }
  };

 

  const deleteChat = async (event, chatId) => {
    event?.stopPropagation();

    if (!chatId) {
      return;
    }

    try {
      await api.delete(`/chat/${chatId}`);

      setChats((prev) => prev.filter((chat) => getChatId(chat) !== chatId));

      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }

      toast.success("Chat deleted");
    } catch (error) {
      console.error("Failed to delete chat:", error);

      toast.error(
        error.response?.data?.message || "Unable to delete this chat.",
      );
    }
  };



  const sendMessage = async (event) => {
    event?.preventDefault();

    const cleanMessage = input.trim();

    if (!cleanMessage || loading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: cleanMessage,
      sources: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let response;

      

      if (!isAuthenticated) {
        response = await api.post("/chat/public", {
          message: cleanMessage,
        });
      }

     
      else {
        let chatId = currentChatId;

        if (!chatId) {
          try {
            const createResponse = await api.post("/chat", {
              title:
                cleanMessage.length > 50
                  ? `${cleanMessage.substring(0, 50)}...`
                  : cleanMessage,
            });

            const createData = createResponse.data;

            const newChat =
              createData?.chat ||
              createData?.data?.chat ||
              createData?.data ||
              createData;

            chatId = getChatId(newChat);

            if (!chatId) {
              throw new Error("Chat creation did not return a chat ID.");
            }

            setCurrentChatId(chatId);

            setChats((prev) => [newChat, ...prev]);
          } catch (createError) {
            console.error("Failed to automatically create chat:", createError);

            throw createError;
          }
        }

        response = await api.post(`/chat/${chatId}/messages`, {
          message: cleanMessage,
        });
      }

     

      const data = response.data;

      const answer =
        data?.assistantMessage?.content ||
        data?.answer ||
        data?.data?.answer ||
        data?.message?.answer ||
        data?.data?.message?.answer ||
        OUT_OF_SCOPE_MESSAGE;

      const sources =
        data?.assistantMessage?.sources ||
        data?.sources ||
        data?.data?.sources ||
        data?.message?.sources ||
        [];

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
        sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (isAuthenticated) {
        loadChatHistory();
      }
    } catch (error) {
      console.error("AI Assistant error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Unable to connect to the AI assistant.";

      toast.error(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, something went wrong while processing your question.",
          sources: [],
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };



  const clearChat = () => {
    setMessages([]);
  };



  const formatChatDate = (chat) => {
    const date = chat?.updatedAt || chat?.createdAt || chat?.date;

    if (!date) {
      return "";
    }

    try {
      return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  

  return (
    <>
      
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            fixed
            bottom-6
            right-6
            z-9999
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[#344f59]
            text-white
            shadow-2xl
            transition-all
            duration-300
            hover:scale-110
            hover:bg-[#2b434c]
            focus:outline-none
            focus:ring-4
            focus:ring-[#344f59]/30
          "
          aria-label="Open AI Assistant"
        >
          <Bot size={29} />

          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-emerald-500
              text-[10px]
              font-bold
              text-white
              ring-2
              ring-white
            "
          >
            AI
          </span>
        </button>
      )}

  

      {open && (
        <div
          className="
            fixed
            bottom-4
            right-4
            z-9999
            flex
            h-155
            max-h-[calc(100vh-32px)]
            w-110
            max-w-[calc(100vw-32px)]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
            sm:bottom-6
            sm:right-6
          "
        >
         

          <div
            className="
              flex
              items-center
              justify-between
              bg-[#344f59]
              px-4
              py-3
              text-white
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/15
                  ring-1
                  ring-white/10
                "
              >
                <Bot size={22} />
              </div>

              <div>
                <h3 className="text-sm font-semibold">ASTU MSJ AI Assistant</h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Online
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMinimized((prev) => !prev)}
                className="
                  rounded-lg
                  p-2
                  text-slate-200
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
                aria-label={minimized ? "Maximize" : "Minimize"}
              >
                {minimized ? <Maximize2 size={17} /> : <Minimize2 size={17} />}
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
                  rounded-lg
                  p-2
                  text-slate-200
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
                aria-label="Close AI Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!minimized && (
            <div className="flex min-h-0 flex-1">
      

              {isAuthenticated && historyOpen && (
                <aside
                  className="
                    flex
                    min-h-0
                    w-38.75
                    shrink-0
                    flex-col
                    border-r
                    border-slate-200
                    bg-white
                  "
                >
                 

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-b
                      border-slate-200
                      px-3
                      py-3
                    "
                  >
                    <div className="flex items-center gap-2">
                      <History size={16} className="text-[#344f59]" />

                      <span className="text-sm font-semibold text-slate-800">
                        History
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setHistoryOpen(false)}
                      className="
                        rounded-md
                        p-1.5
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-[#344f59]
                      "
                      aria-label="Hide chat history"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  </div>

                 

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={createNewChat}
                      disabled={creatingChat}
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#344f59]
                        px-3
                        py-2.5
                        text-xs
                        font-semibold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#2b434c]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {creatingChat ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Plus size={15} />
                      )}
                      New Chat
                    </button>
                  </div>

             
                  <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2
                          size={20}
                          className="animate-spin text-slate-400"
                        />
                      </div>
                    ) : chats.length === 0 ? (
                      <div className="px-2 py-8 text-center">
                        <MessageSquare
                          size={26}
                          className="mx-auto mb-2 text-slate-300"
                        />

                        <p className="text-[11px] font-medium text-slate-500">
                          No conversations
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                          Start a new chat to save your conversation.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {chats.map((chat) => {
                          const chatId = getChatId(chat);

                          const selected = chatId === currentChatId;

                          return (
                            <div
                              key={chatId}
                              className={`
                                group
                                flex
                                items-center
                                gap-1
                                rounded-xl
                                transition
                                ${
                                  selected
                                    ? "bg-[#344f59]/10"
                                    : "hover:bg-slate-50"
                                }
                              `}
                            >
                              <button
                                type="button"
                                onClick={() => loadChat(chatId)}
                                className="
                                  min-w-0
                                  flex-1
                                  px-2.5
                                  py-2.5
                                  text-left
                                "
                              >
                                <div className="flex items-start gap-2">
                                  <MessageSquare
                                    size={13}
                                    className={`
                                      mt-0.5
                                      shrink-0
                                      ${
                                        selected
                                          ? "text-[#344f59]"
                                          : "text-slate-400"
                                      }
                                    `}
                                  />

                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={`
                                        truncate
                                        text-[11px]
                                        font-medium
                                        ${
                                          selected
                                            ? "text-[#344f59]"
                                            : "text-slate-600"
                                        }
                                      `}
                                    >
                                      {getChatTitle(chat)}
                                    </p>

                                    <p className="mt-0.5 text-[9px] text-slate-400">
                                      {formatChatDate(chat)}
                                    </p>
                                  </div>
                                </div>
                              </button>

                             

                              <button
                                type="button"
                                onClick={(event) => deleteChat(event, chatId)}
                                className="
                                  mr-1
                                  rounded-md
                                  p-1.5
                                  text-slate-300
                                  opacity-0
                                  transition
                                  hover:bg-red-50
                                  hover:text-red-500
                                  group-hover:opacity-100
                                "
                                aria-label="Delete chat"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </aside>
              )}

              

              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
               

                {isAuthenticated && !historyOpen && (
                  <div className="flex items-center border-b border-slate-200 bg-white px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setHistoryOpen(true)}
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-lg
                        px-2
                        py-1.5
                        text-xs
                        font-medium
                        text-slate-500
                        transition
                        hover:bg-slate-100
                        hover:text-[#344f59]
                      "
                    >
                      <ChevronRight size={15} />
                      <History size={14} />
                      History
                    </button>
                  </div>
                )}

               

                <div
                  className="
                    min-h-0
                    flex-1
                    overflow-y-auto
                    bg-slate-50
                    px-4
                    py-4
                  "
                >
                 

                  {chatLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2
                          size={24}
                          className="animate-spin text-[#344f59]"
                        />

                        <span className="text-xs text-slate-400">
                          Loading conversation...
                        </span>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                 

                    <div className="flex h-full items-center justify-center">
                      <div className="max-w-70 text-center">
                        <div
                          className="
                            mx-auto
                            mb-3
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#344f59]
                            text-white
                            shadow-lg
                          "
                        >
                          <Sparkles size={24} />
                        </div>

                        <h4 className="text-sm font-semibold text-slate-800">
                          ASTU MSJ AI Assistant
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Ask about the ASTU MSJ Summer Bootcamp, attendance,
                          assignments, requirements, and other available
                          documentation.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 flex ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex max-w-[88%] gap-2 ${
                              message.role === "user"
                                ? "flex-row-reverse"
                                : "flex-row"
                            }`}
                          >
                           

                            <div
                              className={`
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                ${
                                  message.role === "user"
                                    ? "bg-slate-200 text-slate-700"
                                    : "bg-[#344f59] text-white"
                                }
                              `}
                            >
                              {message.role === "user" ? (
                                <User size={15} />
                              ) : (
                                <Bot size={16} />
                              )}
                            </div>

                           

                            <div>
                              <div
                                className={`
                                  rounded-2xl
                                  px-3.5
                                  py-2.5
                                  text-sm
                                  leading-6
                                  ${
                                    message.role === "user"
                                      ? "rounded-tr-md bg-[#344f59] text-white"
                                      : "rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                                  }
                                `}
                              >
                                <div className="whitespace-pre-wrap">
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                   

                      {loading && (
                        <div className="mb-4 flex justify-start">
                          <div className="flex items-center gap-2">
                            <div
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-full
                                bg-[#344f59]
                                text-white
                              "
                            >
                              <Bot size={16} />
                            </div>

                            <div
                              className="
                                rounded-2xl
                                rounded-tl-md
                                border
                                border-slate-200
                                bg-white
                                px-4
                                py-3
                                shadow-sm
                              "
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />

                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:100ms]" />

                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:200ms]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

               

                <div className="border-t border-slate-200 bg-white p-3">
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={clearChat}
                      disabled={messages.length === 0 || loading}
                      className="
                        flex
                        items-center
                        gap-1
                        rounded-md
                        px-2
                        py-1
                        text-[11px]
                        font-medium
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-[#344f59]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <Trash2 size={12} />
                      Clear
                    </button>
                  </div>

                  <form
                    onSubmit={sendMessage}
                    className="
                      flex
                      items-end
                      gap-2
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      p-2
                      focus-within:border-[#344f59]/50
                      focus-within:ring-2
                      focus-within:ring-[#344f59]/10
                    "
                  >
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage(event);
                        }
                      }}
                      placeholder={
                        isAuthenticated && !currentChatId
                          ? "Start a new conversation..."
                          : "Ask something..."
                      }
                      rows={1}
                      disabled={loading}
                      className="
                        max-h-24
                        min-h-10
                        flex-1
                        resize-none
                        border-0
                        bg-transparent
                        px-2
                        py-2
                        text-sm
                        text-slate-700
                        outline-none
                        placeholder:text-slate-400
                      "
                    />

                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#344f59]
                        text-white
                        transition
                        hover:bg-[#2b434c]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                      aria-label="Send message"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </form>

             

                  {!isAuthenticated && (
                    <p className="mt-2 text-center text-[10px] text-slate-400">
                      Guest mode · Chat history is not saved
                    </p>
                  )}

                  

                  {isAuthenticated && (
                    <p className="mt-2 text-center text-[10px] text-slate-400">
                      Your conversations are saved to your account
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIAssistant;

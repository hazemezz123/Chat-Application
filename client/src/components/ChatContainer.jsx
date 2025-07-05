import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./Skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { MessageCircle } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessageLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);

  // Automatically scroll to the bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Only fetch messages if a user is selected
    subscribeToMessages();
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    unsubscribeFromMessages,
    subscribeToMessages,
  ]);

  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      {messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
            >
              <div className=" chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1 flex items-center gap-2">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
                <button
                  className="text-xs text-blue-500 hover:underline ml-2"
                  onClick={() => setReplyTo(message)}
                  title="Reply"
                >
                  Reply
                </button>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.replyTo && (
                  <div className="bg-base-200 rounded p-2 mb-1 text-xs text-base-content/70 border-l-4 border-blue-400">
                    <span className="font-semibold">Replying to:</span>{" "}
                    {message.replyTo.text ||
                      (message.replyTo.image ? "[Image]" : "")}
                    {message.replyTo.image && (
                      <img
                        src={message.replyTo.image}
                        alt="Replied Attachment"
                        className="sm:max-w-[100px] rounded-md mt-1"
                      />
                    )}
                  </div>
                )}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          ))}
          {/* Anchor to scroll to */}
          <div ref={messageEndRef} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="text-lg text-base-content/60">
            <MessageCircle className="size-16 mx-auto text-base-content/20 mb-4 animate-pulse" />
            <p className="font-semibold text-xl">No Messages Yet</p>
            <p className="mt-1">
              Send a message to start a conversation with{" "}
              <span className="font-semibold">{selectedUser?.fullName}</span>.
            </p>
          </div>
        </div>
      )}
      {/* Show reply preview above input */}
      {replyTo && (
        <div className="flex items-center bg-base-200 p-2 rounded mb-2 mx-4">
          <span className="text-xs text-base-content/70 mr-2">
            Replying to:
          </span>
          <span className="truncate text-xs font-semibold">
            {replyTo.text || "[Image]"}
          </span>
          <button
            className="ml-auto text-xs text-red-500 hover:underline"
            onClick={() => setReplyTo(null)}
            title="Cancel reply"
          >
            Cancel
          </button>
        </div>
      )}
      <MessageInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
    </div>
  );
};

export default ChatContainer;

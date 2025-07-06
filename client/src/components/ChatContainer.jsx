import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./Skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { MessageCircle } from "lucide-react";

// Debounce helper
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const ChatContainer = () => {
  const { messages, getMessages, isMessageLoading, selectedUser } =
    useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);

  // Automatically scroll to the bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Only fetch messages if a user is selected
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Mark messages as seen automatically if user is in chat and messages update
  const markAsSeen = useRef(
    debounce((socket, senderId, receiverId, unseenCount) => {
      if (unseenCount > 0) {
        socket.emit("markMessagesAsSeen", { senderId, receiverId });
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (!selectedUser?._id) return;
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket || !authUser?._id) return;
    // Only mark as seen if there are unseen messages from the selected user
    const unseenCount = messages.filter(
      (msg) =>
        msg.senderId === selectedUser._id &&
        msg.receiverId === authUser._id &&
        !msg.isSeen
    ).length;
    markAsSeen(socket, selectedUser._id, authUser._id, unseenCount);
  }, [messages, selectedUser?._id]);

  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full w-full">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full w-full chat-container">
      <ChatHeader />
      {messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-4 smooth-scroll chat-messages max-w-full">
          {messages.map((message, index) => (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              layout
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
              <div className="chat-bubble flex flex-col max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg">
                {message.replyTo && (
                  <div className="bg-base-200 rounded p-2 mb-1 text-xs text-base-content/70 border-l-4 border-blue-400">
                    <span className="font-semibold">Replying to:</span>{" "}
                    <span className="break-words">
                      {message.replyTo.text ||
                        (message.replyTo.image ? "[Image]" : "")}
                    </span>
                    {message.replyTo.image && (
                      <img
                        src={message.replyTo.image}
                        alt="Replied Attachment"
                        className="max-w-[80px] sm:max-w-[100px] rounded-md mt-1"
                      />
                    )}
                  </div>
                )}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="max-w-[150px] sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && (
                  <p className="break-words whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </p>
                )}
                {/* Seen/Sent indicator for own messages */}
                {message.senderId === authUser._id && (
                  <div className="text-xs mt-1 text-right">
                    {message.isSeen ? (
                      <span className="text-green-600 font-bold">✓✓</span>
                    ) : (
                      <span className="text-gray-400">✓</span>
                    )}
                  </div>
                )}
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
        <div className="flex items-start bg-base-200 p-2 rounded mb-2 mx-3 lg:mx-4 gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-base-content/70 block mb-1">
              Replying to:
            </span>
            <span className="text-xs font-semibold text-base-content break-words line-clamp-2">
              {replyTo.text || "[Image]"}
            </span>
          </div>
          <button
            className="text-xs text-red-500 hover:underline flex-shrink-0 p-1"
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

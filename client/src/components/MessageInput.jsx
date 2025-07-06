import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useFriendsStore } from "../store/useFriendsStore";
import { Image, Send, X, Shield } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = ({ replyTo, onCancelReply }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const { getRelationshipStatus } = useFriendsStore();
  
  // Check if the selected user is blocked
  const relationshipStatus = selectedUser ? getRelationshipStatus(selectedUser._id) : 'none';
  const isBlocked = relationshipStatus === 'blocked';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Check if user is blocked
    if (isBlocked) {
      toast.error("Cannot send message to blocked user");
      return;
    }
    
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        replyTo: replyTo
          ? {
              _id: replyTo._id,
              text: replyTo.text,
              image: replyTo.image,
            }
          : undefined,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onCancelReply) onCancelReply();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Show blocked user message
  if (isBlocked) {
    return (
      <div className="p-3 lg:p-4 w-full relative bg-base-100 border-t border-base-300">
        <div className="flex items-center justify-center p-4 bg-error/10 rounded-lg border border-error/20">
          <Shield className="w-5 h-5 text-error mr-2" />
          <span className="text-error font-medium">Cannot send messages to blocked users</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-4 w-full relative bg-base-100 border-t border-base-300">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg text-base"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`btn btn-circle btn-sm lg:btn-md
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm lg:btn-md btn-circle btn-primary"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;

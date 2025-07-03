import { MessageSquare } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const NoChatSelected = () => {
  const { authUser } = useAuthStore();

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-4">
        {/* Avatar Display */}
        <div className="avatar">
          <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="Your avatar"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-bold">
          Welcome, <span className="text-primary">{authUser?.fullName}!</span>
        </h2>
        <p className="text-base-content/70">
          You're all set to start connecting.
        </p>
        <div className="flex items-center justify-center gap-2 text-base-content/60 mt-4">
          <MessageSquare className="w-5 h-5" />
          <span>Select a conversation from your contacts to begin.</span>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;

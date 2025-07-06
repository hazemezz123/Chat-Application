import React, { useEffect, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import SideBar from "../components/SideBar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  // Handle keyboard open/close on mobile
  const handleViewportChange = useCallback(() => {
    if (isMobile) {
      const viewport = window.visualViewport;
      if (viewport) {
        const isKeyboardOpen = viewport.height < window.innerHeight * 0.75;
        document.body.classList.toggle('keyboard-open', isKeyboardOpen);
      }
    }
  }, [isMobile]);
  
  useEffect(() => {
    subscribeToMessages();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Handle viewport changes for mobile keyboard
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      unsubscribeFromMessages();
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
      document.body.classList.remove('keyboard-open');
    };
  }, [subscribeToMessages, unsubscribeFromMessages, handleViewportChange]);
  
  return (
    <div className="min-h-screen min-h-[100dvh] bg-base-200 w-full overflow-x-hidden">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="h-[100dvh] pt-16 w-full mobile-container overflow-hidden">
          {selectedUser ? (
            <div className="h-full w-full flex flex-col">
              <ChatContainer />
            </div>
          ) : (
            <div className="h-full w-full">
              <SideBar />
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex items-center justify-center pt-20 px-4 min-h-[calc(100dvh-5rem)]">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)] h-[calc(100dvh-8rem)]">
            <div className="flex h-full rounded-lg overflow-hidden">
              <SideBar />
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

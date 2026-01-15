import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const FloatingChatDock = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const me = useSelector((state) => state.auth?.userInfo);
  const { conversations = [], loading } = useSelector(
    (state) => state.chat || {}
  );

  // Don't show on login or full chat page
  if (!me || location.pathname === "/chat") return null;

  const handleOpenConversation = (conv) => {
    // Option 1: just go to /chat and let ChatApp handle active conversation
    navigate("/chat", { state: { activeConversationId: conv.id } });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-xl bg-[#689F38] text-white hover:opacity-90 transition text-sm "
        >
          💬 Messages
        </button>
      )}

      {open && (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="font-semibold text-sm">Messages</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/chat")}
                className="text-xs text-[#689F38] hover:underline"
              >
                Open full
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* Recent conversations list */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="p-4 text-xs text-gray-500 text-center">
                Loading messages…
              </div>
            )}

            {!loading && conversations.length === 0 && (
              <div className="p-4 text-xs text-gray-500 text-center">
                No recent messages yet.
              </div>
            )}

            {!loading &&
              conversations.length > 0 &&
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleOpenConversation(conv)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                >
                  <img
                    src={conv.avatar || "/profile.png"}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {conv.name}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-4 rounded-full bg-green-500 text-[10px] text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatDock;

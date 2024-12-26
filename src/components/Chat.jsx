import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import Header from "./Header"; // Import the Header component
import EmojiPicker from "emoji-picker-react"; // Import the EmojiPicker component from the package

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State to control emoji picker visibility

  // Fetch all users from Firestore
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let usersList = [];
      snapshot.forEach((doc) => {
        if (doc.data().uid !== auth.currentUser.uid) {
          usersList.push({ ...doc.data(), id: doc.id });
        }
      });
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  // Fetch messages for the selected user
  useEffect(() => {
    if (selectedUser) {
      const chatId = getChatId(auth.currentUser.uid, selectedUser.uid);
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let msgs = [];
        snapshot.forEach((doc) => {
          msgs.push({ ...doc.data(), id: doc.id });
        });
        setMessages(msgs);
      });

      return () => unsubscribe();
    }
  }, [selectedUser]);

  // Generate a unique chat ID based on the two users' UIDs
  const getChatId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  // Handle sending a message
  const handleSend = async () => {
    if (newMessage.trim() === "" || !selectedUser) return;

    const chatId = getChatId(auth.currentUser.uid, selectedUser.uid);
    const messagesRef = collection(db, "chats", chatId, "messages");

    await addDoc(messagesRef, {
      text: newMessage,
      sender: auth.currentUser.uid,
      receiver: selectedUser.uid,
      timestamp: new Date(),
    });

    setNewMessage("");
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji); // Append the selected emoji to the message
    setShowEmojiPicker(false); // Hide emoji picker after selection
  };

  // Handle Enter key press for sending the message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent the default behavior (like adding a new line)
      handleSend(); // Call the send function
    }
  };

  // Filter users based on the search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers([]);
    } else {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) // Changed to use name instead of email
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to login or home page after logout
      window.location.href = "/"; // Or use navigate if you are using react-router
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header onLogout={handleLogout} /> {/* Use the Header component here */}

      {/* Main Chat Area */}
      <div className="flex flex-1 md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-gray-800 p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          />

          {/* Search Suggestions (For small screens only) */}
          {searchTerm && filteredUsers.length > 0 && (
            <div className="bg-gray-700 rounded mt-2 md:hidden">
              {filteredUsers.map((user) => (
                <div
                  key={user.uid}
                  className="p-2 cursor-pointer hover:bg-gray-600"
                  onClick={() => setSelectedUser(user)}
                >
                  {user.name} {/* Use name instead of email */}
                </div>
              ))}
            </div>
          )}

          {/* Full User List (For large screens only) */}
          <div className="hidden md:block mt-4">
            {users.map((user) => (
              <div
                key={user.uid}
                className={`p-2 cursor-pointer hover:bg-gray-600 ${
                  selectedUser?.uid === user.uid ? "bg-blue-600" : "bg-gray-700"
                }`}
                onClick={() => setSelectedUser(user)}
              >
                {user.name} {/* Use name instead of email */}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="w-full md:w-2/3 flex flex-col overflow-y-auto custom-scrollbar"
          style={{ maxHeight: "calc(100vh - 80px)" }} // Adjust height so it's scrollable without affecting layout
        >
          {selectedUser ? (
            <>
              {/* Profile Section */}
              <div className="p-4 bg-gray-800 flex items-center space-x-4">
                {/* User profile */}
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white">
                  {selectedUser.name[0].toUpperCase()}
                </div>
                <div className="text-lg font-bold">{selectedUser.name}</div> {/* Display name here */}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 max-w-xs rounded-lg ${
                      msg.sender === auth.currentUser.uid
                        ? "bg-blue-600 self-end ml-auto text-right"
                        : "bg-gray-700 self-start mr-auto text-left"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-gray-800 flex relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown} // Handle Enter key press
                  placeholder="Type your message..."
                  className="flex-1 p-2 rounded bg-gray-700 text-white"
                />
                <button
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className="ml-4 text-xl"
                >
                  😊
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 z-10">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}

                <button
                  onClick={handleSend}
                  className="ml-4 bg-blue-500 p-2 rounded hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

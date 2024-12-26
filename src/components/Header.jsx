import React from "react";
import { auth } from "../firebase";

const Header = ({ onLogout }) => {
  const displayName = auth.currentUser?.displayName || "User";

  return (
    <div className="bg-gray-800 p-4 flex items-center justify-between w-full shadow-md">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
          {displayName[0].toUpperCase()}
        </div>
        <div className="text-xl font-semibold text-white">{displayName}</div>
      </div>
      <button
        onClick={onLogout}
        className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-white"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;

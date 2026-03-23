import React from "react";
import { useNavigate } from "react-router-dom";

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="
  inline-flex
  items-center
  self-start
  border border-blue-600
  text-blue-600
  px-4 py-2
  rounded
  hover:bg-blue-50
  hover:text-blue-700
  transition-colors
  cursor-pointer
  shadow-sm
"
    >
      Home
    </button>
  );
};

export default HomeButton;

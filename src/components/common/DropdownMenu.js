import React, { useState, useRef, useEffect } from "react";

const DropdownMenu = ({ trigger, children }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
  >
    {children}
  </button>
);

const DropdownMenuTrigger = ({ children, asChild, setOpen, open }) => {
  return (
    <div
      onClick={() => setOpen(!open)}
      className={asChild ? "" : "cursor-pointer"}
    >
      {children}
    </div>
  );
};

const DropdownMenuContent = ({ children, open, className }) => {
  if (!open) return null;
  return (
    <div
      className={`absolute right-0 mt-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 ${className}`}
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
};

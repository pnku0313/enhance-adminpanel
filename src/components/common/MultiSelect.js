"use client";

import { useState } from "react";

const MultiSelect = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (option) => {
    const isSelected = selected.some((item) => item.id === option.id);
    if (isSelected) {
      onChange(selected.filter((item) => item.id !== option.id));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeItem = (optionId) => {
    onChange(selected.filter((item) => item.id !== optionId));
  };

  return (
    <div className="multi-select">
      <div className="multi-select-input" onClick={() => setIsOpen(!isOpen)}>
        {selected.length > 0 ? (
          <div className="selected-items">
            {selected.map((item) => (
              <span key={item.id} className="selected-item">
                {item.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="remove-item"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="multi-select-dropdown">
          {options.map((option) => (
            <div
              key={option.id}
              className={`dropdown-item ${
                selected.some((item) => item.id === option.id) ? "selected" : ""
              }`}
              onClick={() => handleToggle(option)}
            >
              <input
                type="checkbox"
                checked={selected.some((item) => item.id === option.id)}
                readOnly
              />
              <span>{option.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

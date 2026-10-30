"use client";

const ToggleButton = ({
  checked,
  onChange,
  activeLabel = "Yes",
  inactiveLabel = "No",
}) => {
  return (
    <button
      type="button"
      className={`toggle-button ${checked ? "active" : ""}`}
      onClick={() => onChange(!checked)}
    >
      {checked ? activeLabel : inactiveLabel}
    </button>
  );
};

export default ToggleButton;

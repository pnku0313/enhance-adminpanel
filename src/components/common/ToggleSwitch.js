"use client";

const ToggleSwitch = ({
  label,
  checked,
  onChange,
  activeLabel = "Yes",
  inactiveLabel = "No",
}) => {
  return (
    <div className="form-group">
      <label className="form-label d-block mb-2">{label}</label>
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider">{checked ? activeLabel : inactiveLabel}</span>
      </label>
    </div>
  );
};

export default ToggleSwitch;

import { ArrowRight } from "@phosphor-icons/react";

type ButtonProps = {
  children: string;
  onClick: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function Button({ children, disabled = false, onClick, type = "button" }: ButtonProps) {
  return (
    <button
      className="primary-button"
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {children}
      <ArrowRight aria-hidden="true" size={21} weight="regular" />
    </button>
  );
}

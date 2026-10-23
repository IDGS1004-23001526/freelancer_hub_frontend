import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyles =
    'py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#6e2c3e] hover:bg-[#5b2232] active:bg-[#481a27] text-white shadow-[0_6px_20px_-4px_rgba(110,44,62,0.35)]',
    secondary:
      'bg-white hover:bg-[#faf7f5] border border-[#e8deda] text-[#2b1b1e] shadow-2xs hover:shadow-xs',
    ghost: 'text-[#7d686d] hover:text-[#4a1c29]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

import React from 'react';

export default function Input({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  badge = null,
  rightLink = null,
  icon: Icon = null,
  rightAction = null,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {(label || badge || rightLink) && (
        <div className="flex justify-between items-center mb-1.5 px-1">
          {label && (
            <label htmlFor={id} className="text-xs font-semibold text-[#48202b]">
              {label}
            </label>
          )}
          {badge && <span className="text-[11px] font-medium text-[#9a868a]">{badge}</span>}
          {rightLink}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9a868a]">
            <Icon className="w-4 h-4 text-[#8a6871]" />
          </div>
        )}
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${
            rightAction ? 'pr-10' : 'pr-4'
          } py-2.5 bg-white border border-[#e8deda] rounded-xl text-xs md:text-sm text-[#2b1b1e] placeholder-[#b0a0a4] focus:outline-none focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e] transition-all shadow-xs`}
          {...props}
        />
        {rightAction && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
}

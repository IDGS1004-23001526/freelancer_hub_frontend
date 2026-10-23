import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast notification component styled according to the project's color palette
 * #5A0F24 (deep wine), #8C2C45 (crimson), #C68A8F (dusty rose), #F3EFE6 (cream), #C9B8A6 (sand)
 */
export default function Toast({
  message,
  title,
  type = 'success',
  duration = 4000,
  onClose,
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!duration || duration <= 0) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          if (onClose) onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, onClose]);

  const variants = {
    success: {
      container: 'bg-[#F3EFE6] border-[#8C2C45]/40 text-[#5A0F24] shadow-[0_10px_25px_-5px_rgba(90,15,36,0.18)]',
      iconBg: 'bg-[#8C2C45] text-[#F3EFE6]',
      Icon: CheckCircle2,
      barBg: 'bg-[#8C2C45]',
    },
    error: {
      container: 'bg-[#fff5f5] border-[#8C2C45] text-[#5A0F24] shadow-[0_10px_25px_-5px_rgba(140,44,69,0.22)]',
      iconBg: 'bg-[#8C2C45] text-white',
      Icon: AlertCircle,
      barBg: 'bg-[#8C2C45]',
    },
    info: {
      container: 'bg-[#F3EFE6] border-[#C9B8A6] text-[#5A0F24] shadow-[0_10px_25px_-5px_rgba(90,15,36,0.12)]',
      iconBg: 'bg-[#C68A8F] text-[#5A0F24]',
      Icon: Info,
      barBg: 'bg-[#C68A8F]',
    },
  };

  const currentVariant = variants[type] || variants.success;
  const VariantIcon = currentVariant.Icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-50 max-w-sm w-full transition-all duration-300 ease-out transform translate-y-0"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-sm ${currentVariant.container}`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${currentVariant.iconBg}`}
          >
            <VariantIcon className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 pr-2">
            {title && (
              <h4 className="text-xs font-bold tracking-tight text-[#5A0F24] mb-0.5">
                {title}
              </h4>
            )}
            <p className="text-xs text-[#5A0F24]/85 leading-snug">
              {message}
            </p>
          </div>

          {/* Close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[#8C2C45] hover:text-[#5A0F24] transition-colors p-1 rounded-lg hover:bg-[#C68A8F]/20"
              aria-label="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Animated progress bar */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C9B8A6]/30">
            <div
              className={`h-full transition-all duration-75 ${currentVariant.barBg}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

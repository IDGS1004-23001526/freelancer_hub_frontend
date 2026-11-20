/**
- ChatInput – the message composition bar at the bottom of the chat.
 *
- Features:
-   - Auto-grows with text (up to ~6 lines)
-   - Sends on Enter (Shift+Enter = newline)
-   - Fires typing / stop_typing socket events with debounce
-   - Detects and visually highlights URLs in the preview
-   - Disabled when sendingMessage is true
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Link as LinkIcon } from 'lucide-react';

const TYPING_DEBOUNCE_MS = 1000;
const URL_REGEX = /https?:\/\/[^\s]+/;

export default function ChatInput({
  conversationId,
  disabled = false,
  onSend,
  onTypingStart,
  onTypingStop,
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`; // max ~6 lines
  }, [value]);

  const triggerStopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop();
    }
  }, [onTypingStop]);

  const handleChange = (e) => {
    setValue(e.target.value);

    // Typing indicator logic
    if (!isTypingRef.current && e.target.value.trim()) {
      isTypingRef.current = true;
      onTypingStart();
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      triggerStopTyping();
    }, TYPING_DEBOUNCE_MS);
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    triggerStopTyping();

    onSend(trimmed);
    setValue('');

    // Restore focus after send
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  const hasUrl = URL_REGEX.test(value);
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-[#C9B8A6]/40 bg-white px-3 py-3">
      {/* URL hint indicator */}
      {hasUrl && (
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <LinkIcon className="w-3 h-3 text-[#8C2C45]" />
          <span className="text-[10px] font-semibold text-[#8C2C45]">
            Se detectó un enlace – se mostrará como hipervínculo
          </span>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id={`chat-input-${conversationId}`}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Escribe un mensaje..."
            aria-label="Escribir mensaje"
            className="w-full resize-none rounded-2xl bg-[#F3EFE6] border border-[#C9B8A6]/60 text-sm text-[#2b1b1e] placeholder-[#5A0F24]/40 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8C2C45]/30 focus:border-[#8C2C45] transition-all disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed overflow-hidden"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Enviar mensaje"
          className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            canSend
              ? 'bg-[#8C2C45] hover:bg-[#5A0F24] active:scale-95 shadow-[0_4px_12px_-2px_rgba(140,44,69,0.4)] cursor-pointer'
              : 'bg-[#C9B8A6]/40 cursor-not-allowed'
          }`}
        >
          <Send
            className={`w-4 h-4 ${canSend ? 'text-white' : 'text-[#5A0F24]/30'}`}
          />
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-[9px] text-[#5A0F24]/40 mt-1.5 pl-1">
        Enter para enviar · Shift+Enter para nueva línea
      </p>
    </div>
  );
}
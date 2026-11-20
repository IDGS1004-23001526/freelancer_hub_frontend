/**
 * ChatMessageBubble – renders a single chat message.
 *
 * Layout rules (matching Figma mockup HU-11):
 *   - Own messages: right-aligned, palette wine (#8C2C45) background, white text
 *   - Peer messages: left-aligned, white background, dark text
 *   - Shows time and read indicator
 *   - Detects URLs and [gif:URL] tags in content and renders them properly
 */
import React, { useMemo } from 'react';
import { Check, CheckCheck } from 'lucide-react';

/** Finds [gif:URL] tags and URLs in message content and renders them */
function renderContent(text = '', attachmentUrl = null) {
  const safeText = typeof text === 'string' ? text : '';
  const combinedRegex = /(\[gif:https?:\/\/[^\]]+\]|https?:\/\/[^\s]+)/gi;
  const parts = safeText.split(combinedRegex);

  return (
    <div className="space-y-1.5 break-words">
      {attachmentUrl && (
        <a
          href={attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={attachmentUrl}
            alt="Adjunto"
            loading="lazy"
            className="max-w-[240px] max-h-60 rounded-xl object-cover border border-[#C9B8A6]/30"
          />
        </a>
      )}

      {safeText && (
        <div className="space-y-1">
          {parts.map((part, i) => {
            if (!part) return null;

            const gifMatch = part.match(/^\[gif:(https?:\/\/[^\]]+)\]$/i);
            if (gifMatch) {
              const gifUrl = gifMatch[1];
              return (
                <a
                  key={i}
                  href={gifUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={gifUrl}
                    alt="GIF"
                    loading="lazy"
                    className="max-w-[240px] max-h-60 rounded-xl object-cover border border-[#C9B8A6]/30"
                  />
                </a>
              );
            }

            if (/^https?:\/\/[^\s]+$/i.test(part)) {
              return (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:opacity-80 transition-opacity break-all"
                >
                  {part}
                </a>
              );
            }

            return <span key={i}>{part}</span>;
          })}
        </div>
      )}
    </div>
  );
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function ChatMessageBubble({ message, showSenderName }) {
  const content = useMemo(
    () => renderContent(message.content, message.attachmentUrl),
    [message.content, message.attachmentUrl]
  );

  if (message.isMine) {
    // ── Own message ──────────────────────────────────────────────────────────
    return (
      <div className="flex justify-end mb-1.5 group">
        <div className="max-w-[75%] flex flex-col items-end gap-0.5">
          <div className="bg-[#8C2C45] text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm text-sm leading-relaxed">
            {content}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#5A0F24]/60 pr-0.5">
            <span>{formatTime(message.createdAt)}</span>
            {message.isRead ? (
              <CheckCheck className="w-3 h-3 text-[#8C2C45]" aria-label="Leído" />
            ) : (
              <Check className="w-3 h-3 text-[#5A0F24]/40" aria-label="Enviado" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Peer message ───────────────────────────────────────────────────────────
  return (
    <div className="flex justify-start mb-1.5 group">
      <div className="max-w-[75%] flex flex-col items-start gap-0.5">
        {showSenderName && (
          <span className="text-[10px] font-semibold text-[#8C2C45] pl-1 mb-0.5">
            {message.senderName}
          </span>
        )}
        <div className="bg-white border border-[#C9B8A6]/60 text-[#2b1b1e] rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm text-sm leading-relaxed">
          {content}
        </div>
        <span className="text-[10px] text-[#5A0F24]/50 pl-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
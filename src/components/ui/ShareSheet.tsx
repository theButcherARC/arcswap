"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * ShareSheet, adapted from Vengeance UI's Share Sheet (MIT,
 * github.com/Ashutoshx7/VengeanceUI) into the locked VibeFlow
 * design language: light tokens only, hairline border, one accent,
 * icons at 16px / stroke 1.5, brand glyphs in currentColor on
 * neutral circles (no brand-color fills), and the settle curve
 * (--ease-settle) instead of the original spring. Reduced motion
 * opens and closes instantly. The original's QR view is not
 * included: the repo has no QR library and none was approved, so
 * sharing is copy-link, channels and the native share sheet.
 */

const SETTLE_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const safeUrl = (value: string) => {
  try {
    const u = new URL(value);
    return /^https?:$/.test(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
};

function LineIcon({
  children,
  size = 16,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ShareGlyph = (
  <LineIcon>
    <path d="M12 16V4m0 0L8 8m4-4 4 4" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </LineIcon>
);

function BrandGlyph({ name }: { name: "whatsapp" | "telegram" | "x" }) {
  if (name === "x") {
    return (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
        <path d="M12.15 1.5H10.15L6.25 6.35L2.85 1.5H0.5L5.1 7.85L0.5 13.5H2.5L6.6 8.4L10.15 13.5H12.5L7.75 6.9L12.15 1.5ZM11.1 12.4H10L2.95 2.55H4.1L11.1 12.4Z" />
      </svg>
    );
  }
  if (name === "telegram") {
    return (
      <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M27.6 6.2 4.9 15.1c-1.1.5-1 1.1-.1 1.4l5.8 1.8 2.2 6.7c.3.8.6 1 1.1.4l3.4-3.4 5.6 4c1 .6 1.8.3 2-1l3.7-17c.3-1.4-.2-2-1-1.8ZM11.7 17.8 24.6 9c.5-.3 1-.2.5.3L14.5 19.5l-.5 3.2-2.3-4.9Z" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M7.4 24.5 4 28l1.2-5A12.1 12.1 0 1 1 10 27a12 12 0 0 1-2.6-2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12.1 10.5c-.7-1.4-1.6-.7-2 .1-1.2 2.2 1.5 5.6 3.4 7.4 2.3 2.2 5.8 4.5 7.5 2.7 1 .1 1.6-1.2 1.5-2.3l-2.8-1.3c-.7-.3-1.2 1.2-2 1-2.1-.6-4.2-2.6-4.6-3.5-.5-.9.9-1.3.7-2l-1.1-2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface ShareSheetProps {
  url: string;
  title: string;
  text?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function ShareSheet({
  url,
  title,
  text,
  triggerLabel = "Share",
  // The trigger's full visual set is the host's call (shape, colors,
  // sizing), so no utility is ever set twice: the base classes below
  // carry layout only. Default is the standard secondary pill.
  triggerClassName = "min-h-[44px] rounded-full border-[var(--line)] bg-[var(--bg-raised)] px-5 text-sm font-medium text-[var(--fg)] hover:border-[var(--line-strong)]",
}: ShareSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"share" | "copied">("share");
  const [feedback, setFeedback] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const link = safeUrl(url);
  const shareText = (text ?? "").trim();

  useEffect(() => {
    setMounted(true);
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setView("share");
    setFeedback("");
    setTimeout(() => triggerRef.current?.focus(), 50);
  }, []);

  const openDialog = (e: MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = e.currentTarget;
    setView("share");
    setFeedback("");
    setOpen(true);
  };

  // Scroll lock, Escape to close, and a simple Tab trap while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), a[href]",
      );
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!dialogRef.current?.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    const t = setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>("button:not(:disabled)")
        ?.focus();
    }, 60);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", key);
      clearTimeout(t);
    };
  }, [open, close]);

  const copy = async () => {
    if (!link) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const el = document.createElement("textarea");
        el.value = link;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.append(el);
        el.select();
        try {
          if (!document.execCommand("copy")) throw new Error("copy failed");
        } finally {
          el.remove();
        }
      }
      setFeedback("");
      setView("copied");
    } catch {
      setFeedback("Could not copy. Check the browser clipboard permission.");
    }
  };

  const launch = (channel: "whatsapp" | "telegram" | "x" | "mail") => {
    if (!link) return;
    const q = encodeURIComponent;
    const message = shareText || title;
    const targets = {
      whatsapp: `https://api.whatsapp.com/send?text=${q(`${message} ${link}`)}`,
      telegram: `https://t.me/share/url?url=${q(link)}&text=${q(message)}`,
      x: `https://twitter.com/intent/tweet?url=${q(link)}&text=${q(message)}`,
      mail: `mailto:?subject=${q(title)}&body=${q(`${shareText ? `${shareText}\n\n` : ""}${link}`)}`,
    };
    const target = targets[channel];
    if (channel === "mail") {
      window.location.assign(target);
      return;
    }
    const win = window.open("", "_blank");
    if (!win) {
      setFeedback("Pop-up blocked. Allow pop-ups to share.");
      return;
    }
    win.opener = null;
    win.location.replace(target);
  };

  const nativeShare = async () => {
    if (!link) return;
    try {
      await navigator.share({
        title,
        text: shareText || undefined,
        url: link,
      });
      close();
    } catch {
      // User cancelled the native sheet; stay open without noise.
    }
  };

  const channels: {
    id: string;
    label: string;
    icon: ReactNode;
    action: () => void;
  }[] = [
    {
      id: "copy",
      label: "Copy",
      icon: (
        <LineIcon>
          <path d="m10 13 4-4" />
          <path d="M8.5 16.3 6.6 18A3.2 3.2 0 0 1 2 13.4l4.4-4.5A3.2 3.2 0 0 1 11 9" />
          <path d="M15.5 7.7 17.4 6A3.2 3.2 0 0 1 22 10.6l-4.4 4.5A3.2 3.2 0 0 1 13 15" />
        </LineIcon>
      ),
      action: copy,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <BrandGlyph name="whatsapp" />,
      action: () => launch("whatsapp"),
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: <BrandGlyph name="telegram" />,
      action: () => launch("telegram"),
    },
    {
      id: "x",
      label: "X",
      icon: <BrandGlyph name="x" />,
      action: () => launch("x"),
    },
    {
      id: "mail",
      label: "Email",
      icon: (
        <LineIcon>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </LineIcon>
      ),
      action: () => launch("mail"),
    },
    ...(canNativeShare
      ? [
          {
            id: "more",
            label: "More",
            icon: (
              <LineIcon>
                <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
              </LineIcon>
            ),
            action: nativeShare,
          },
        ]
      : []),
  ];

  const panel = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="presentation">
          <motion.div
            className="absolute inset-0"
            style={{ background: "color-mix(in srgb, var(--fg) 45%, transparent)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={close}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute inset-x-0 bottom-0 max-h-[calc(100dvh-24px)] overflow-y-auto rounded-t-[20px] border border-[var(--line)] bg-[var(--bg-raised)] px-5 pb-6 pt-3 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-[400px] sm:rounded-[20px] sm:pt-5"
            style={{ boxShadow: "0 8px 24px color-mix(in srgb, var(--fg) 10%, transparent)" }}
            initial={{
              opacity: 0,
              y: reduceMotion ? 0 : 12,
              scale: reduceMotion ? 1 : 0.98,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: reduceMotion ? 0 : 8,
              scale: reduceMotion ? 1 : 0.98,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.25,
              ease: SETTLE_EASE,
            }}
          >
            <div
              className="mx-auto mb-4 h-1 w-8 rounded-full bg-[var(--line-strong)] sm:hidden"
              aria-hidden="true"
            />
            {view === "copied" ? (
              <div className="pb-2 pt-2 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                  <LineIcon size={18}>
                    <path d="m5 12 4.5 4.5L19 7" />
                  </LineIcon>
                </span>
                <p className="mt-3 text-base font-semibold text-[var(--fg)]">
                  Link copied
                </p>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Paste it anywhere to share it.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="pressable mt-5 flex min-h-[44px] w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="mono-label block">Share</span>
                    <p className="mt-1.5 truncate text-base font-semibold text-[var(--fg)]">
                      {title}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[0.6875rem] text-[var(--fg-faint)]">
                      {link || url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close share dialog"
                    className="pressable -mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)]"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--glass-strong)]">
                      <LineIcon>
                        <path d="M6 6l12 12M18 6 6 18" />
                      </LineIcon>
                    </span>
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {channels.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={!link}
                      onClick={c.action}
                      className="pressable flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-[var(--fg)] hover:bg-[var(--glass-strong)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--glass-strong)]">
                        {c.icon}
                      </span>
                      <span className="text-xs leading-none text-[var(--fg-muted)]">
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
                {!link && (
                  <p className="mt-4 text-xs text-[var(--danger)]" role="alert">
                    This link is not valid for sharing.
                  </p>
                )}
                {feedback && (
                  <p className="mt-4 text-xs text-[var(--danger)]" role="status">
                    {feedback}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        className={
          "pressable inline-flex items-center justify-center gap-2 border " +
          triggerClassName
        }
      >
        {ShareGlyph}
        {triggerLabel}
      </button>
      {mounted ? createPortal(panel, document.body) : null}
    </>
  );
}

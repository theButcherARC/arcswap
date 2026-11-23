"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { truncateAddress } from "@/utils/address";
import { useArcNetwork } from "@/hooks/useArcNetwork";

/**
 * Displays either a "Connect Wallet" button or the connected account address.
 * On wrong network, shows a "Switch Network" button instead of the address.
 */
const NO_WALLET_NOTE =
  "No wallet opened. If you have a wallet extension, give it a second and try again. If nothing opens, install MetaMask, or open VibeFlow inside your wallet app's browser, then try again.";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isCorrectNetwork, isSwitching, switchToArc } = useArcNetwork();
  const [note, setNote] = useState<string | null>(null);
  const [noteClosing, setNoteClosing] = useState(false);
  const noteTimer = useRef<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // The account menu closes on any outside press or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // The note leaves along the path it entered (drawer pattern): it
  // stays mounted through the pop-out, then clears. Showing a fresh
  // note cancels a pending exit, so a fast retry never loses it.
  const clearNoteTimer = () => {
    if (noteTimer.current !== null) {
      window.clearTimeout(noteTimer.current);
      noteTimer.current = null;
    }
  };

  const dismissNote = () => {
    if (!note) return;
    setNoteClosing(true);
    clearNoteTimer();
    noteTimer.current = window.setTimeout(() => {
      noteTimer.current = null;
      setNote(null);
      setNoteClosing(false);
    }, 200);
  };

  const showNote = (text: string) => {
    clearNoteTimer();
    setNoteClosing(false);
    setNote(text);
  };

  useEffect(() => {
    return () => {
      if (noteTimer.current !== null) {
        window.clearTimeout(noteTimer.current);
      }
    };
  }, []);

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setMenuOpen(false);
      }, 1200);
    } catch {
      setMenuOpen(false);
    }
  };

  // Try the configured MetaMask connector first, then fall back to any
  // other injected wallet. Either way, a failed attempt must SAY something:
  // a silent no-op reads as "the site is broken" to a first-time user.
  const handleConnect = () => {
    dismissNote();
    const metaMaskConnector = connectors.find((c) => c.id === "metaMask");
    const injectedConnector = connectors.find((c) => c.id === "injected");
    const first = metaMaskConnector ?? injectedConnector ?? connectors[0];
    if (!first) {
      showNote(NO_WALLET_NOTE);
      return;
    }
    connect(
      { connector: first },
      {
        onError: () => {
          if (injectedConnector && first !== injectedConnector) {
            connect(
              { connector: injectedConnector },
              { onError: () => showNote(NO_WALLET_NOTE) },
            );
          } else {
            showNote(NO_WALLET_NOTE);
          }
        },
      },
    );
  };

  if (!isConnected) {
    return (
      <div className="relative">
        <Button
          variant="primary"
          size="sm"
          isLoading={isPending}
          onClick={handleConnect}
        >
          Connect Wallet
        </Button>
        {note ? (
          <p
            className={
              "absolute right-0 top-full z-50 mt-2 w-60 border border-[var(--line)] bg-white p-3 text-left text-xs leading-relaxed text-[var(--fg-muted)] shadow-[0_8px_24px_color-mix(in_srgb,var(--fg)_10%,transparent)] [transform-origin:top_right] " +
              (noteClosing ? "animate-pop-out" : "animate-pop-in")
            }
          >
            {note}
          </p>
        ) : null}
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Button
        variant="danger"
        size="sm"
        isLoading={isSwitching}
        onClick={switchToArc}
      >
        Switch Network
      </Button>
    );
  }

  // Connected: the address button opens a small menu. It must never
  // disconnect on click: copying the address is the common intent, and
  // an instant disconnect reads as a trap. Disconnect is the explicit
  // second item in the menu.
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="flex items-center gap-2 border border-[var(--line)] bg-[var(--glass)] px-3.5 py-1.5 text-xs font-medium text-[var(--fg)] hover:bg-[var(--glass-strong)] pressable"
      >
        <span className="h-1.5 w-1.5 bg-[var(--success)]" aria-hidden="true" />
        {truncateAddress(address ?? "")}
      </button>
      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-48 animate-pop-in border border-[var(--line)] bg-white p-1.5 text-left shadow-[0_8px_24px_color-mix(in_srgb,var(--fg)_10%,transparent)] [transform-origin:top_right]"
        >
          <button
            role="menuitem"
            onClick={handleCopyAddress}
            className="w-full px-2.5 py-2 text-left text-xs font-medium text-[var(--fg)] hover:bg-[var(--glass-strong)] pressable"
          >
            {copied ? "Copied" : "Copy address"}
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              disconnect();
            }}
            className="w-full px-2.5 py-2 text-left text-xs font-medium text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_6%,transparent)] pressable"
          >
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { TipButton } from "@/components/square/TipButton";

type Post = {
  id: string;
  walletAddress: string;
  handle: string | null;
  content: string;
  createdAt: string;
};

const MAX_CONTENT = 500;

function shortAddr(a: string): string {
  return a.slice(0, 6) + "..." + a.slice(-4);
}
function timeAgo(iso: string): string {
  const sec = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return sec + "s";
  if (sec < 3600) return Math.round(sec / 60) + "m";
  if (sec < 86400) return Math.round(sec / 3600) + "h";
  return Math.round(sec / 86400) + "d";
}

export function SquareFeed() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/square/posts", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { posts: Post[] };
      setPosts(json.posts);
      setLoaded(true);
    } catch {
      // Keep showing the last good feed.
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  async function publish() {
    const content = draft.trim();
    if (!content || !address || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const timestamp = Date.now();
      const message = "VibeSquare post\n" + timestamp + "\n" + content;
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/square/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, content, signature, timestamp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Post failed");
      setPosts((prev) => [json.post as Post, ...prev]);
      setDraft("");
      setNote("Posted. It is live in the Square.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Post failed, try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">
            VIBESQUARE
          </h1>
          <span className="rounded-full border border-[var(--line)] px-2.5 py-1">
            <span className="mono-label !text-[var(--accent)]">V1</span>
          </span>
        </div>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          The people layer talking. Posts are signed by your wallet, no gas,
          no transaction. Tip any post in USDC, straight to its author.
          Pay requests attach here next.
        </p>
      </div>

      {/* Composer */}
      <div className="mb-10 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)] p-5">
        {isConnected ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_CONTENT}
              rows={3}
              placeholder="Say it like you would on the timeline..."
              className="w-full resize-none bg-transparent text-base leading-relaxed text-[var(--fg)] outline-none placeholder:text-[var(--fg-faint)]"
            />
            <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
              <span className="mono-label">
                {draft.length} / {MAX_CONTENT} . POSTING AS{" "}
                {address ? shortAddr(address).toUpperCase() : ""}
              </span>
              <button
                onClick={publish}
                disabled={busy || !draft.trim()}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Signing..." : "Post"}
              </button>
            </div>
          </>
        ) : (
          <p className="py-2 text-sm text-[var(--fg-muted)]">
            Connect your wallet from the top bar to post. Reading the Square
            is open to everyone.
          </p>
        )}
        {note && (
          <p className="mt-3 text-xs text-[var(--fg-muted)]">{note}</p>
        )}
      </div>

      {/* Feed */}
      {!loaded && (
        <p className="py-8 text-center text-sm text-[var(--fg-muted)]">
          Loading the Square...
        </p>
      )}
      {loaded && posts.length === 0 && (
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)] p-10 text-center">
          <p className="text-sm text-[var(--fg-muted)]">
            No posts yet. Be the first voice in the Square.
          </p>
        </div>
      )}
      <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {posts.map((p) => (
          <article key={p.id} className="py-5">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--fg)]">
                {p.handle ? "@" + p.handle : shortAddr(p.walletAddress)}
              </span>
              <span className="text-xs text-[var(--fg-faint)]">
                {timeAgo(p.createdAt)}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--fg)]">
              {p.content}
            </p>
            <div className="mt-3">
              <TipButton to={p.walletAddress} handle={p.handle} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

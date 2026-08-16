"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useSession } from "@/lib/useSession";
import { useEditorStore } from "@/lib/store";
import { Button, TextInput } from "@/components/ui";

interface ShareState {
  isPublic: boolean;
  slug: string | null;
}

/**
 * Share modal — saves the current in-progress profile to the cloud (creates a
 * profile owned by the logged-in user), then toggles public sharing to obtain
 * a /cv/[slug] link + QR code. Requires an account: anonymous local profiles
 * can't be publicly shared (architecture §10 — public sharing is gated behind
 * cloud save). The server re-filters visibility on the public page, so hidden
 * fields never leak even if the client claims otherwise.
 */
export function ShareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useSession();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [share, setShare] = useState<ShareState>({ isPublic: false, slug: null });
  const [qr, setQr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    void saveProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  async function saveProfile() {
    setBusy(true);
    setError(null);
    try {
      const { profile, cloudProfileId } = useEditorStore.getState();
      const id = cloudProfileId;
      const res = await fetch(
        id ? `/api/profiles/${id}` : "/api/profiles",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (data.error === "INVALID_PROFILE") {
          setError("Le profil est incomplet. Remplis au moins le pseudo avant de partager.");
        } else {
          throw new Error("SAVE_FAILED");
        }
        return;
      }
      let savedId = id;
      if (!savedId) {
        const created = (await res.json()) as { id: string };
        savedId = created.id;
        useEditorStore.getState().setCloudProfileId(savedId);
      }
      setProfileId(savedId);
      // Fetch the ACTUAL stored share state so the toggle reflects reality.
      // Without this, an already-public profile would show unchecked on open,
      // and re-checking it would mint a new slug (breaking the shared link).
      await loadShareState(savedId);
    } catch {
      setError("Impossible de sauvegarder le profil.");
    } finally {
      setBusy(false);
    }
  }

  async function loadShareState(id: string) {
    try {
      const res = await fetch(`/api/share/${id}`);
      if (!res.ok) return;
      const data = (await res.json()) as ShareState;
      setShare(data);
      if (data.slug) {
        const url = `${window.location.origin}/cv/${data.slug}`;
        setQr(await QRCode.toDataURL(url, { margin: 1, width: 180 }));
      } else {
        setQr(null);
      }
    } catch {
      // Non-fatal: the user can still toggle sharing from the default state.
    }
  }

  async function togglePublic(next: boolean) {
    if (!profileId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/${profileId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public: next }),
      });
      if (!res.ok) throw new Error("SHARE_FAILED");
      const data = (await res.json()) as ShareState;
      setShare(data);
      if (data.slug) {
        const url = `${window.location.origin}/cv/${data.slug}`;
        setQr(await QRCode.toDataURL(url, { margin: 1, width: 180 }));
      } else {
        setQr(null);
      }
    } catch {
      setError("Impossible de modifier le partage.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const shareUrl = share.slug ? `${window.location.origin}/cv/${share.slug}` : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-lg border border-line bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-content-primary">Partager ce GameFolio</h2>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-primary"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {!user ? (
          <div className="space-y-3 text-sm text-content-secondary">
            <p>
              Le partage public nécessite un compte pour sauvegarder le profil dans le cloud.
            </p>
            <div className="flex gap-2">
              <a href="/login">
                <Button size="sm">Se connecter</Button>
              </a>
              <a href="/register">
                <Button size="sm" variant="ghost">
                  Créer un compte
                </Button>
              </a>
            </div>
          </div>
        ) : busy && !profileId ? (
          <p className="text-sm text-content-muted">Sauvegarde dans le cloud…</p>
        ) : profileId ? (
          <>
            <label className="flex items-center gap-2 text-sm text-content-primary">
              <input
                type="checkbox"
                checked={share.isPublic}
                disabled={busy}
                onChange={(e) => void togglePublic(e.target.checked)}
                className="accent-[var(--color-accent)]"
              />
              Rendre ce profil public
            </label>
            {shareUrl && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TextInput readOnly value={shareUrl} className="text-xs" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      void navigator.clipboard.writeText(shareUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? "Copié" : "Copier"}
                  </Button>
                </div>
                {qr && (
                  <img
                    src={qr}
                    alt="QR code"
                    width={160}
                    height={160}
                    className="mx-auto rounded bg-white p-1"
                  />
                )}
                <p className="text-xs text-content-muted">
                  Profil sauvegardé (id {profileId.slice(0, 8)}…). Le lien est invalide si tu
                  désactives le partage.
                </p>
              </div>
            )}
          </>
        ) : null}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}

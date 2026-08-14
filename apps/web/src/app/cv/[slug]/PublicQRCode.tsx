"use client";

/**
 * Client wrapper for the server-generated QR data URL. Kept tiny + client-only
 * so the QR <img> can be interactive (download on click) without forcing the
 * whole public page client-side.
 */
export function PublicQRCode({ dataUrl }: { dataUrl: string }) {
  return (
    <a href={dataUrl} download="gamer-cv-qr.png" className="rounded-lg bg-white p-2">
      <img src={dataUrl} alt="QR code vers ce profil" width={120} height={120} />
    </a>
  );
}

import React, { useId } from "react";

interface LogoMarkProps {
  className?: string;
}

/**
 * IntakeIQ mark: two layered document cards resolving into a checkmark —
 * "documents in, verified out." Pure SVG so it stays crisp at any size.
 */
export default function LogoMark({ className = "w-9 h-9" }: LogoMarkProps) {
  const uid = useId().replace(/:/g, "");
  const backId = `iq-mark-back-${uid}`;
  const frontId = `iq-mark-front-${uid}`;
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="IntakeIQ logo"
    >
      <defs>
        <linearGradient id={backId} x1="10" y1="2" x2="34" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id={frontId} x1="2" y1="10" x2="26" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3699FA" />
          <stop offset="1" stopColor="#0052CC" />
        </linearGradient>
      </defs>

      {/* Back card */}
      <rect x="10" y="2" width="24" height="24" rx="7" fill={`url(#${backId})`} />

      {/* Front card */}
      <rect x="2" y="10" width="24" height="24" rx="7" fill={`url(#${frontId})`} />

      {/* Checkmark */}
      <path
        d="M8.5 23.5L12.5 27.5L20.5 15.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

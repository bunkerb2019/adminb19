import { Box, Typography, keyframes } from "@mui/material";
import { useEffect, useState } from "react";

const EVENT = "admin:saved";

// eslint-disable-next-line react-refresh/only-export-components
export const showSaved = (text = "Сохранено") =>
  window.dispatchEvent(new CustomEvent(EVENT, { detail: text }));

const pop = keyframes`
  0% { opacity: 0; transform: translate(-50%, -50%) scale(.6); }
  15% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
  25% { transform: translate(-50%, -50%) scale(1); }
  85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(.9); }
`;
const draw = keyframes`to { stroke-dashoffset: 0; }`;

const SavedCheck = () => {
  const [shot, setShot] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    const onSaved = (e: Event) => {
      setShot({ id: Date.now(), text: (e as CustomEvent<string>).detail });
      navigator.vibrate?.(30);
    };
    window.addEventListener(EVENT, onSaved);
    return () => window.removeEventListener(EVENT, onSaved);
  }, []);

  useEffect(() => {
    if (!shot) return;
    const t = setTimeout(() => setShot(null), 1600);
    return () => clearTimeout(t);
  }, [shot]);

  if (!shot) return null;

  return (
    <Box
      key={shot.id}
      role="status"
      aria-live="polite"
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        zIndex: 2000,
        pointerEvents: "none",
        bgcolor: "#111",
        color: "#fff",
        borderRadius: "28px",
        px: 4,
        py: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        animation: `${pop} 1.6s ease forwards`,
      }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="#fff" />
        <Box
          component="path"
          d="M19 33l9 9 17-19"
          stroke="#111"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          sx={{
            strokeDasharray: 40,
            strokeDashoffset: 40,
            animation: `${draw} .4s .2s ease-out forwards`,
          }}
        />
      </svg>
      <Typography fontWeight={600} fontSize={15}>
        {shot.text}
      </Typography>
    </Box>
  );
};

export default SavedCheck;

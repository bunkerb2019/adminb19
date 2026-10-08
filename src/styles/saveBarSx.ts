export const saveBarSx = {
  position: "sticky",
  bottom: { xs: "calc(84px + env(safe-area-inset-bottom))", md: 16 },
  zIndex: 2,
  mt: 2,
  display: "flex",
  justifyContent: "flex-end",
  "& .MuiButton-root": {
    minWidth: { xs: "100%", sm: 180 },
    height: 48,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
} as const;

import { Box, Card, Typography } from "@mui/material";

export const StatCard = ({
  title,
  value,
  icon,
  change,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  change?: number;
}) => (
  <Card sx={{ height: "100%", p: { xs: 1.5, sm: 2 }, borderRadius: "22px", display: "flex", alignItems: "center", gap: 1.5 }}>
    <Box
      sx={{
        width: 48,
        height: 48,
        flexShrink: 0,
        borderRadius: "50%",
        bgcolor: "#111",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "& svg": { fontSize: 22 },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" noWrap component="div">
        {title}
      </Typography>
      <Typography variant="h6" lineHeight={1.2}>
        {value}
        {change !== undefined && (
          <Typography component="span" variant="caption" sx={{ ml: 1 }}>
            {change >= 0 ? `↑${change}%` : `↓${Math.abs(change)}%`}
          </Typography>
        )}
      </Typography>
    </Box>
  </Card>
);

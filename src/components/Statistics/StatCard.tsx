import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

export const StatCard = ({
  title,
  value,
  icon,
  color,
  change,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: number;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const backgroundGradient = isDark
    ? `linear-gradient(135deg, ${color}33 0%, ${color}66 100%)`
    : `linear-gradient(135deg, ${color}11 0%, ${color}22 100%)`;

  const boxShadow = isDark
    ? `0 4px 20px ${color}44`
    : `0 2px 10px ${color}22`;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: "20px",
        background: backgroundGradient,
        backdropFilter: "blur(6px)",
        boxShadow: boxShadow,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: isDark
            ? `0 12px 28px ${color}66`
            : `0 8px 24px ${color}44`,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {value}
              {change !== undefined && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    ml: 1,
                    color: change >= 0 ? "success.main" : "error.main",
                    fontWeight: 500,
                  }}
                >
                  {change >= 0 ? `↑${change}%` : `↓${Math.abs(change)}%`}
                </Typography>
              )}
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: isDark ? `${color}40` : `${color}20`,
              color: color,
              borderRadius: "12px",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isDark
                ? `0 4px 12px ${color}44`
                : `0 2px 6px ${color}22`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
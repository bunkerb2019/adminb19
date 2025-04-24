import {Box, Card, CardContent, Typography, useTheme} from "@mui/material";

export const StatCard = ({title, value, icon, color, change}: {
  title: string,
  value: number | string,
  icon: React.ReactNode,
  color: string,
  change?: number
}) => {
  const theme = useTheme();

  return (
    <Card sx={{
      height: '100%',
      borderLeft: `4px solid ${color}`,
      boxShadow: theme.shadows[2],
      borderRadius: '16px',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {transform: 'translateY(-5px)', boxShadow: theme.shadows[8]},
      p: 2
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>
            <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
            <Typography variant="h4">{value} {change !== undefined &&
              (<Typography variant="caption" color={change >= 0 ? 'success.main' : 'error.main'}>
                {change >= 0 ? `↑${change}%` : `↓${Math.abs(change)}%`}
              </Typography>)}
            </Typography>
          </div>
          <Box sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
};

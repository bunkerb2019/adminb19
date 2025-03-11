import { Card, CardContent, Typography } from "@mui/material";

interface DashboardCardProps {
  title: string;
  value?: string;
  children?: React.ReactNode; // Добавили children
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, children }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {value && <Typography variant="body1">{value}</Typography>}
        {children} {/* Теперь можно передавать контент внутрь */}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
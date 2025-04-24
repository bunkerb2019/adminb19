import {
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  useTheme
} from "@mui/material";
import {useState} from "react";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line} from 'recharts';
import {
  ImageNotSupported,
  Category,
  Visibility,
  ShoppingCart,
  Star
} from "@mui/icons-material";
import {useAppViewsContext} from "../../contexts/AppViewsContext.tsx";
import {StatCard} from "./StatCard.tsx";

type Stats = {
  totalProducts: number;
  totalCategories: number;
  productsWithoutImage: number;
  popularProducts?: { name: string; views: number }[];
  conversionRate?: number;
  views: { name: string; value: number }[];
};

type ViewType = "day" | "week" | "month" | "year";

const StatisticsOverview = ({stats}: { stats: Stats }) => {
  const theme = useTheme();
  const {selectedTimeRange, setSelectedTimeRange, isLoading} = useAppViewsContext();
  const [viewType, setViewType] = useState<ViewType>("month");

  const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const years = Array.from({length: 3}, (_, i) => new Date().getFullYear() + i);

  return (
    <Box sx={{p: 3}}>
      <Typography variant="h5" gutterBottom sx={{mb: 3, fontWeight: 600}}>Аналитика</Typography>

      <Card sx={{mb: 3, p: 2, borderRadius: '16px'}}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Период</InputLabel>
              <Select value={viewType} label="Период" onChange={(e) => setViewType(e.target.value as ViewType)}>
                <MenuItem value="day">День</MenuItem>
                <MenuItem value="week">Неделя</MenuItem>
                <MenuItem value="month">Месяц</MenuItem>
                <MenuItem value="year">Год</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {viewType === 'month' && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Месяц</InputLabel>
                <Select value={selectedTimeRange.month} label="Месяц"
                        onChange={(e) => setSelectedTimeRange({...selectedTimeRange, month: Number(e.target.value)})}>
                  {months.map((name, index) => <MenuItem key={index} value={index + 1}>{name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Год</InputLabel>
              <Select value={selectedTimeRange.year} label="Год"
                      onChange={(e) => setSelectedTimeRange({...selectedTimeRange, year: Number(e.target.value)})}>
                {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={3} sx={{mb: 3}}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Товаров" value={stats.totalProducts} icon={<ShoppingCart color="primary"/>}
                    color={theme.palette.primary.main}/>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Категорий" value={stats.totalCategories} icon={<Category color="secondary"/>}
                    color={theme.palette.secondary.main}/>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Без фото" value={stats.productsWithoutImage} icon={<ImageNotSupported color="error"/>}
                    color={theme.palette.error.main}/>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Конверсия" value={`${stats.conversionRate || 0}%`} icon={<Star color="success"/>}
                    color={theme.palette.success.main}/>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{mb: 3}}>
        <Grid item xs={12} md={8}>
          <Card sx={{p: 2, borderRadius: '16px'}}>
            <Typography variant="h6" sx={{mb: 2}}>Просмотры по категориям</Typography>
            {isLoading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress/></Box> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.views}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="name"/>
                  <YAxis/>
                  <Tooltip/>
                  <Bar dataKey="value" fill={theme.palette.primary.main}/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>
      </Grid>

      {stats.popularProducts && stats.popularProducts.length > 0 && (
        <Card sx={{p: 2, mb: 3, borderRadius: '16px'}}>
          <Typography variant="h6" sx={{mb: 2}}>Популярные товары</Typography>
          <Grid container spacing={2}>
            {stats.popularProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined" sx={{borderRadius: '16px', p: 2}}>
                  <CardContent>
                    <Typography variant="subtitle1">{index + 1}. {product.name}</Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Visibility color="action" sx={{mr: 1}}/>
                      <Typography variant="body2">Просмотров: <strong>{product.views}</strong></Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      <Card sx={{p: 2, borderRadius: '16px'}}>
        <Typography variant="h6" sx={{mb: 2}}>Динамика просмотров</Typography>
        {isLoading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress/></Box> : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.views}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.primary.main}
                name="Просмотры"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </Box>
  );
};

export default StatisticsOverview;
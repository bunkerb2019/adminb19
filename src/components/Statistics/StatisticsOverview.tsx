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
import { useEffect, useState } from "react";
import { getViewsStats, getProductStats } from "../../firebase/getStatistics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  ImageNotSupported, 
  Category, 
  Visibility,
  ShoppingCart,
  Star
} from "@mui/icons-material";

type Stats = {
  totalProducts: number;
  totalCategories: number;
  productsWithoutImage: number;
  popularProducts?: { name: string; views: number }[];
  conversionRate?: number;
};

type ViewType = "day" | "week" | "month" | "year";

type ProductData = {
  date: string;
  views: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatisticsOverview = ({ stats }: { stats: Stats }) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<{month: number, year: number}>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [viewData, setViewData] = useState<Record<string, number>>({});
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<ViewType>("month");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [views, products] = await Promise.all([
          getViewsStats(timeRange.month, timeRange.year, viewType),
          getProductStats(timeRange.month, timeRange.year)
        ]);
        setViewData(views);
        setProductData(products);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange, viewType]);

  const months = [
    "Январь", "Февраль", "Март", "Апрель", 
    "Май", "Июнь", "Июль", "Август", 
    "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const viewChartData = Object.entries(viewData).map(([name, value]) => ({
    name: name.length > 10 ? `${name.substring(0, 8)}...` : name,
    value
  }));

  const StatCard = ({ 
    title, 
    value, 
    icon,
    color,
    change
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    change?: number;
  }) => (
    <Card sx={{ 
      height: '100%',
      borderLeft: `4px solid ${color}`,
      boxShadow: theme.shadows[2],
      transition: 'transform 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)'
      }
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
              {change !== undefined && (
                <Typography 
                  variant="caption" 
                  color={change >= 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 1 }}
                >
                  {change >= 0 ? `↑${change}%` : `↓${Math.abs(change)}%`}
                </Typography>
              )}
            </Typography>
          </div>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Аналитика магазина
      </Typography>
      
      {/* Controls */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Период</InputLabel>
              <Select
                value={viewType}
                label="Период"
                onChange={(e) => setViewType(e.target.value as ViewType)}
              >
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
                <Select
                  value={timeRange.month}
                  label="Месяц"
                  onChange={(e) => setTimeRange(prev => ({
                    ...prev,
                    month: Number(e.target.value)
                  }))}
                >
                  {months.map((name, index) => (
                    <MenuItem key={index} value={index + 1}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Год</InputLabel>
              <Select
                value={timeRange.year}
                label="Год"
                onChange={(e) => setTimeRange(prev => ({
                  ...prev,
                  year: Number(e.target.value)
                }))}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Товаров" 
            value={stats.totalProducts} 
            icon={<ShoppingCart color="primary" />}
            color={theme.palette.primary.main}
            change={5} // сделать динамичным! 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Категорий" 
            value={stats.totalCategories} 
            icon={<Category color="secondary" />}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Без фото" 
            value={stats.productsWithoutImage}
            icon={<ImageNotSupported color="error" />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Конверсия" 
            value={`${stats.conversionRate || 0}%`} 
            icon={<Star color="success" />}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>
      
      {/* Main Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Просмотры по категориям
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={viewChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} просмотров`, 'Количество']}
                    labelFormatter={(label) => `Категория: ${label}`}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={theme.palette.primary.main} 
                    name="Просмотры"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Распределение просмотров
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={viewChartData.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {viewChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, _name, props) => [
                    `${value} просмотров`,
                    props.payload.name
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>
      </Grid>
      
      {/* Popular Products */}
      {stats.popularProducts && stats.popularProducts.length > 0 && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Популярные товары
          </Typography>
          <Grid container spacing={2}>
            {stats.popularProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">
                      {index + 1}. {product.name}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Visibility color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Просмотров: <strong>{product.views}</strong>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}
      
      {/* Timeline Chart */}
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Динамика просмотров
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="views" 
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
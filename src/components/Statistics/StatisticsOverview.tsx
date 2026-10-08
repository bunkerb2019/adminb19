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
  useTheme,
} from "@mui/material";
import { useState, memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  ImageNotSupported,
  Category,
  Visibility,
  ShoppingCart,
  Star,
} from "@mui/icons-material";
import { useAppViewsContext } from "../../contexts/AppViewsContext";
import { StatCard } from "./StatCard";

type Stats = {
  totalProducts: number;
  totalCategories: number;
  productsWithoutImage: number;
  popularProducts?: { name: string; views: number }[];
  conversionRate?: number;
  views: { name: string; value: number }[];
};

type ViewType = "day" | "week" | "month" | "year";

const StatisticsOverview = ({ stats }: { stats: Stats }) => {
  const theme = useTheme();
  const { selectedTimeRange, setSelectedTimeRange, isLoading } =
    useAppViewsContext();
  const [viewType, setViewType] = useState<ViewType>("month");

  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  const years = Array.from(
    { length: 3 },
    (_, i) => new Date().getFullYear() + i
  );

  return (
    <Box>
      <Card
        sx={{
          mb: 2,
          p: 2,
          borderRadius: "20px",
          // border: "1.5px solid rgba(31,38,135,0.18)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl
              fullWidth
              size="small"
              sx={{
                borderRadius: 2,
              }}
            >
              <InputLabel>Период</InputLabel>
              <Select
                value={viewType}
                label="Период"
                onChange={(e) => setViewType(e.target.value as ViewType)}
                sx={{
                  borderRadius: 2,
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 2,
                    },
                  },
                }}
              >
                <MenuItem value="day">День</MenuItem>
                <MenuItem value="week">Неделя</MenuItem>
                <MenuItem value="month">Месяц</MenuItem>
                <MenuItem value="year">Год</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {viewType === "month" && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl
                fullWidth
                size="small"
                sx={{
                  borderRadius: 2,
                }}
              >
                <InputLabel>Месяц</InputLabel>
                <Select
                  value={selectedTimeRange.month}
                  label="Месяц"
                  onChange={(e) =>
                    setSelectedTimeRange({
                      ...selectedTimeRange,
                      month: Number(e.target.value),
                    })
                  }
                  sx={{
                    borderRadius: 2,
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                      },
                    },
                  }}
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
            <FormControl
              fullWidth
              size="small"
              sx={{
                borderRadius: 2,
              }}
            >
              <InputLabel>Год</InputLabel>
              <Select
                value={selectedTimeRange.year}
                label="Год"
                onChange={(e) =>
                  setSelectedTimeRange({
                    ...selectedTimeRange,
                    year: Number(e.target.value),
                  })
                }
                sx={{
                  borderRadius: 2,
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 2,
                    },
                  },
                }}
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

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Товаров"
            value={stats.totalProducts}
            icon={<ShoppingCart />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Категорий"
            value={stats.totalCategories}
            icon={<Category />}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Без фото"
            value={stats.productsWithoutImage}
            icon={<ImageNotSupported />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Пользователей сегодня"
            value={(() => {
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth() + 1).padStart(2, "0");
              const dd = String(today.getDate()).padStart(2, "0");
              const todayStr = `${yyyy}-${mm}-${dd}`;
              const todayStat = stats.views.find((v) => v.name === todayStr);
              return todayStat ? todayStat.value : 0;
            })()}
            icon={<Star />}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 2,
              borderRadius: "20px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Просмотры по категориям
            </Typography>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.views}>
                  <XAxis dataKey="name" stroke="#8a8f98" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="#8a8f98" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill={theme.palette.primary.main}
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 2,
              borderRadius: "20px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Динамика просмотров
            </Typography>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={stats.views}>
                  <XAxis dataKey="name" stroke="#8a8f98" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="#8a8f98" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      stroke: theme.palette.primary.main,
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>
      </Grid>

      {Array.isArray(stats.popularProducts) &&
        stats.popularProducts.length > 0 && (
          <Card
            sx={{
              p: 2,
              mb: 4,
              borderRadius: "20px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Популярные товары
            </Typography>
            <Grid container spacing={2}>
              {stats.popularProducts.map((product, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: "16px",
                      p: 2,
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
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
    </Box>
  );
};

export default memo(StatisticsOverview);

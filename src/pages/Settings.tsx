import { useEffect, useState, ChangeEvent } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db } from "../firebase/firebaseConfig";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  IconButton,
  Modal,
  Slider,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SaveIcon from "@mui/icons-material/Save";

const storage = getStorage();

// Типы для пропсов компонентов
interface ImageUploaderProps {
  label: string;
  imageUrl: string | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDelete: (type: string) => void;
  imageType: string;
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// Компонент для загрузки изображения
const ImageUploader = ({
  label,
  imageUrl,
  onFileChange,
  onDelete,
  imageType,
}: ImageUploaderProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <Box>
      <Typography variant="body1">{label}:</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
        <Button variant="contained" component="label" size="small">
          Загрузить
          <input type="file" hidden onChange={onFileChange} />
        </Button>
        {imageUrl && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={() => setPreviewImage(imageUrl)}>
                <VisibilityIcon />
              </IconButton>
              <Typography variant="body2">Просмотреть</Typography>
            </Box>
            <IconButton color="error" onClick={() => onDelete(imageType)}>
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>

      {/* Модальное окно для предпросмотра */}
      <Modal open={!!previewImage} onClose={() => setPreviewImage(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
          }}
        >
          <img
            src={previewImage || ""}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

// Компонент для цветового выбора
const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
  <TextField
    type="color"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    fullWidth
    label={label}
    InputLabelProps={{ shrink: true }}
    margin="normal"
  />
);

// Интерфейс для структуры настроек
interface SettingsData {
  [key: string]: any;
  // Шаг 1: Настройки приветствия
  welcomeText: string;
  welcomeBackground: string;
  companyLogo: string | null;
  welcomeImage: string | null;

  // Шаг 2: Настройки UI
  backgroundColor: string;
  textColor: string;
  navbarColor: string;
  backgroundImage: string | null;

  // Шаг 3: Настройки карточки товара
  cardTextColor: string;
  cardBorderColor: string;
  cardBackgroundColor: string;
  cardBackgroundOpacity: number;
  cardBlur: number;
  placeholderImage: string | null;
}

const Settings = () => {
  // Настройки приветствия
  const [welcomeText, setWelcomeText] = useState<string>("");
  const [welcomeBackground, setWelcomeBackground] = useState<string>("#f0f0f0");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [welcomeImage, setWelcomeImage] = useState<string | null>(null);
  const [welcomeFile, setWelcomeFile] = useState<File | null>(null);

  // Настройки UI
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [textColor, setTextColor] = useState<string>("#000000");
  const [navbarColor, setNavbarColor] = useState<string>("#333333");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  // Настройки карточки товара
  const [cardTextColor, setCardTextColor] = useState<string>("#000000");
  const [cardBorderColor, setCardBorderColor] = useState<string>("#cccccc");
  const [cardBackgroundColor, setCardBackgroundColor] =
    useState<string>("#ffffff");
  const [cardBackgroundOpacity, setCardBackgroundOpacity] = useState<number>(1);
  const [cardBlur, setCardBlur] = useState<number>(0);
  const [placeholderImage, setPlaceholderImage] = useState<string | null>(null);
  const [placeholderImageFile, setPlaceholderImageFile] = useState<File | null>(
    null
  );

  // Сохраняем изначальное состояние для проверки изменений
  const [initialSettings, setInitialSettings] = useState<SettingsData>({
    welcomeText: "",
    welcomeBackground: "#f0f0f0",
    companyLogo: null,
    welcomeImage: null,
    backgroundColor: "#ffffff",
    textColor: "#000000",
    navbarColor: "#333333",
    backgroundImage: null,
    cardTextColor: "#000000",
    cardBorderColor: "#cccccc",
    cardBackgroundColor: "#ffffff",
    cardBackgroundOpacity: 1,
    cardBlur: 0,
    placeholderImage: null,
  });

  const [settingsChanged, setSettingsChanged] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, "settings", "default");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Шаг 1: Настройки приветствия
          setWelcomeText(data.welcomeText || "");
          setWelcomeBackground(data.welcomeBackground || "#f0f0f0");
          setCompanyLogo(data.companyLogo || null);
          setWelcomeImage(data.welcomeImage || null);

          // Шаг 2: Настройки UI
          setBackgroundColor(data.backgroundColor || "#ffffff");
          setTextColor(data.textColor || "#000000");
          setNavbarColor(data.navbarColor || "#333333");
          setBackgroundImage(data.backgroundImage || null);

          // Шаг 3: Настройки карточки товара
          setCardTextColor(data.cardTextColor || "#000000");
          setCardBorderColor(data.cardBorderColor || "#cccccc");
          setCardBackgroundColor(data.cardBackgroundColor || "#ffffff");
          setCardBackgroundOpacity(
            data.cardBackgroundOpacity !== undefined
              ? data.cardBackgroundOpacity
              : 1
          );
          setCardBlur(data.cardBlur !== undefined ? data.cardBlur : 0);
          setPlaceholderImage(data.placeholderImage || null);

          // Сохраняем изначальное состояние
          setInitialSettings({
            welcomeText: data.welcomeText || "",
            welcomeBackground: data.welcomeBackground || "#f0f0f0",
            companyLogo: data.companyLogo || null,
            welcomeImage: data.welcomeImage || null,
            backgroundColor: data.backgroundColor || "#ffffff",
            textColor: data.textColor || "#000000",
            navbarColor: data.navbarColor || "#333333",
            backgroundImage: data.backgroundImage || null,
            cardTextColor: data.cardTextColor || "#000000",
            cardBorderColor: data.cardBorderColor || "#cccccc",
            cardBackgroundColor: data.cardBackgroundColor || "#ffffff",
            cardBackgroundOpacity:
              data.cardBackgroundOpacity !== undefined
                ? data.cardBackgroundOpacity
                : 1,
            cardBlur: data.cardBlur !== undefined ? data.cardBlur : 0,
            placeholderImage: data.placeholderImage || null,
          });
        } else {
          // Если документа нет, создаем его с дефолтными значениями
          await updateDoc(docRef, initialSettings);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Проверка на изменение настроек для активации кнопки сохранения
  useEffect(() => {
    const currentSettings: SettingsData = {
      welcomeText,
      welcomeBackground,
      companyLogo,
      welcomeImage,
      backgroundColor,
      textColor,
      navbarColor,
      backgroundImage,
      cardTextColor,
      cardBorderColor,
      cardBackgroundColor,
      cardBackgroundOpacity,
      cardBlur,
      placeholderImage,
    };

    // Проверка на любые изменения или наличие новых файлов
    const hasChanges =
      JSON.stringify(currentSettings) !== JSON.stringify(initialSettings) ||
      companyLogoFile !== null ||
      welcomeFile !== null ||
      backgroundFile !== null ||
      placeholderImageFile !== null;

    setSettingsChanged(hasChanges);
  }, [
    welcomeText,
    welcomeBackground,
    companyLogo,
    welcomeImage,
    backgroundColor,
    textColor,
    navbarColor,
    backgroundImage,
    cardTextColor,
    cardBorderColor,
    cardBackgroundColor,
    cardBackgroundOpacity,
    cardBlur,
    placeholderImage,
    companyLogoFile,
    welcomeFile,
    backgroundFile,
    placeholderImageFile,
    initialSettings,
  ]);

  const updateSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "settings", "default");

      // Обработка загрузки файлов
      let newBackgroundImage = backgroundImage;
      if (backgroundFile) {
        const storageRef = ref(storage, `settings/backgroundImage`);
        await uploadBytes(storageRef, backgroundFile, {
          cacheControl: "public, max-age=31536000, immutable",
        });
        newBackgroundImage = await getDownloadURL(storageRef);
      }

      let newWelcomeImage = welcomeImage;
      if (welcomeFile) {
        const storageRef = ref(storage, `settings/welcomeImage`);
        await uploadBytes(storageRef, welcomeFile, {
          cacheControl: "public, max-age=31536000, immutable",
        });
        newWelcomeImage = await getDownloadURL(storageRef);
      }

      let newCompanyLogo = companyLogo;
      if (companyLogoFile) {
        const storageRef = ref(storage, `settings/companyLogo`);
        await uploadBytes(storageRef, companyLogoFile, {
          cacheControl: "public, max-age=31536000, immutable",
        });
        newCompanyLogo = await getDownloadURL(storageRef);
      }

      let newPlaceholderImage = placeholderImage;
      if (placeholderImageFile) {
        const storageRef = ref(storage, `settings/placeholderImage`);
        await uploadBytes(storageRef, placeholderImageFile, {
          cacheControl: "public, max-age=31536000, immutable",
        });
        newPlaceholderImage = await getDownloadURL(storageRef);
      }

      // Подготовка данных для обновления в Firestore
      const updatedSettings: Record<string, any> = {
        // Шаг 1: Настройки приветствия
        welcomeText,
        welcomeBackground,
        companyLogo: newCompanyLogo,
        welcomeImage: newWelcomeImage,

        // Шаг 2: Настройки UI
        backgroundColor,
        textColor,
        navbarColor,
        backgroundImage: newBackgroundImage,

        // Шаг 3: Настройки карточки товара
        cardTextColor,
        cardBorderColor,
        cardBackgroundColor,
        cardBackgroundOpacity,
        cardBlur,
        placeholderImage: newPlaceholderImage,
      };

      // Обновляем документ в Firestore
      await updateDoc(docRef, updatedSettings);

      // Обновляем локальный стейт
      setBackgroundImage(newBackgroundImage);
      setWelcomeImage(newWelcomeImage);
      setCompanyLogo(newCompanyLogo);
      setPlaceholderImage(newPlaceholderImage);

      // Обновляем изначальное состояние после сохранения
      setInitialSettings({
        welcomeText,
        welcomeBackground,
        companyLogo: newCompanyLogo,
        welcomeImage: newWelcomeImage,
        backgroundColor,
        textColor,
        navbarColor,
        backgroundImage: newBackgroundImage,
        cardTextColor,
        cardBorderColor,
        cardBackgroundColor,
        cardBackgroundOpacity,
        cardBlur,
        placeholderImage: newPlaceholderImage,
      });

      // Сбрасываем флаг изменений и файлы
      setSettingsChanged(false);
      setBackgroundFile(null);
      setWelcomeFile(null);
      setCompanyLogoFile(null);
      setPlaceholderImageFile(null);

      alert("Настройки успешно сохранены");
    } catch (error) {
      console.error("Ошибка при обновлении настроек:", error);
      setError("Ошибка при сохранении настроек");
      alert("Ошибка при сохранении настроек");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (type: string) => {
    let storagePath = "";
    let fieldName = "";

    switch (type) {
      case "background":
        storagePath = "settings/backgroundImage";
        fieldName = "backgroundImage";
        break;
      case "welcome":
        storagePath = "settings/welcomeImage";
        fieldName = "welcomeImage";
        break;
      case "logo":
        storagePath = "settings/companyLogo";
        fieldName = "companyLogo";
        break;
      case "placeholder":
        storagePath = "settings/placeholderImage";
        fieldName = "placeholderImage";
        break;
      default:
        console.error("Неизвестный тип изображения для удаления:", type);
        return;
    }

    try {
      setLoading(true);

      // Удаление из Storage
      const storageRef = ref(storage, storagePath);
      try {
        await deleteObject(storageRef);
      } catch (storageError) {
        console.warn(
          "Файл в хранилище не найден или уже был удален:",
          storageError
        );
        // Продолжаем, даже если файл не найден в хранилище
      }

      // Обновляем стейт
      switch (type) {
        case "background":
          setBackgroundImage(null);
          break;
        case "welcome":
          setWelcomeImage(null);
          break;
        case "logo":
          setCompanyLogo(null);
          break;
        case "placeholder":
          setPlaceholderImage(null);
          break;
      }

      // Обновляем Firestore
      const updateData: Record<string, any> = {};
      updateData[fieldName] = null;

      await updateDoc(doc(db, "settings", "default"), updateData);

      // Обновляем initialSettings, чтобы отразить изменения
      setInitialSettings((prev) => ({
        ...prev,
        [fieldName]: null,
      }));

      alert(`Изображение успешно удалено`);
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      setError("Ошибка при удалении изображения");
      alert("Ошибка при удалении изображения");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    } else {
      setter(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Настройки
      </Typography>

      {/* Индикатор загрузки */}
      {loading && (
        <Typography variant="body1" align="center" sx={{ my: 2 }}>
          Загрузка...
        </Typography>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <Typography variant="body1" color="error" align="center" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}

      {/* Кнопка сохранения (фиксированная) */}
      <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={updateSettings}
          disabled={!settingsChanged || loading}
          startIcon={<SaveIcon />}
          size="large"
        >
          Сохранить
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Колонка 1: Настройки приветствия */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Шаг 1: Настройка приветствия
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TextField
                label="Текст приветствия"
                fullWidth
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                margin="normal"
                multiline
                rows={2}
                disabled={loading}
              />

              <ColorPicker
                label="Цвет фона приветствия"
                value={welcomeBackground}
                onChange={setWelcomeBackground}
              />

              <Box sx={{ mt: 2 }}>
                <ImageUploader
                  label="Логотип компании"
                  imageUrl={companyLogo}
                  onFileChange={(e) => handleFileChange(e, setCompanyLogoFile)}
                  onDelete={deleteImage}
                  imageType="logo"
                />
              </Box>

              {/* <Box sx={{ mt: 2 }}>
                <ImageUploader 
                  label="Картинка приветствия" 
                  imageUrl={welcomeImage}
                  onFileChange={(e) => handleFileChange(e, setWelcomeFile)}
                  onDelete={deleteImage}
                  imageType="welcome"
                />
              </Box> */}
            </CardContent>
          </Card>
        </Grid>

        {/* Колонка 2: Настройки UI */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Шаг 2: Настройки внешний Вид
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" gutterBottom>
                Цвета:
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <ColorPicker
                    label="Фон"
                    value={backgroundColor}
                    onChange={setBackgroundColor}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ColorPicker
                    label="Текст"
                    value={textColor}
                    onChange={setTextColor}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ColorPicker
                    label="Панель"
                    value={navbarColor}
                    onChange={setNavbarColor}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <ImageUploader
                  label="Фоновая картинка"
                  imageUrl={backgroundImage}
                  onFileChange={(e) => handleFileChange(e, setBackgroundFile)}
                  onDelete={deleteImage}
                  imageType="background"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Колонка 3: Настройки карточки товара */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Шаг 3: Настройки карточки товара
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <ColorPicker
                    label="Цвет текста"
                    value={cardTextColor}
                    onChange={setCardTextColor}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ColorPicker
                    label="Цвет рамки"
                    value={cardBorderColor}
                    onChange={setCardBorderColor}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ColorPicker
                    label="Цвет фона"
                    value={cardBackgroundColor}
                    onChange={setCardBackgroundColor}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Прозрачность фона:
                </Typography>
                <Slider
                  value={cardBackgroundOpacity}
                  onChange={(_, newValue) =>
                    setCardBackgroundOpacity(newValue as number)
                  }
                  step={0.01}
                  min={0}
                  max={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  disabled={loading}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Размытие фона (px):
                </Typography>
                <Slider
                  value={cardBlur}
                  onChange={(_, newValue) => setCardBlur(newValue as number)}
                  step={1}
                  min={0}
                  max={20}
                  valueLabelDisplay="auto"
                  disabled={loading}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <ImageUploader
                  label="Заглушка фото"
                  imageUrl={placeholderImage}
                  onFileChange={(e) =>
                    handleFileChange(e, setPlaceholderImageFile)
                  }
                  onDelete={deleteImage}
                  imageType="placeholder"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;

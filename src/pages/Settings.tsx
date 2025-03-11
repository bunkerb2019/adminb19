import { useEffect, useState, ChangeEvent } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
  Divider
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
const ImageUploader = ({ label, imageUrl, onFileChange, onDelete, imageType }: ImageUploaderProps) => {
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
          <img src={previewImage || ""} alt="Preview" style={{ maxWidth: "100%", maxHeight: "80vh" }} />
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
  welcomeText: string;
  welcomeBackground: string;
  companyLogo: string | null;
  welcomeImage: string | null;
  backgroundColor: string;
  textColor: string;
  navbarColor: string;
  backgroundImage: string | null;
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
  const [cardBackgroundColor, setCardBackgroundColor] = useState<string>("#ffffff");
  const [cardBackgroundOpacity, setCardBackgroundOpacity] = useState<number>(1);
  const [cardBlur, setCardBlur] = useState<number>(0);
  const [placeholderImage, setPlaceholderImage] = useState<string | null>(null);
  const [placeholderImageFile, setPlaceholderImageFile] = useState<File | null>(null);

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
    placeholderImage: null
  });
  const [settingsChanged, setSettingsChanged] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "default");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Настройки приветствия
          setWelcomeText(data.welcomeText || "");
          setWelcomeBackground(data.welcomeBackground || "#f0f0f0");
          setCompanyLogo(data.companyLogo || null);
          setWelcomeImage(data.welcomeImage || null);

          // Настройки UI
          setBackgroundColor(data.backgroundColor || "#ffffff");
          setTextColor(data.textColor || "#000000");
          setNavbarColor(data.navbarColor || "#333333");
          setBackgroundImage(data.backgroundImage || null);

          // Настройки карточки товара
          setCardTextColor(data.cardTextColor || "#000000");
          setCardBorderColor(data.cardBorderColor || "#cccccc");
          setCardBackgroundColor(data.cardBackgroundColor || "#ffffff");
          setCardBackgroundOpacity(data.cardBackgroundOpacity || 1);
          setCardBlur(data.cardBlur || 0);
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
            cardBackgroundOpacity: data.cardBackgroundOpacity || 1,
            cardBlur: data.cardBlur || 0,
            placeholderImage: data.placeholderImage || null
          });
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
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
      placeholderImage
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
    welcomeText, welcomeBackground, companyLogo, welcomeImage,
    backgroundColor, textColor, navbarColor, backgroundImage,
    cardTextColor, cardBorderColor, cardBackgroundColor, cardBackgroundOpacity,
    cardBlur, placeholderImage, companyLogoFile, welcomeFile, backgroundFile,
    placeholderImageFile, initialSettings
  ]);

  const updateSettings = async () => {
    try {
      const docRef = doc(db, "settings", "default");

      let newBackgroundImage = backgroundImage;
      if (backgroundFile) {
        const storageRef = ref(storage, `settings/backgroundImage`);
        await uploadBytes(storageRef, backgroundFile);
        newBackgroundImage = await getDownloadURL(storageRef);
      }

      let newWelcomeImage = welcomeImage;
      if (welcomeFile) {
        const storageRef = ref(storage, `settings/welcomeImage`);
        await uploadBytes(storageRef, welcomeFile);
        newWelcomeImage = await getDownloadURL(storageRef);
      }

      let newCompanyLogo = companyLogo;
      if (companyLogoFile) {
        const storageRef = ref(storage, `settings/companyLogo`);
        await uploadBytes(storageRef, companyLogoFile);
        newCompanyLogo = await getDownloadURL(storageRef);
      }

      let newPlaceholderImage = placeholderImage;
      if (placeholderImageFile) {
        const storageRef = ref(storage, `settings/placeholderImage`);
        await uploadBytes(storageRef, placeholderImageFile);
        newPlaceholderImage = await getDownloadURL(storageRef);
      }

      // Используем тип Record<string, any> для Firebase
      const updatedSettings: Record<string, any> = {
        // Настройки приветствия
        welcomeText,
        welcomeBackground,
        companyLogo: newCompanyLogo,
        welcomeImage: newWelcomeImage,

        // Настройки UI
        backgroundColor,
        textColor,
        navbarColor,
        backgroundImage: newBackgroundImage,

        // Настройки карточки товара
        cardTextColor,
        cardBorderColor,
        cardBackgroundColor,
        cardBackgroundOpacity,
        cardBlur,
        placeholderImage: newPlaceholderImage,
      };

      await updateDoc(docRef, updatedSettings);

      // Обновляем стейт
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
        placeholderImage: newPlaceholderImage
      });
      setSettingsChanged(false);
      
      // Сбрасываем файлы после загрузки
      setBackgroundFile(null);
      setWelcomeFile(null);
      setCompanyLogoFile(null);
      setPlaceholderImageFile(null);
      
      alert("Настройки успешно сохранены");
    } catch (error) {
      console.error("Ошибка при обновлении настроек:", error);
      alert("Ошибка при сохранении настроек");
    }
  };

  const deleteImage = async (type: string) => {
    let storagePath = "";
    switch (type) {
      case "background":
        storagePath = "settings/backgroundImage";
        break;
      case "welcome":
        storagePath = "settings/welcomeImage";
        break;
      case "logo":
        storagePath = "settings/companyLogo";
        break;
      case "placeholder":
        storagePath = "settings/placeholderImage";
        break;
      default:
        console.error("Неизвестный тип изображения для удаления:", type);
        return;
    }

    const storageRef = ref(storage, storagePath);
    try {
      await deleteObject(storageRef);

      // Обновляем стейт и Firestore
      const updateData: Record<string, any> = {};
      
      switch (type) {
        case "background":
          setBackgroundImage(null);
          updateData.backgroundImage = null;
          break;
        case "welcome":
          setWelcomeImage(null);
          updateData.welcomeImage = null;
          break;
        case "logo":
          setCompanyLogo(null);
          updateData.companyLogo = null;
          break;
        case "placeholder":
          setPlaceholderImage(null);
          updateData.placeholderImage = null;
          break;
      }
      
      await updateDoc(doc(db, "settings", "default"), updateData);
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
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
      
      {/* Кнопка сохранения (фиксированная) */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={updateSettings}
          disabled={!settingsChanged}
          startIcon={<SaveIcon />}
          size="large"
        >
          Сохранить
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Колонка 1: Настройки приветствия */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
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
              
              <Box sx={{ mt: 2 }}>
                <ImageUploader 
                  label="Картинка приветствия" 
                  imageUrl={welcomeImage}
                  onFileChange={(e) => handleFileChange(e, setWelcomeFile)}
                  onDelete={deleteImage}
                  imageType="welcome"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Колонка 2: Настройки UI */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Шаг 2: Настройки UI
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" gutterBottom>Цвета:</Typography>
              
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
          <Card sx={{ height: '100%' }}>
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
                <Typography variant="body2" gutterBottom>Прозрачность фона:</Typography>
                <Slider
                  value={cardBackgroundOpacity}
                  onChange={(_, newValue) => setCardBackgroundOpacity(newValue as number)}
                  step={0.01}
                  min={0}
                  max={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>Размытие фона (px):</Typography>
                <Slider
                  value={cardBlur}
                  onChange={(_, newValue) => setCardBlur(newValue as number)}
                  step={1}
                  min={0}
                  max={20}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <ImageUploader 
                  label="Заглушка фото" 
                  imageUrl={placeholderImage}
                  onFileChange={(e) => handleFileChange(e, setPlaceholderImageFile)}
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
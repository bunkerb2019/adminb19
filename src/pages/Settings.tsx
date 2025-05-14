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
  useMediaQuery,
  Theme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SaveIcon from "@mui/icons-material/Save";

const storage = getStorage();

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

const ImageUploader = ({
  label,
  imageUrl,
  onFileChange,
  onDelete,
  imageType,
}: ImageUploaderProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label}:
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="outlined"
          component="label"
          size="small"
          sx={{ 
            minWidth: 0, 
            px: 1.5,
            fontSize: '0.75rem'
          }}
        >
          Загрузить
          <input type="file" hidden onChange={onFileChange} />
        </Button>
        {imageUrl && (
          <>
            <IconButton
              size="small"
              onClick={() => setPreviewImage(imageUrl)}
              sx={{ color: "text.secondary" }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(imageType)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      <Modal open={!!previewImage} onClose={() => setPreviewImage(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
            borderRadius: 1,
            outline: "none",
          }}
        >
          <img
            src={previewImage || ""}
            alt="Preview"
            style={{ maxWidth: "90vw", maxHeight: "90vh" }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
    <Typography variant="body2" sx={{ 
      minWidth: '80px', 
      fontSize: '0.75rem',
      color: 'text.secondary'
    }}>
      {label}
    </Typography>
    <Box
      component="input"
      type="color"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      sx={{
        width: '32px',
        height: '32px',
        padding: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px',
        cursor: 'pointer',
        '&::-webkit-color-swatch': {
          border: 'none',
          borderRadius: '3px',
        },
        '&::-moz-color-swatch': {
          border: 'none',
          borderRadius: '3px',
        }
      }}
    />
    <Typography variant="body2" sx={{ 
      fontSize: '0.75rem',
      color: 'text.secondary',
      ml: 0.5
    }}>
      {value}
    </Typography>
  </Box>
);

interface SettingsData {
  [key: string]: string | number | boolean | null | undefined;
  welcomeText: string;
  welcomeBackground: string;
  companyLogo: string | null;
  welcomeImage: string | null;
  backgroundColor: string;
  textColor: string;
  navbarColor: string;
  navbarTextColor: string;
  backgroundImage: string | null;
  BackgroundOpacity: number;
  navbarOpacity: number;
  cardTextColor: string;
  cardBorderColor: string;
  cardBackgroundColor: string;
  cardBackgroundOpacity: number;
  cardBlur: number;
  placeholderImage: string | null;
  uiLogo: string | null;
}

const Settings = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  
  const [welcomeText, setWelcomeText] = useState<string>("");
  const [welcomeBackground, setWelcomeBackground] = useState<string>("#f0f0f0");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [welcomeImage, setWelcomeImage] = useState<string | null>(null);
  const [welcomeFile, setWelcomeFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [textColor, setTextColor] = useState<string>("#000000");
  const [navbarColor, setNavbarColor] = useState<string>("#333333");
  const [navbarTextColor, setNavbarTextColor] = useState<string>("#ffffff");
  const [navbarOpacity, setNavbarOpacity] = useState<number>(1);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [cardTextColor, setCardTextColor] = useState<string>("#000000");
  const [cardBorderColor, setCardBorderColor] = useState<string>("#cccccc");
  const [cardBackgroundColor, setCardBackgroundColor] = useState<string>("#ffffff");
  const [cardBackgroundOpacity, setCardBackgroundOpacity] = useState<number>(1);
  const [BackgroundOpacity, setBackgroundOpacity] = useState<number>(1);
  const [cardBlur, setCardBlur] = useState<number>(0);
  const [placeholderImage, setPlaceholderImage] = useState<string | null>(null);
  const [placeholderImageFile, setPlaceholderImageFile] = useState<File | null>(null);
  const [uiLogo, setUiLogo] = useState<string | null>(null);
  const [uiLogoFile, setUiLogoFile] = useState<File | null>(null);

  const [initialSettings, setInitialSettings] = useState<SettingsData>({
    welcomeText: "",
    welcomeBackground: "#f0f0f0",
    companyLogo: null,
    welcomeImage: null,
    backgroundColor: "#ffffff",
    textColor: "#000000",
    navbarColor: "#333333",
    navbarTextColor: "#ffffff",
    backgroundImage: null,
    cardTextColor: "#000000",
    cardBorderColor: "#cccccc",
    cardBackgroundColor: "#ffffff",
    cardBackgroundOpacity: 1,
    BackgroundOpacity: 1,
    navbarOpacity: 1,
    cardBlur: 0,
    placeholderImage: null,
    uiLogo: null,
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

          setWelcomeText(data.welcomeText || "");
          setWelcomeBackground(data.welcomeBackground || "#f0f0f0");
          setCompanyLogo(data.companyLogo || null);
          setWelcomeImage(data.welcomeImage || null);
          setBackgroundColor(data.backgroundColor || "#ffffff");
          setTextColor(data.textColor || "#000000");
          setNavbarTextColor(data.navbarTextColor || "#ffffff");
          setNavbarColor(data.navbarColor || "#333333");
          setBackgroundImage(data.backgroundImage || null);
          setCardTextColor(data.cardTextColor || "#000000");
          setCardBorderColor(data.cardBorderColor || "#cccccc");
          setCardBackgroundColor(data.cardBackgroundColor || "#ffffff");
          setCardBackgroundOpacity(data.cardBackgroundOpacity ?? 1);
          setCardBlur(data.cardBlur ?? 0);
          setPlaceholderImage(data.placeholderImage || null);
          setUiLogo(data.uiLogo || null);
          setBackgroundOpacity(data.BackgroundOpacity ?? 1);
          setNavbarOpacity(data.navbarOpacity ?? 1);

          setInitialSettings({
            welcomeText: data.welcomeText || "",
            welcomeBackground: data.welcomeBackground || "#f0f0f0",
            companyLogo: data.companyLogo || null,
            welcomeImage: data.welcomeImage || null,
            backgroundColor: data.backgroundColor || "#ffffff",
            textColor: data.textColor || "#000000",
            navbarColor: data.navbarColor || "#333333",
            navbarTextColor: data.navbarTextColor || "#333333",
            backgroundImage: data.backgroundImage || null,
            cardTextColor: data.cardTextColor || "#000000",
            cardBorderColor: data.cardBorderColor || "#cccccc",
            cardBackgroundColor: data.cardBackgroundColor || "#ffffff",
            cardBackgroundOpacity: data.cardBackgroundOpacity ?? 1,
            BackgroundOpacity: data.BackgroundOpacity ?? 1,
            navbarOpacity: data.navbarOpacity ?? 1,
            cardBlur: data.cardBlur ?? 0,
            placeholderImage: data.placeholderImage || null,
            uiLogo: data.uiLogo || null,
          });
        } else {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      BackgroundOpacity,
      navbarOpacity,
      cardBlur,
      placeholderImage,
      uiLogo,
      navbarTextColor: ""
    };

    const hasChanges =
      JSON.stringify(currentSettings) !== JSON.stringify(initialSettings) ||
      companyLogoFile !== null ||
      welcomeFile !== null ||
      backgroundFile !== null ||
      placeholderImageFile !== null ||
      uiLogoFile !== null;

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
    BackgroundOpacity,
    navbarOpacity,
    cardBlur,
    placeholderImage,
    uiLogo,
    companyLogoFile,
    welcomeFile,
    backgroundFile,
    placeholderImageFile,
    uiLogoFile,
    initialSettings,
  ]);

  const updateSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "settings", "default");

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

      let newUiLogo = uiLogo;
      if (uiLogoFile) {
        const storageRef = ref(storage, `settings/uiLogo`);
        await uploadBytes(storageRef, uiLogoFile, {
          cacheControl: "public, max-age=31536000, immutable",
        });
        newUiLogo = await getDownloadURL(storageRef);
      }

      const updatedSettings: SettingsData = {
        welcomeText,
        welcomeBackground,
        companyLogo: newCompanyLogo,
        welcomeImage: newWelcomeImage,
        backgroundColor,
        textColor,
        navbarColor,
        navbarTextColor,
        backgroundImage: newBackgroundImage,
        navbarOpacity,
        cardTextColor,
        cardBorderColor,
        cardBackgroundColor,
        cardBackgroundOpacity,
        BackgroundOpacity,
        cardBlur,
        placeholderImage: newPlaceholderImage,
        uiLogo: newUiLogo,
      };

      await updateDoc(docRef, updatedSettings);

      setBackgroundImage(newBackgroundImage);
      setWelcomeImage(newWelcomeImage);
      setCompanyLogo(newCompanyLogo);
      setPlaceholderImage(newPlaceholderImage);
      setUiLogo(newUiLogo);

      setInitialSettings({
        welcomeText,
        welcomeBackground,
        companyLogo: newCompanyLogo,
        welcomeImage: newWelcomeImage,
        backgroundColor,
        textColor,
        navbarColor,
        navbarTextColor,
        backgroundImage: newBackgroundImage,
        cardTextColor,
        cardBorderColor,
        cardBackgroundColor,
        cardBackgroundOpacity,
        BackgroundOpacity,
        navbarOpacity,
        cardBlur,
        placeholderImage: newPlaceholderImage,
        uiLogo: newUiLogo,
      });

      setSettingsChanged(false);
      setBackgroundFile(null);
      setWelcomeFile(null);
      setCompanyLogoFile(null);
      setPlaceholderImageFile(null);
      setUiLogoFile(null);

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
      case "uiLogo":
        storagePath = "settings/uiLogo";
        fieldName = "uiLogo";
        break;
      default:
        console.error("Неизвестный тип изображения для удаления:", type);
        return;
    }

    try {
      setLoading(true);

      const storageRef = ref(storage, storagePath);
      try {
        await deleteObject(storageRef);
      } catch (storageError) {
        console.warn("Файл в хранилище не найден:", storageError);
      }

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
        case "uiLogo":
          setUiLogo(null);
          break;
      }

      await updateDoc(doc(db, "settings", "default"), { [fieldName]: null });

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
    <Container maxWidth="lg" sx={{ 
      mt: isMobile ? 2 : 3, 
      mb: 10, 
      px: isMobile ? 1 : 2,
      '& .MuiCard-root': {
        transition: 'all 0.2s ease',
      }
    }}>
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{
          fontWeight: 600,
          mb: 3,
          fontSize: isMobile ? '1.5rem' : '2rem',
        }}
      >
        Настройки
      </Typography>

      {loading && (
        <Typography variant="body2" align="center" sx={{ my: 2 }}>
          Загрузка...
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error" align="center" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ 
        position: "fixed", 
        bottom: 16, 
        right: 16, 
        zIndex: 1000,
        '& button': {
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }
      }}>
        <Button
          variant="contained"
          color="primary"
          onClick={updateSettings}
          disabled={!settingsChanged || loading}
          startIcon={<SaveIcon />}
          size={isMobile ? "medium" : "large"}
          sx={{
            borderRadius: "12px",
            minWidth: isMobile ? '120px' : '160px',
            fontSize: isMobile ? '0.875rem' : '1rem',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
            transition: 'transform 0.2s ease',
          }}
        >
          {isMobile ? 'Сохранить' : 'Сохранить'}
        </Button>
      </Box>

      <Grid container spacing={isMobile ? 1 : 2}>
        {[1, 2, 3].map((step) => (
          <Grid item xs={12} md={4} key={step}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 2,
                boxShadow: 1,
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ 
                p: isMobile ? 1.5 : 2,
                '&:last-child': {
                  pb: isMobile ? 1.5 : 2
                }
              }}>
                {step === 1 && (
                  <>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 600, 
                      mb: 1.5,
                      fontSize: isMobile ? '1rem' : '1.1rem'
                    }}>
                      Приветствие
                    </Typography>
                    <Divider sx={{ mb: 1.5 }} />

                    <TextField
                      label="Текст приветствия"
                      fullWidth
                      size="small"
                      value={welcomeText}
                      onChange={(e) => setWelcomeText(e.target.value)}
                      margin="dense"
                      multiline
                      rows={2}
                      disabled={loading}
                      sx={{ mb: 2 }}
                    />

                    <ColorPicker
                      label="Фон приветствия"
                      value={welcomeBackground}
                      onChange={setWelcomeBackground}
                    />

                    <ImageUploader
                      label="Логотип компании"
                      imageUrl={companyLogo}
                      onFileChange={(e) => handleFileChange(e, setCompanyLogoFile)}
                      onDelete={deleteImage}
                      imageType="logo"
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 600, 
                      mb: 1.5,
                      fontSize: isMobile ? '1rem' : '1.1rem'
                    }}>
                      Внешний вид
                    </Typography>
                    <Divider sx={{ mb: 1.5 }} />

                    <ImageUploader
                      label="Логотип (центр)"
                      imageUrl={uiLogo}
                      onFileChange={(e) => handleFileChange(e, setUiLogoFile)}
                      onDelete={deleteImage}
                      imageType="uiLogo"
                    />

                    <Typography variant="body2" sx={{ 
                      mt: 2,
                      mb: 1,
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      fontWeight: 500
                    }}>
                      Цвета интерфейса:
                    </Typography>

                    <ColorPicker label="Фон" value={backgroundColor} onChange={setBackgroundColor} />
                    <ColorPicker label="Текст" value={textColor} onChange={setTextColor} />
                    <ColorPicker label="Активный" value={navbarTextColor} onChange={setNavbarTextColor} />
                    <ColorPicker label="Панель" value={navbarColor} onChange={setNavbarColor} />

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.75rem',
                        color: 'text.secondary'
                      }}>
                        Прозрачность фона: {BackgroundOpacity.toFixed(2)}
                      </Typography>
                      <Slider
                        value={BackgroundOpacity}
                        onChange={(_, newValue) => setBackgroundOpacity(newValue as number)}
                        step={0.01}
                        min={0}
                        max={1}
                        size="small"
                        disabled={loading}
                      />
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.75rem',
                        color: 'text.secondary'
                      }}>
                        Прозрачность панели: {navbarOpacity.toFixed(2)}
                      </Typography>
                      <Slider
                        value={navbarOpacity}
                        onChange={(_, newValue) => setNavbarOpacity(newValue as number)}
                        step={0.01}
                        min={0}
                        max={1}
                        size="small"
                        disabled={loading}
                      />
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <ImageUploader
                        label="Фоновая картинка"
                        imageUrl={backgroundImage}
                        onFileChange={(e) => handleFileChange(e, setBackgroundFile)}
                        onDelete={deleteImage}
                        imageType="background"
                      />
                    </Box>
                  </>
                )}

                {step === 3 && (
                  <>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 600, 
                      mb: 1.5,
                      fontSize: isMobile ? '1rem' : '1.1rem'
                    }}>
                      Карточка товара
                    </Typography>
                    <Divider sx={{ mb: 1.5 }} />

                    <ColorPicker label="Текст" value={cardTextColor} onChange={setCardTextColor} />
                    <ColorPicker label="Рамка" value={cardBorderColor} onChange={setCardBorderColor} />
                    <ColorPicker label="Фон" value={cardBackgroundColor} onChange={setCardBackgroundColor} />

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.75rem',
                        color: 'text.secondary'
                      }}>
                        Прозрачность фона: {cardBackgroundOpacity.toFixed(2)}
                      </Typography>
                      <Slider
                        value={cardBackgroundOpacity}
                        onChange={(_, newValue) => setCardBackgroundOpacity(newValue as number)}
                        step={0.01}
                        min={0}
                        max={1}
                        size="small"
                        disabled={loading}
                      />
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.75rem',
                        color: 'text.secondary'
                      }}>
                        Размытие фона (px): {cardBlur}
                      </Typography>
                      <Slider
                        value={cardBlur}
                        onChange={(_, newValue) => setCardBlur(newValue as number)}
                        step={1}
                        min={0}
                        max={20}
                        size="small"
                        disabled={loading}
                      />
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <ImageUploader
                        label="Заглушка фото"
                        imageUrl={placeholderImage}
                        onFileChange={(e) => handleFileChange(e, setPlaceholderImageFile)}
                        onDelete={deleteImage}
                        imageType="placeholder"
                      />
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Settings;
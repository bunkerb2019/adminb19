import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Slider,
  Stack,
  Paper,
  CircularProgress,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import { db, ICON_UPLOAD_META } from "../firebase/firebaseConfig";
import { saveBarSx } from "../styles/saveBarSx";
import { showSaved } from "./SavedCheck";

type Lang = "ru" | "ro" | "en";
type Label = Record<Lang, string>;

interface ContactLink {
  label: Label;
  url: string;
  icon: string;
  bgColor?: string;
  bgOpacity?: number;
  textColor?: string;
}

interface ContactButton {
  number: string;
  text: Label;
  color?: string;
  textColor?: string;
}

const LANGS: { key: Lang; label: string }[] = [
  { key: "ru", label: "Русский" },
  { key: "ro", label: "Română" },
  { key: "en", label: "English" },
];
const emptyLabel = (): Label => ({ ru: "", ro: "", en: "" });
const storage = getStorage();

const cardSx = { p: { xs: 2, sm: 2.5 }, borderRadius: "24px", bgcolor: "background.paper" };
const PREVIEW_BG = "#1b1b1b";

const hexToRgba = (hex: string, opacity: number) => {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${opacity})`;
};

const SectionTitle = ({ title, hint }: { title: string; hint: string }) => (
  <Box sx={{ mb: 1.25 }}>
    <Typography fontWeight={700} fontSize={13} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {hint}
    </Typography>
  </Box>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <Box
    component="label"
    sx={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      p: 1,
      pr: 1.5,
      borderRadius: 999,
      bgcolor: "#fff",
      cursor: "pointer",
    }}
  >
    <Box
      component="input"
      type="color"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      sx={{
        width: 32,
        height: 32,
        p: 0,
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: "50%",
        overflow: "hidden",
        cursor: "pointer",
        bgcolor: "transparent",
        "&::-webkit-color-swatch-wrapper": { p: 0 },
        "&::-webkit-color-swatch": { border: "none", borderRadius: "50%" },
        "&::-moz-color-swatch": { border: "none", borderRadius: "50%" },
      }}
    />
    <Box sx={{ minWidth: 0 }}>
      <Typography fontSize={12} color="text.secondary" lineHeight={1.2}>
        {label}
      </Typography>
      <Typography fontSize={13} fontWeight={600} lineHeight={1.2}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const LangFields = ({
  value,
  onChange,
  label,
}: {
  value: Label;
  onChange: (lang: Lang, v: string) => void;
  label: string;
}) => (
  <Stack spacing={1.25}>
    {LANGS.map(({ key, label: langLabel }) => (
      <TextField
        key={key}
        size="small"
        fullWidth
        label={`${label} · ${langLabel}`}
        value={value?.[key] || ""}
        onChange={(e) => onChange(key, e.target.value)}
      />
    ))}
  </Stack>
);

const LinkPreview = ({ link }: { link: ContactLink }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 1.5,
      py: 1,
      borderRadius: 999,
      minWidth: 0,
      background: link.bgColor ? hexToRgba(link.bgColor, link.bgOpacity ?? 1) : "transparent",
      color: link.textColor || "#fff",
      fontWeight: 600,
      fontSize: 14,
    }}
  >
    {link.icon?.startsWith("http") ? (
      <img src={link.icon} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
    ) : (
      <LinkIcon sx={{ fontSize: 22 }} />
    )}
    <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {link.label?.ru || "Без названия"}
    </Box>
  </Box>
);

const ContactSettingsPopup = () => {
  const [header, setHeader] = useState<Label>(emptyLabel());
  const [headerTextColor, setHeaderTextColor] = useState("#ffffff");
  const [links, setLinks] = useState<ContactLink[]>([]);
  const [button, setButton] = useState<ContactButton>({
    number: "",
    text: emptyLabel(),
    color: "#61e222",
    textColor: "#ffffff",
  });
  const [openLink, setOpenLink] = useState<number | null>(null);
  const [iconLoading, setIconLoading] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getDoc(doc(db, "contact", "header")),
      getDoc(doc(db, "contact", "links")),
      getDoc(doc(db, "contact", "button")),
    ]).then(([h, l, b]) => {
      const hd = h.data() || {};
      setHeader(hd.header || emptyLabel());
      setHeaderTextColor(hd.headerTextColor || "#ffffff");
      const ld = l.data() || {};
      setLinks(Array.isArray(ld.links) ? ld.links : []);
      const bd = b.data() || {};
      setButton({
        number: bd.number || "",
        text: bd.text || emptyLabel(),
        color: bd.color || "#61e222",
        textColor: bd.textColor || "#ffffff",
      });
      setLoading(false);
    });
  }, []);

  const patchLink = (idx: number, patch: Partial<ContactLink>) =>
    setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const addLink = () => {
    setLinks((prev) => [
      ...prev,
      { label: emptyLabel(), url: "", icon: "", bgColor: "#575757", bgOpacity: 0.6, textColor: "#ffffff" },
    ]);
    setOpenLink(links.length);
  };

  const removeLink = (idx: number) => {
    if (!window.confirm(`Удалить ссылку «${links[idx].label?.ru || links[idx].url}»?`)) return;
    setLinks((prev) => prev.filter((_, i) => i !== idx));
    setOpenLink(null);
  };

  const uploadIcon = async (idx: number, file?: File) => {
    if (!file) return;
    setIconLoading(idx);
    try {
      const storageRef = ref(storage, `contact-links/${Date.now()}`);
      await uploadBytes(storageRef, file, ICON_UPLOAD_META);
      patchLink(idx, { icon: await getDownloadURL(storageRef) });
    } finally {
      setIconLoading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        setDoc(doc(db, "contact", "header"), { header, headerTextColor }),
        setDoc(doc(db, "contact", "links"), { links }),
        setDoc(doc(db, "contact", "button"), { ...button }),
      ]);
      showSaved();
    } catch (error) {
      console.error("Ошибка сохранения контактов:", error);
      alert("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <SectionTitle title="Заголовок" hint="Крупный текст вверху страницы контактов" />
      <Paper elevation={0} sx={{ ...cardSx, mb: 3 }}>
        <Box sx={{ bgcolor: PREVIEW_BG, borderRadius: "16px", p: 2, mb: 2, textAlign: "center" }}>
          <Typography fontWeight={700} fontSize={20} sx={{ color: headerTextColor }}>
            {header.ru || "Заголовок"}
          </Typography>
        </Box>
        <LangFields label="Заголовок" value={header} onChange={(lang, v) => setHeader((p) => ({ ...p, [lang]: v }))} />
        <Box sx={{ mt: 1.5, display: "flex" }}>
          <ColorField label="Цвет текста" value={headerTextColor} onChange={setHeaderTextColor} />
        </Box>
      </Paper>

      <SectionTitle title={`Ссылки · ${links.length}`} hint="Кнопки соцсетей и сайтов. Нажмите на ссылку, чтобы изменить" />
      <Stack spacing={1.25} sx={{ mb: 3 }}>
        {links.map((link, idx) => {
          const open = openLink === idx;
          return (
            <Paper key={idx} elevation={0} sx={{ ...cardSx, p: 0, overflow: "hidden", border: open ? "2px solid #111" : "2px solid transparent" }}>
              <Box
                component="button"
                type="button"
                onClick={() => setOpenLink(open ? null : idx)}
                sx={{ all: "unset", cursor: "pointer", boxSizing: "border-box", width: "100%", display: "flex", alignItems: "center", gap: 1.5, p: 1.5 }}
              >
                <Box sx={{ bgcolor: PREVIEW_BG, borderRadius: 999, p: 0.5, minWidth: 0, maxWidth: "60%" }}>
                  <LinkPreview link={link} />
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
                  {link.url || "нет адреса"}
                </Typography>
                <ExpandMoreIcon sx={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />
              </Box>

              <Collapse in={open} unmountOnExit>
                <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2 }}>
                  <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
                    Иконка
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "16px",
                        bgcolor: PREVIEW_BG,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                      }}
                    >
                      {iconLoading === idx ? (
                        <CircularProgress size={22} sx={{ color: "#fff" }} />
                      ) : link.icon?.startsWith("http") ? (
                        <img src={link.icon} alt="" style={{ width: 32, height: 32, objectFit: "contain" }} />
                      ) : (
                        <LinkIcon />
                      )}
                    </Box>
                    <Button component="label" variant="outlined" size="small">
                      {link.icon ? "Заменить" : "Загрузить"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          uploadIcon(idx, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </Button>
                    {link.icon && (
                      <Button size="small" color="error" onClick={() => patchLink(idx, { icon: "" })}>
                        Убрать
                      </Button>
                    )}
                  </Stack>

                  <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
                    Куда ведёт
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={link.url}
                    onChange={(e) => patchLink(idx, { url: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
                    Текст на кнопке
                  </Typography>
                  <LangFields
                    label="Текст"
                    value={link.label}
                    onChange={(lang, v) => patchLink(idx, { label: { ...link.label, [lang]: v } })}
                  />

                  <Typography fontWeight={700} fontSize={14} sx={{ mt: 2, mb: 1 }}>
                    Цвета
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <ColorField label="Текст" value={link.textColor || "#ffffff"} onChange={(v) => patchLink(idx, { textColor: v })} />
                    <ColorField label="Фон" value={link.bgColor || "#575757"} onChange={(v) => patchLink(idx, { bgColor: v })} />
                  </Stack>
                  <Box sx={{ px: 1, mt: 1.5 }}>
                    <Typography fontSize={12} color="text.secondary">
                      Прозрачность фона · {Math.round((link.bgOpacity ?? 1) * 100)}%
                    </Typography>
                    <Slider
                      size="small"
                      min={0}
                      max={1}
                      step={0.05}
                      value={link.bgOpacity ?? 1}
                      onChange={(_, v) => patchLink(idx, { bgOpacity: v as number })}
                      sx={{ color: "#111" }}
                    />
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button variant="contained" fullWidth onClick={() => setOpenLink(null)}>
                      Готово
                    </Button>
                    <IconButton color="error" onClick={() => removeLink(idx)} aria-label="Удалить ссылку">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          );
        })}
        <Button
          variant="outlined"
          size="large"
          startIcon={<AddIcon />}
          onClick={addLink}
          sx={{ borderStyle: "dashed", height: 56, borderRadius: "24px" }}
        >
          Добавить ссылку
        </Button>
      </Stack>

      <SectionTitle title="Кнопка звонка" hint="Большая кнопка внизу страницы, по нажатию звонит на номер" />
      <Paper elevation={0} sx={cardSx}>
        <Box sx={{ bgcolor: PREVIEW_BG, borderRadius: "16px", p: 2, mb: 2, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              px: 4,
              py: 1.25,
              borderRadius: 999,
              fontWeight: 700,
              bgcolor: button.color,
              color: button.textColor,
            }}
          >
            {button.text.ru || button.number || "Позвонить"}
          </Box>
        </Box>
        <TextField
          size="small"
          fullWidth
          type="tel"
          label="Номер телефона"
          placeholder="+373..."
          value={button.number}
          onChange={(e) => setButton((p) => ({ ...p, number: e.target.value }))}
          sx={{ mb: 1.25 }}
        />
        <LangFields
          label="Текст"
          value={button.text}
          onChange={(lang, v) => setButton((p) => ({ ...p, text: { ...p.text, [lang]: v } }))}
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
          <ColorField label="Цвет кнопки" value={button.color || "#61e222"} onChange={(v) => setButton((p) => ({ ...p, color: v }))} />
          <ColorField label="Цвет текста" value={button.textColor || "#ffffff"} onChange={(v) => setButton((p) => ({ ...p, textColor: v }))} />
        </Stack>
      </Paper>

      <Box sx={saveBarSx}>
        <Button variant="contained" size="large" onClick={handleSave} disabled={saving}>
          {saving ? "Сохраняю..." : "Сохранить"}
        </Button>
      </Box>
    </Box>
  );
};

export default ContactSettingsPopup;

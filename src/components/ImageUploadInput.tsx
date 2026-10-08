import React, {useState} from 'react';
import {Button, Typography, Box} from '@mui/material';

type ImageUploadInputProps = {
  image: File | null,
  setImage: React.Dispatch<React.SetStateAction<File | null>>
  setImagePreview?: React.Dispatch<React.SetStateAction<string | undefined>>
}

const MAX_SIDE = 1600;

// HEIC/AVIF и т.п. не открываются в Chrome/Android, поэтому всегда сохраняем JPEG
const toJpeg = async (file: File): Promise<File> => {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (!blob) throw new Error('toBlob failed');
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({ setImage, image, setImagePreview }) => {
  const [error, setError] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = e.target.files;
    if (files && files[0]) {
      let file = files[0];
      e.target.value = '';

      if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) {
        setError('Only image files are allowed.');
        setImage(null);
        return;
      }

      try {
        file = await toJpeg(file);
      } catch {
        setError('Этот формат не открывается в браузере (например, HEIC с iPhone). Сохраните фото как JPEG или PNG.');
        setImage(null);
        return;
      }

      if (file.size > 1 * 1024 * 1024) {
        setError('File size exceeds 1MB limit.');
        setImage(null);
        return;
      }

      setImage(file);
      if (setImagePreview) {
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  return (
    <Box>
      <input
        accept="image/*,.heic,.heif"
        style={{ display: 'none' }}
        id="mui-file-upload"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="mui-file-upload">
        <Button variant="contained" component="span">
          Choose Image
        </Button>
      </label>
      {image && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Selected file: {image.name}
        </Typography>
      )}
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

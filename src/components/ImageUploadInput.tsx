import React, {useState} from 'react';
import {Button, Typography, Box} from '@mui/material';

type ImageUploadInputProps = {
  image: File | null,
  setImage: React.Dispatch<React.SetStateAction<File | null>>
  setImagePreview?: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({ setImage, image, setImagePreview }) => {
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];

      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
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
        accept="image/*"
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

import React, {useState} from 'react';
import {Button, Typography, Box} from '@mui/material';

type ImageUploadInputProps = {
  image: File | null,
  setImage: React.Dispatch<React.SetStateAction<File | null>>
  setImagePreview?: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({setImage, image, setImagePreview}) => {
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = e.target.files;
    if (files && files[0]) {
      // Check if the file is an image
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        setImage(null);
        return;
      }
      // Check if file size exceeds 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        setImage(null);
        return;
      }
      setImage(file);
      if (setImagePreview) {
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleUpload = () => {
    if (!image) {
      setError('No file selected.');
      return;
    }
    // Place your file upload logic here
    console.log('Uploading file:', image);
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{display: 'none'}}
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
        <Typography variant="body1" sx={{mt: 2}}>
          Selected file: {image.name}
        </Typography>
      )}
      {error && (
        <Typography variant="body2" color="error" sx={{mt: 1}}>
          {error}
        </Typography>
      )}
      <Button
        variant="contained"
        sx={{mt: 2}}
        onClick={handleUpload}
        disabled={!image || !!error}
      >
        Upload
      </Button>
    </Box>
  );
};

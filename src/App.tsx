import React, { useState } from 'react';
import Compressor from 'compressorjs';
import './App.css'

function App() {
  //State values for input image and output string
  const [image, setImage] = useState<string | null>(null);
  const [boxShadowString, setBoxShadowString] = useState<string>('');

  const [pixelSize, setPixelSize] = useState(10)
  const [imageSize, setImageSize] = useState(16)

  //Function to handle image upload 
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        compressImage(file);
      }
    }
  };

  //Function to compress image into a 16x16 image 
  const compressImage = (file: File) => {
    new Compressor(file, {
      quality: 1.0,
      maxWidth: 16,
      maxHeight: 16,
      success(result) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target) {
            const compressedImage = event.target.result as string;
            setImage(compressedImage); //setImage state 
            create2DArrayFromCompressedImage(compressedImage); // Removed assignment to pixelArray
          }
        };
        reader.readAsDataURL(result);
      },
      error(err) {
        console.error('Error compressing image:', err);
      },
    });
  };

  //Function to index pixels into an array with values as hexcodes
  const create2DArrayFromCompressedImage = (imageAsBase64: string) => {
    const image = new Image();
    image.src = imageAsBase64;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = imageSize; //16
      canvas.height = imageSize; //16
      const context = canvas.getContext('2d');

      if (context) {
        context.drawImage(image, 0, 0, imageSize, imageSize);
        const imageData = context.getImageData(0, 0, imageSize, imageSize);
        const pixelData = imageData.data;

        const pixelArray = new Array(imageSize);

        for (let y = 0; y < imageSize; y++) {
          pixelArray[y] = new Array(imageSize);
          for (let x = 0; x < imageSize; x++) {
            const offset = (y * imageSize + x) * 4; // 4 channels (R, G, B, A) per pixel
            const hexColor = rgbToHex(
              pixelData[offset],
              pixelData[offset + 1],
              pixelData[offset + 2]
            );
            pixelArray[y][x] = hexColor;
          }
        }

        // Now you have the 16x16 compressed image and the 2D array of hex color values
        console.log(pixelArray);
        createStringOutput(pixelArray); 
        
        const compressedImage = canvas.toDataURL('image/jpeg', 0.6);
        console.log(compressedImage);
      }
    };
  };


  //Function to create box shadow string input
  const createStringOutput = (pixelArray: string[][]) => {
    const boxShadowValues = [];

    for (let row = 0; row < pixelArray.length; row++) {
      for (let col = 0; col < pixelArray[row].length; col++) {
        const hexColor = pixelArray[row][col];
        const x = col * pixelSize;
        const y = row * pixelSize;

        const boxShadowValue = `${x}px ${y}px ${hexColor}`;
        boxShadowValues.push(boxShadowValue);
      }
    }

    const boxShadowString = `box-shadow: ${boxShadowValues.join(', ')};`;
    setBoxShadowString(boxShadowString); // Set boxShadowString State
  };

  // Function to convert RGB values to a hex color
  const rgbToHex = (r: any, g: any, b: any) => {
    return `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  };

  const handlePixelChange = (e: any) => {
    const inputValue = e.target.value;
    const numericValue = parseInt(inputValue, 10); 
    setPixelSize(isNaN(numericValue) ? 0 : numericValue); 
  };

  const handleImageSizeChange = (e: any) =>{
    setImageSize(e.target.value)
  }
  

  return (
    <>
      <div className="image-upload">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <label>
          Pixel Size (px): 
        </label>
        <input
        type="text"
        value={pixelSize}
        onChange={handlePixelChange}
      />
      <label>
          Image Size: 
        </label>
        <input
        type="text"
        value={imageSize}
        onChange={handleImageSizeChange}
      />
      </div>
      <div className="image-display">
        {image && <img src={image} alt="Uploaded" />}
      </div>
      <div className='string-output'>
        <h1>output:</h1>
        <p>{boxShadowString}</p>
      </div> 
    </>
  );
  
}

export default App;



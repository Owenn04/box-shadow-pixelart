import React, { useState } from 'react';
import Compressor from 'compressorjs';
import './App.css'

function App() {
  //State values for input image and output string
  const [image, setImage] = useState<string | null>(null);
  const [boxShadowString, setBoxShadowString] = useState<string>('');

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
      canvas.width = 16;
      canvas.height = 16;
      const context = canvas.getContext('2d');

      if (context) {
        context.drawImage(image, 0, 0, 16, 16);
        const imageData = context.getImageData(0, 0, 16, 16);
        const pixelData = imageData.data;

        const pixelArray = new Array(16);

        for (let y = 0; y < 16; y++) {
          pixelArray[y] = new Array(16);
          for (let x = 0; x < 16; x++) {
            const offset = (y * 16 + x) * 4; // 4 channels (R, G, B, A) per pixel
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
        const x = col * 10;
        const y = row * 10;

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

  

  return (
    <>
      <div className="image-upload">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
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



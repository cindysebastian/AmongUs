import React, { useState, useEffect } from 'react';

const CollisionMask = ({ imageUrl }) => {
  const [mask, setMask] = useState(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      setImageWidth(image.width);
      setImageHeight(image.height);
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, image.width, image.height);
      const imageData = context.getImageData(0, 0, image.width, image.height);
      const collisionMask = createCollisionMask(imageData);
      setMask(collisionMask);
    };
    image.src = imageUrl;
  }, [imageUrl]);

  const createCollisionMask = (imageData) => {
    const { width, height, data } = imageData;
    const mask = new Uint8Array(width * height);

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      const pixelIndex = i / 4; // Each pixel occupies 4 bytes (RGBA)
      mask[pixelIndex] = alpha > 5 ? 255 : 0; // Store 255 if pixel is solid, 0 otherwise
    }

    return mask;
  };

  const renderMask = () => {
    if (!mask) return null;

    const canvas = document.createElement('canvas');
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(imageWidth, imageHeight);

    for (let i = 0; i < mask.length; i++) {
      const pixelValue = mask[i];
      imageData.data[i * 4] = pixelValue;
      imageData.data[i * 4 + 1] = pixelValue;
      imageData.data[i * 4 + 2] = pixelValue;
      imageData.data[i * 4 + 3] = 255; // Set alpha to 255 for full opacity
    }

    context.putImageData(imageData, 0, 0);
    return <img src={canvas.toDataURL()} alt="Collision Mask" />;
  };

  return (
    <div>
      <h3>Collision Mask</h3>
      {renderMask()}
    </div>
  );
};

export default CollisionMask;

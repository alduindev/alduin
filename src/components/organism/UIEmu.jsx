import { useEffect, useRef } from 'react';
import { NES } from 'jsnes';

export default function UIEmu() {
  const canvasRef = useRef(null);
  const nesRef = useRef(null);

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    const nes = new NES({
      onFrame: (frameBuffer) => {
        const imageData = context.createImageData(256, 240);
        for (let i = 0; i < frameBuffer.length; i++) {
          const j = i * 4;
          const color = frameBuffer[i];
          imageData.data[j] = color & 0xff;
          imageData.data[j + 1] = (color >> 8) & 0xff;
          imageData.data[j + 2] = (color >> 16) & 0xff;
          imageData.data[j + 3] = 0xff;
        }
        context.putImageData(imageData, 0, 0);
      }
    });

    nesRef.current = nes;

    return () => {
      if (nesRef.current) {
        nesRef.current.frame = () => {};
      }
    };
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryString = e.target.result;
      nesRef.current.loadROM(binaryString);
      nesRef.current.start();
    };
    reader.readAsBinaryString(file); // 👈 ESTE es el cambio clave
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input type="file" accept="*" onChange={handleFileUpload} />
      <canvas ref={canvasRef} width="256" height="240" className="border shadow-md" />
    </div>
  );
}

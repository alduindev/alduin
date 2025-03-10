import { useEffect, useRef, useState } from "react";

export default function App() {
  const originalText = "alduindev";
  const textRef = useRef(null);
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showSmiley, setShowSmiley] = useState(false);

  // Caracteres de diferentes alfabetos y símbolos
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:',.<>/?~¥€£¢₹©®™✓•–—«»‹›„“”„‘’‚‽※♠♣♥♦♪♫♬𠜎𠜱𠝹𠱓";

  useEffect(() => {
    let iteration = 0;
    const maxLength = 15; // Longitud máxima del texto
    const interval = setInterval(() => {
      if (iteration < maxLength) {
        // Construye el texto aleatorio
        const randomText = Array.from({ length: maxLength }, () =>
          characters.charAt(Math.floor(Math.random() * characters.length))
        ).join("");

        setDisplayText(randomText);
        iteration++;
      } else {
        // Poco a poco se convierte en "Alduin"
        setDisplayText((prevText) =>
          originalText
            .split("")
            .map((char, index) => {
              if (index < iteration - maxLength) {
                return originalText[index];
              }
              return characters.charAt(
                Math.floor(Math.random() * characters.length)
              );
            })
            .join("")
        );
        iteration++;

        if (iteration > maxLength + originalText.length) {
          clearInterval(interval);
          setIsComplete(true);

          // Latido y Carita Feliz después de "Alduin"
          setTimeout(() => {
            setShowSmiley(true);
          }, 10000); // Aparece la carita feliz después de 10 segundos

          // Reiniciar ciclo después de 10 segundos
          setTimeout(() => {
            setIsComplete(false);
            setShowSmiley(false);
            setDisplayText("");
            intervalStart(); // Reinicia la animación
          }, 15000);
        }
      }
    }, 250); // Velocidad más lenta

    return () => clearInterval(interval);
  }, []);

  // Función para reiniciar el intervalo
  const intervalStart = () => {
    let iteration = 0;
    const maxLength = 15;
    const interval = setInterval(() => {
      if (iteration < maxLength) {
        const randomText = Array.from({ length: maxLength }, () =>
          characters.charAt(Math.floor(Math.random() * characters.length))
        ).join("");
        setDisplayText(randomText);
        iteration++;
      } else {
        setDisplayText((prevText) =>
          originalText
            .split("")
            .map((char, index) => {
              if (index < iteration - maxLength) {
                return originalText[index];
              }
              return characters.charAt(
                Math.floor(Math.random() * characters.length)
              );
            })
            .join("")
        );
        iteration++;

        if (iteration > maxLength + originalText.length) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(() => {
            setShowSmiley(true);
          }, 3000);

          setTimeout(() => {
            setIsComplete(false);
            setShowSmiley(false);
            setDisplayText("");
            intervalStart(); // Reinicia la animación
          }, 10000);
        }
      }
    }, 250);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full z-0 animate-matrix-bg"></div>
      <h1
        ref={textRef}
        className={`text-[10vw] sm:text-[8vw] md:text-[6vw] lg:text-[5vw] font-bold animate-matrix-green ${
          isComplete ? "text-white animate-heartbeat" : "text-transparent"
        } z-10`}
      >
        {showSmiley ? (
          <span className="text-white">☺</span>
        ) : (
          <span className="relative">
            <span className="absolute top-0 left-0 z-0 text-[#52fc11] opacity-30">
              {displayText}
            </span>
            <span className="relative z-10 text-white">{displayText}</span>
          </span>
        )}
      </h1>
    </div>
  );
}

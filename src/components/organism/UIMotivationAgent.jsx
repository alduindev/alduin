import React, { useState, useEffect } from "react";

const UIMotivationalAgent = () => {
  const [quotes, setQuotes] = useState([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const API_KEY = "AIzaSyBEznup89KkKo9h8sqCq4H-pCynbUvnIxc";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "☀️ Buenos días";
    if (hour >= 12 && hour < 18) return "🌤️ Buenas tardes";
    return "🌙 Buenas noches";
  };

  const getBackgroundClass = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "bg-yellow-300 text-gray-900"; 
    if (hour >= 12 && hour < 18) return "bg-orange-400 text-gray-900"; 
    return "bg-gray-900 text-white"; 
  };

  const extractJSON = (text) => {
    try {
      const jsonText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonText).frases;
    } catch {
      return ["Error al obtener frases."];
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ 
                  text: `Dame una lista de 5 frases motivacionales variadas, que incluyan:
                    - Frases de libros famosos.
                    - Frases inspiradoras de películas.
                    - Citas de científicos o filósofos.
                    - Frases de personajes históricos.
                    - Reflexiones originales sobre la vida y la superación.

                    La respuesta debe estar en formato JSON exacto así:
                    \`\`\`json
                    {
                      "frases": [
                        "Frase 1 - Autor/Fuente",
                        "Frase 2 - Autor/Fuente",
                        "Frase 3 - Autor/Fuente",
                        "Frase 4 - Autor/Fuente",
                        "Frase 5 - Autor/Fuente"
                      ]
                    }
                    \`\`\`
                  ` 
                }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      setQuotes(extractJSON(rawText));
      setCurrentQuoteIndex(0);
    } catch (error) {
      setQuotes(["Error al obtener frases."]);
    }
  };

  useEffect(() => {
    if (quotes.length === 0) fetchQuotes();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < quotes.length) {
          return nextIndex;
        } else {
          fetchQuotes();
          return 0;
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [quotes]);

  const getQuoteParts = (quote) => {
    if (!quote) return ["Cargando frases...", ""];
    const parts = quote.split(" - ");
    return parts.length > 1 ? [parts[0], parts.slice(1).join(" - ")] : [quote, ""];
  };

  const [quoteText, quoteAuthor] = getQuoteParts(quotes[currentQuoteIndex]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${getBackgroundClass()} text-center p-4`}>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        {getGreeting()}
      </h1>
      <div className={`bg-white ${getBackgroundClass()} text-center p-4 rounded-lg shadow-md max-w-lg`}>
        <p className="text-lg italic">"{quoteText}"</p>
        {quoteAuthor && <p className="text-[0.8rem] text-gray-500 mt-2">— {quoteAuthor}</p>}
      </div>
    </div>
  );
};

export default UIMotivationalAgent;

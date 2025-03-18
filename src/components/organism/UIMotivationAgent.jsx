import React, { useState, useEffect } from "react";
import { URL_GEMINI_API } from "../../environments/environment";

const UIMotivationalAgent = () => {
  const [quotes, setQuotes] = useState([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [shownQuotes, setShownQuotes] = useState(new Set());
  const [backgroundClass, setBackgroundClass] = useState("");

  const API_KEY = URL_GEMINI_API;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "☀️ Buenos días";
    if (hour >= 12 && hour < 18) return "🌤️ Buenas tardes";
    return "🌙 Buenas noches";
  };

  const updateBackground = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) setBackgroundClass("bg-gray-900 text-white");
    else if (hour >= 5 && hour < 7) setBackgroundClass("bg-blue-900 text-yellow-100");
    else if (hour >= 7 && hour < 12) setBackgroundClass("bg-yellow-300 text-gray-900");
    else if (hour >= 12 && hour < 17.5) setBackgroundClass("bg-orange-400 text-gray-900");
    else if (hour >= 17.5 && hour < 19) setBackgroundClass("bg-orange-700 text-gray-100");
    else setBackgroundClass("bg-gray-800 text-white");
  };

  const extractJSON = (text) => {
    try {
      const jsonText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonText).frases || [];
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

                    No repitas frases ya mostradas: ${Array.from(shownQuotes).join(", ")}

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
      const newQuotes = extractJSON(rawText);

      if (newQuotes.length > 0) {
        setQuotes(newQuotes);
        setCurrentQuoteIndex(0);
        setShownQuotes((prev) => new Set([...prev, ...newQuotes]));
      }
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
    }, 6000);

    return () => clearInterval(interval);
  }, [quotes]);

  useEffect(() => {
    updateBackground();
    const bgInterval = setInterval(updateBackground, 1000 * 60 * 10);
    return () => clearInterval(bgInterval);
  }, []);

  const getQuoteParts = (quote) => {
    if (!quote) return ["Cargando frases...", ""];
    const cleanedQuote = quote.replace(/^"+|"+$/g, "");
    const parts = cleanedQuote.split(" - ");
    return parts.length > 1 ? [parts[0].trim(), parts.slice(1).join(" - ").trim()] : [cleanedQuote, ""];
  };

  const [quoteText, quoteAuthor] = getQuoteParts(quotes[currentQuoteIndex]);

  return (
    <div className={`flex flex-col items-center justify-center h-screen sm:min-h-[80vh] min-h-[calc(100vh-50px)] transition-all duration-1000 ${backgroundClass} text-center p-4`}>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        {getGreeting()}
      </h1>
      <div className={`${backgroundClass} text-center p-2 shadow-md max-w-lg`}>
        <p className="text-md italic">{quoteText}</p>
        {quoteAuthor && <p className={`text-[0.7rem] ${backgroundClass} mt-2`}>— {quoteAuthor}</p>}
      </div>
    </div>
  );
};

export default UIMotivationalAgent;

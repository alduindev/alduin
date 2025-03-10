module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
      },
      animation: {
        pulse: "pulse 1.5s infinite",
        matrixBg: "matrixBg 10s linear infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.2)",
          },
        },
        matrixBg: {
          "0%": {
            backgroundPosition: "0% 0%",
          },
          "100%": {
            backgroundPosition: "-100% 100%",
          },
        },
      },
    },
  },
  plugins: [],
};

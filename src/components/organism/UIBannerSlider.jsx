import React from "react";

export default function UIBannerSlider({ videos, currentIndex, setCurrentIndex }) {
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex items-center justify-center w-full p-4 font-sans">
      <div className="relative w-full lg:max-w-screen-xl">
        
        <button
          onClick={prevSlide}
          className="absolute z-10 p-3 rounded-lg bg-white/50 lg:bg-gray-200 shadow-none active:shadow-inner transition-all
            left-2 sm:left-4 md:left-6 xl:left-0 xl:-translate-x-16 top-1/2 -translate-y-1/2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700 hover:text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="relative w-full xl:h-[35rem] h-[40rem] rounded-2xl border-[1.5px] border-gray-300 overflow-hidden">
          <video
            key={currentIndex}
            src={videos[currentIndex]}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-2xl transition-all duration-500"
          />

          <div className="absolute bottom-4 flex gap-2 justify-center w-full">
            {videos.map((_, index) => (
              <span
                key={index}
                className={`w-3 h-3 rounded-full ${
                  currentIndex === index ? "bg-[#5b3a6877]" : "bg-gray-300"
                } transition-all`}
              ></span>
            ))}
          </div>
        </div>

        <button
          onClick={nextSlide}
          className="absolute z-10 p-3 rounded-lg bg-white/50 lg:bg-gray-200 shadow-none active:shadow-inner transition-all
            right-2 sm:right-4 md:right-6 xl:right-0 xl:translate-x-16 top-1/2 -translate-y-1/2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700 hover:text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

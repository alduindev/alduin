import { useState } from "react";
import UIHeader from "./components/organism/UIHeader";
import UIBannerSlider from "./components/organism/UIBannerSlider";
import UIFooter from "./components/organism/UIFooter";
import UITetris from "./components/organism/UITetris";
import UIMotivationalAgent from "./components/organism/UIMotivationAgent";

export default function App() {
  const videos = [
    "https://motionbgs.com/media/6382/thousand-sunny-from-one-piece.960x540.mp4",
    "https://motionbgs.com/media/3272/luffys-resolve-under-the-night-sky.960x540.mp4",
    "https://v1.pinimg.com/videos/mc/expMp4/92/f3/00/92f300aa1de1fa41d9e26b65235d432f_t3.mp4",
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="absolute inset-0 w-full h-full">
        <video
          key={currentVideoIndex}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-100"
        >
          <source src={videos[currentVideoIndex]} type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 backdrop-blur-[3px]"></div>

      <div className="relative flex flex-col min-h-screen">
        {/* <UIHeader />

        <main className="flex-1 flex items-center justify-center p-6">
          <UIBannerSlider
            videos={videos}
            currentIndex={currentVideoIndex}
            setCurrentIndex={setCurrentVideoIndex}
          />
        </main>

        <UIFooter /> */}
        {/* <UITetris /> */}
        <UIMotivationalAgent />
      </div>
    </div>
  );
}

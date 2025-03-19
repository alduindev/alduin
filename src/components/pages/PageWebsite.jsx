import React, {useState} from "react";
import UIHeader from "../organism/UIHeader";
import UIFooter from "../organism/UIFooter";
import UIBannerSlider from "../organism/UIBannerSlider";

const PageWebsite = () => {
  const videos = [
    "https://motionbgs.com/media/6382/thousand-sunny-from-one-piece.960x540.mp4",
    "https://motionbgs.com/media/3272/luffys-resolve-under-the-night-sky.960x540.mp4",
    "https://v1.pinimg.com/videos/mc/expMp4/92/f3/00/92f300aa1de1fa41d9e26b65235d432f_t3.mp4",
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  return (
<>
  <UIHeader />
  <UIBannerSlider videos={videos} currentIndex={currentVideoIndex} setCurrentIndex={setCurrentVideoIndex} />
  <UIFooter />
</>

  );
};

export default PageWebsite;

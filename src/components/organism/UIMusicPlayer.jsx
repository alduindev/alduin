import React from "react";

const Sidebar = () => {
  return (
    <div className="w-1/4 bg-white p-6">
      <div className="flex items-center mb-8">
        <img
          src="https://storage.googleapis.com/a1aa/image/b9bVz93jaxiqSV8euCnL3bxVEwScqE_pr6Xbeel-U_k.jpg"
          alt="User avatar"
          className="rounded-full w-10 h-10"
        />
        <span className="ml-4 font-bold">User Name</span>
      </div>
      <nav>
        <ul>
          {[
            { icon: "fas fa-compact-disc", text: "Albums", active: true },
            { icon: "fas fa-music", text: "Playlists" },
            { icon: "fas fa-user", text: "Artists" },
            { icon: "fas fa-heart", text: "Favorites" },
            { icon: "fas fa-chart-line", text: "Trending" },
            { icon: "fas fa-history", text: "Recently Played" },
            { icon: "fas fa-list", text: "Browse All" },
          ].map((item, index) => (
            <li key={index} className="mb-4">
              <a className={`flex items-center ${item.active ? "text-pink-500" : "text-gray-600"}`} href="#">
                <i className={`${item.icon} mr-4`}></i>
                <span>{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

const MainContent = () => {
  return (
    <div className="w-3/4 bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <img
            src="https://storage.googleapis.com/a1aa/image/WufFXRTcjrFM-EZUFKiE8e9UQeE8Emhrr2O3B5u9T0c.jpg"
            alt="Album cover"
            className="rounded-lg w-48 h-48"
          />
          <div className="ml-6">
            <h2 className="text-pink-500 font-bold">MICHEL REKEL</h2>
            <h1 className="text-4xl font-bold mb-4">Good Dance</h1>
            <button className="bg-white border border-gray-300 rounded-full px-4 py-2 text-gray-600">
              ADD TO FAVORITES
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <i className="fas fa-search text-gray-600 text-xl mr-6"></i>
          <i className="fas fa-bars text-gray-600 text-xl"></i>
        </div>
      </div>
      <div className="flex mb-8">
        {[1, 2, 3, 4].map((i) => (
          <img
            key={i}
            src={`https://storage.googleapis.com/a1aa/image/WufFXRTcjrFM-EZUFKiE8e9UQeE8Emhrr2O3B5u9T0c.jpg`}
            alt={`Artist ${i}`}
            className="rounded-lg w-20 h-20 mr-4"
          />
        ))}
      </div>
      <div>
        <ul>
          {[
            { icon: "fas fa-play", text: "One More Time", time: "3:21" },
            { icon: "fas fa-heart", text: "Dance Monkey", time: "2:45" },
            { icon: "fas fa-heart", text: "We Found Love", time: "3:09" },
            { icon: "fas fa-play", text: "Born Slippy", time: "3:43" },
          ].map((song, index) => (
            <li key={index} className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <i className={`${song.icon} text-gray-600 text-xl mr-4`}></i>
                <span>{song.text}</span>
              </div>
              <span>{song.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const BottomPlayer = () => {
  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <img
          src="https://storage.googleapis.com/a1aa/image/RzRVfc31bn8WIEKe2Aql4rYb-xdh2PnxeAF_9QSRWVI.jpg"
          alt="Current song cover"
          className="rounded-full w-10 h-10 mr-4"
        />
        <span className="text-white">Don't Throw it Away</span>
      </div>
      <div className="flex items-center w-1/2">
        <span className="text-white">03:15</span>
        <input type="range" className="mx-4 w-full" />
        <span className="text-white">05:25</span>
      </div>
      <div className="flex items-center">
        {[
          "fa-backward",
          "fa-play",
          "fa-forward",
          "fa-random",
          "fa-volume-up",
        ].map((icon, index) => (
          <i key={index} className={`fas ${icon} text-white text-xl mr-4`}></i>
        ))}
      </div>
    </div>
  );
};

export default function UIMusicPlayer () {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-200 to-blue-300">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden w-full max-w-6xl">
        <div className="flex">
          <Sidebar />
          <MainContent />
        </div>
        <BottomPlayer />
      </div>
    </div>
  );
};

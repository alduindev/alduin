import React, { useState, useEffect, useRef } from 'react';

const UIMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(null);

  // Obtener la lista de canciones desde el servidor
  useEffect(() => {
    fetch('http://localhost:3000/api/songs')
      .then((response) => response.json())
      .then((data) => setSongs(data))
      .catch((error) => console.error('Error al obtener canciones:', error));
  }, []);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const playSong = (song) => {
    setCurrentSong(song);
    audioRef.current.src = `http://localhost:3000/songs/${song}`;
    audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center text-white mb-4">
        <h2 className="text-2xl font-bold">Reproductor de Música</h2>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className="controls w-full mt-4">
        {songs.length > 0 ? (
          <div className="song-list mb-4">
            <h3 className="text-white">Lista de Canciones</h3>
            <ul>
              {songs.map((song, index) => (
                <li
                  key={index}
                  className="text-white cursor-pointer hover:text-blue-500"
                  onClick={() => playSong(song)}
                >
                  {song}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-white">Cargando canciones...</p>
        )}

        <button
          onClick={togglePlayPause}
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
        >
          {isPlaying ? 'Pausa' : 'Reproducir'}
        </button>

        <input
          type="range"
          value={(currentTime / duration) * 100 || 0}
          onChange={handleSeek}
          className="w-full mt-4"
        />

        <div className="flex justify-between text-white mt-2">
          <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60)}</span>
          <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60)}</span>
        </div>
      </div>
    </div>
  );
};

export default UIMusic;

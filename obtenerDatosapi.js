const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Habilitar CORS para permitir solicitudes de tu frontend
app.use(cors());

// Define la ruta al directorio 'songs' dentro de 'public/assets'
const directoryPath = path.join(__dirname, 'public', 'assets', 'songs');

// Endpoint para obtener la lista de canciones
app.get('/api/songs', (req, res) => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el directorio' });
    }

    // Filtrar solo los archivos (puedes ajustarlo para excluir carpetas si lo necesitas)
    const songFiles = files.filter(file => fs.statSync(path.join(directoryPath, file)).isFile());

    // Responder con la lista de archivos
    res.json(songFiles);
  });
});

// Servir archivos estáticos (por ejemplo, para poder acceder a los archivos de música)
app.use('/songs', express.static(path.join(__dirname, 'public', 'assets', 'songs')));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

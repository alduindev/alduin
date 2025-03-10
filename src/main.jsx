import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createPortal } from 'react-dom';

// Seleccionamos los elementos para el portal
const modalRoot = document.querySelector('#root-modal');
const processRoot = document.querySelector('#root-process');

// Inicializamos la aplicación en el elemento con id 'root'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Definimos los componentes para los portales
export const Modal = ({ children }) => {
  return modalRoot ? createPortal(children, modalRoot) : null;
};

export const Process = ({ children }) => {
  return processRoot ? createPortal(children, processRoot) : null;
};

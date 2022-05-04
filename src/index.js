import React from 'react';
import ReactDOMClient from 'react-dom/client';
import { ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

let root = ReactDOMClient.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <ColorModeScript />
    <Routes>
      <Route path="*" element={<App />} />
    </Routes>
  </BrowserRouter>
);
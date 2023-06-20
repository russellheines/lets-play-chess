import React, { useEffect, useState } from 'react';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import OnePlayer from "./pages/OnePlayer";

function App() {

	const [name, setName] = useState(undefined);

  useEffect(() => {
    isAuthenticated();
  }, []);

  function isAuthenticated() {
    //fetch('http://localhost:3001/isAuthenticated', {
    fetch('/isAuthenticated', {
      credentials: "include",
    })
    .then(res => res.json())
    .then(data => {
      setName(data.name ? data.name : null);
    });
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout name={name}/>}>
          <Route index element={<OnePlayer />} />
          <Route path="play" element={<OnePlayer/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import router from './routes/mainRoutes';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer
        position="bottom-left"
        hideProgressBar
        draggable
        autoClose={3000}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;

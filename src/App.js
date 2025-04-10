import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import MainLayout from './layouts/MainLayout';
import FooterLayout from './layouts/FooterLayout';
import NavbarLayout from './layouts/NavbarLayout';
import HomePage from './pages/HomePage/HomePage';
import ContactPage from './pages/ContactPage/ContactPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import DatePage from './pages/ProfilePage/DatePage';
import 'antd/dist/reset.css';
import './App.css';
import { AuthProvider } from './services/authService';
import ConfigPage from './pages/ProfilePage/ConfigPage';

const App = () => {
  return (
    <ConfigProvider
      getPopupContainer={(triggerNode) => {
        return triggerNode?.parentNode || document.body;
      }}
      autoInsertSpace={false}
      componentSize="middle"
    >
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/home" 
              element={
                  <HomePage />
              } 
            />
            <Route path="/contact" element={<NavbarLayout><ContactPage /></NavbarLayout>} />
            <Route path="/profile" element={<MainLayout />}>
              <Route path='/profile' element={<ConfigPage/>} />
              <Route path="/profile/config" element={<ProfilePage />} />
              <Route path="/profile/date" element={<DatePage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
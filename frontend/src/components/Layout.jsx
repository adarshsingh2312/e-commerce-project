import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toaster } from 'react-hot-toast';

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1A1A1A',
            color: '#FFFFFF',
            fontSize: '13px',
            borderRadius: '2px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#D97706',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </div>
  );
};
export default Layout;

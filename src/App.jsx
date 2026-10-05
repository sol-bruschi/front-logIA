import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Proveedores from './pages/Proveedores';
import Plataformas from './pages/Plataformas';
import ContextosIA from './pages/ContextosIA';
import Comprobantes from './pages/Comprobantes';

const ProtectedLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#EFEFEF]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
          <Route path="/proveedores" element={<ProtectedLayout><Proveedores /></ProtectedLayout>} />
          <Route path="/plataformas" element={<ProtectedLayout><Plataformas /></ProtectedLayout>} />
          <Route path="/contextos-ia" element={<ProtectedLayout><ContextosIA /></ProtectedLayout>} />
          <Route path="/comprobantes" element={<ProtectedLayout><Comprobantes /></ProtectedLayout>} />
          <Route path="/productos" element={<ProtectedLayout><div className="p-8"><h1>Productos</h1></div></ProtectedLayout>} />
          <Route path="/stock" element={<ProtectedLayout><div className="p-8"><h1>Stock</h1></div></ProtectedLayout>} />
          <Route path="/usuarios" element={<ProtectedLayout><div className="p-8"><h1>Usuarios</h1></div></ProtectedLayout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
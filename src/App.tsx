import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RevenueManager } from './components/RevenueManager';
import { ExpenseManager } from './components/ExpenseManager';
import { KitchenManager } from './components/KitchenManager';
import { DrinkManager } from './components/DrinkManager';
import { BusDriverManager } from './components/BusDriverManager';
import { EmployeeManager } from './components/EmployeeManager';
import { AttendanceManager } from './components/AttendanceManager';
import { PlanningManager } from './components/PlanningManager';
import { ReportManager } from './components/ReportManager';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="revenues" element={<RevenueManager />} />
            <Route path="expenses" element={<ExpenseManager />} />
            <Route path="kitchen" element={<KitchenManager />} />
            <Route path="drinks" element={<DrinkManager />} />
            <Route path="bus-drivers" element={<BusDriverManager />} />
            <Route path="employees" element={<EmployeeManager />} />
            <Route path="attendance" element={<AttendanceManager />} />
            <Route path="planning" element={<PlanningManager />} />
            <Route path="reports" element={<ReportManager />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

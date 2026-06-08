import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ComplaintForm from './components/Complaint/ComplaintForm';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import NotFound from './pages/NotFound';
import CommandPalette from './components/CommandPalette';
import AnimatedPage from './components/AnimatedPage';
import { jwtDecode } from 'jwt-decode';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

const AppContent = ({ 
  isLoggedIn, 
  userRole, 
  userEmail, 
  userInfo, 
  handleLoginSuccess, 
  handleLogout, 
  setIsLoggedIn 
}) => {
    const location = useLocation();

    return (
        <>
            <Navbar 
                isLoggedIn={isLoggedIn} 
                onLogout={handleLogout} 
                userRole={userRole} 
                userEmail={userEmail} 
                userInfo={userInfo}
            />
            <CommandPalette 
                userRole={userRole} 
                onLogout={handleLogout} 
                isLoggedIn={isLoggedIn} 
            />
            <AnimatePresence exitBeforeEnter>
                <Switch location={location} key={location.pathname}>
                    <Route path="/login/:role" render={(props) => (
                        isLoggedIn ? <Redirect to="/" /> : (
                            <AnimatedPage>
                                <Login {...props} setIsLoggedIn={setIsLoggedIn} onLoginSuccess={handleLoginSuccess} />
                            </AnimatedPage>
                        )
                    )} />
                    <Route path="/register/:role" render={(props) => (
                        isLoggedIn ? <Redirect to="/" /> : (
                            <AnimatedPage>
                                <Register {...props} />
                            </AnimatedPage>
                        )
                    )} />
                    <Route path="/complaints/new">
                        {isLoggedIn && userRole !== 'admin' ? (
                            <AnimatedPage>
                                <ComplaintForm />
                            </AnimatedPage>
                        ) : <Redirect to="/admin/dashboard" />}
                    </Route>
                    <Route path="/my-complaints">
                        {isLoggedIn && userRole !== 'admin' ? (
                            <AnimatedPage>
                                <MyComplaints />
                            </AnimatedPage>
                        ) : <Redirect to="/admin/dashboard" />}
                    </Route>
                    <Route path="/complaints/:id">
                        {isLoggedIn && userRole !== 'admin' ? (
                            <AnimatedPage>
                                <ComplaintDetail />
                            </AnimatedPage>
                        ) : <Redirect to="/admin/dashboard" />}
                    </Route>
                    <Route path="/admin/dashboard">
                        {isLoggedIn && userRole === 'admin' ? (
                            <AnimatedPage>
                                <AdminDashboard />
                            </AnimatedPage>
                        ) : <Redirect to="/login/admin" />}
                    </Route>
                    <Route path="/staff/dashboard">
                        {isLoggedIn && userRole === 'staff' ? (
                            <AnimatedPage>
                                <StaffDashboard />
                            </AnimatedPage>
                        ) : <Redirect to="/login/staff" />}
                    </Route>
                    <Route path="/" exact>
                        <AnimatedPage>
                            <Home userEmail={userEmail} userRole={userRole} />
                        </AnimatedPage>
                    </Route>
                    <Route path="*">
                        <AnimatedPage>
                            <NotFound />
                        </AnimatedPage>
                    </Route>
                </Switch>
            </AnimatePresence>
        </>
    );
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const roleLower = decoded.role?.toLowerCase() || '';
                setUserRole(roleLower);
                setUserEmail(roleLower === 'admin' ? 'Admin' : decoded.email);
                setUserInfo({
                    name: decoded.name,
                    department: decoded.department,
                    email: decoded.email
                });
            } catch (e) {
                setUserRole('');
                setUserEmail('');
                setUserInfo({});
            }
        } else {
            setUserRole('');
            setUserEmail('');
            setUserInfo({});
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserRole('');
        setUserEmail('');
        setUserInfo({});
        window.location.href = '/';
    };

    const handleLoginSuccess = (response, history) => {
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        const roleLower = response.data.user.role?.toLowerCase() || '';
        setUserRole(roleLower);
        setUserEmail(roleLower === 'admin' ? 'Admin' : response.data.user.email);
        setUserInfo({
            name: response.data.user.name,
            department: response.data.user.department,
            email: response.data.user.email
        });
        if (roleLower === 'admin') {
            history.push('/admin/dashboard');
        } else if (roleLower === 'staff') {
            history.push('/staff/dashboard');
        } else {
            history.push('/');
        }
    };

    return (
        <Router>
            <Toaster 
                position="top-right" 
                toastOptions={{
                    style: {
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 'var(--border-radius-sm)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        boxShadow: 'var(--shadow-premium-md)'
                    }
                }} 
            />
            <AppContent
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                userEmail={userEmail}
                userInfo={userInfo}
                handleLoginSuccess={handleLoginSuccess}
                handleLogout={handleLogout}
                setIsLoggedIn={setIsLoggedIn}
            />
        </Router>
    );
};

export default App;
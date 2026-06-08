import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, User, ClipboardList, PlusCircle, LayoutDashboard, GraduationCap } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ isLoggedIn, onLogout, userRole, userEmail, userInfo }) => {
    const history = useHistory();
    const location = useLocation();
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        if (isDark) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const getActiveClass = (path) => {
        return isActive(path) ? 'active' : '';
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-premium sticky-top py-3">
            <div className="container px-4">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <span className="d-flex p-2 gradient-primary rounded-3 text-white me-2" style={{ boxShadow: '0 4px 10px rgba(15, 23, 42, 0.08)' }}>
                        <GraduationCap size={20} />
                    </span>
                    <span className="text-main" style={{ fontWeight: 850, letterSpacing: '-0.3px', fontSize: '1.2rem', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                        Saveetha University <br/><span className="text-muted d-none d-sm-inline" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Grievance Portal</span>
                    </span>
                </Link>
                
                <div className="d-flex align-items-center gap-2 order-lg-3">
                    {/* Notification Dropdown */}
                    {isLoggedIn && <NotificationDropdown />}

                    {/* Theme Toggle Button */}
                    <button 
                        className="btn btn-link nav-link-premium p-2 border-0 bg-transparent text-muted" 
                        onClick={() => setIsDark(!isDark)}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        style={{ cursor: 'pointer' }}
                    >
                        {isDark ? <Sun size={20} className="text-warning" /> : <Moon size={20} />}
                    </button>

                    {isLoggedIn && (
                        <div className="position-relative">
                            <button 
                                className="btn btn-outline-premium d-flex align-items-center gap-2 py-2 px-3"
                                onClick={() => setShowProfile(!showProfile)}
                                onBlur={() => setTimeout(() => setShowProfile(false), 200)}
                                style={{ borderRadius: '9999px' }}
                            >
                                <User size={16} />
                                <span className="d-none d-md-inline text-truncate" style={{ maxWidth: '100px', fontWeight: 600 }}>
                                    {userInfo?.name || 'User'}
                                </span>
                            </button>

                            {/* Floating Profile Panel */}
                            {showProfile && (
                                <div className="position-absolute end-0 mt-2 z-3 profile-dropdown-card glass-card">
                                    <div className="mb-3 border-bottom pb-2">
                                        <div className="fw-bold text-main">{userInfo?.name || 'User'}</div>
                                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>{userEmail}</div>
                                        <span className="status-pill status-pill-pending mt-2">
                                            {userRole?.toUpperCase()}
                                        </span>
                                    </div>
                                    {userInfo?.department && (
                                        <div className="small mb-3 text-muted">
                                            <strong>Dept:</strong> {userInfo.department}
                                        </div>
                                    )}
                                    <button 
                                        className="btn btn-danger-premium w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                        onClick={onLogout}
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button className="navbar-toggler border-0 p-2 text-muted d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>

                <div className="collapse navbar-collapse order-lg-2" id="navbarNav">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-2">
                        <li className="nav-item">
                            <Link className={`nav-link nav-link-premium ${getActiveClass('/')}`} to="/">Home</Link>
                        </li>
                        
                        {isLoggedIn ? (
                            <>
                                {/* Admin Navigation */}
                                {userRole === 'admin' && (
                                    <li className="nav-item">
                                        <Link className={`nav-link nav-link-premium ${getActiveClass('/admin/dashboard')}`} to="/admin/dashboard">
                                            <span className="d-flex align-items-center gap-1">
                                                <LayoutDashboard size={16} />
                                                Dashboard
                                            </span>
                                        </Link>
                                    </li>
                                )}
                                
                                {/* Staff Navigation */}
                                {userRole === 'staff' && (
                                    <li className="nav-item">
                                        <Link className={`nav-link nav-link-premium ${getActiveClass('/staff/dashboard')}`} to="/staff/dashboard">
                                            <span className="d-flex align-items-center gap-1">
                                                <LayoutDashboard size={16} />
                                                Dashboard
                                            </span>
                                        </Link>
                                    </li>
                                )}
                                
                                {/* Student Navigation */}
                                {userRole === 'student' && (
                                    <>
                                        <li className="nav-item">
                                            <Link className={`nav-link nav-link-premium ${getActiveClass('/my-complaints')}`} to="/my-complaints">
                                                <span className="d-flex align-items-center gap-1">
                                                    <ClipboardList size={16} />
                                                    My Complaints
                                                </span>
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className={`nav-link nav-link-premium ${getActiveClass('/complaints/new')}`} to="/complaints/new">
                                                <span className="d-flex align-items-center gap-1">
                                                    <PlusCircle size={16} />
                                                    Submit Complaint
                                                </span>
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <li className="nav-item ms-lg-3">
                                    <button 
                                        className="btn btn-outline-premium px-4" 
                                        onClick={() => history.push('/login/student')}
                                    >
                                        Login
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className="btn btn-primary-premium px-4" 
                                        onClick={() => history.push('/register/student')}
                                    >
                                        Register
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
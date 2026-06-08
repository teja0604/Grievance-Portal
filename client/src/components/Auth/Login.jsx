import React, { useState } from 'react';
import axios from '../../api/axios';
import { useHistory } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Login = ({ setIsLoggedIn, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', { email, password, role });
            localStorage.setItem('token', response.data.token);
            setIsLoggedIn(true);
            toast.success(`Logged in as ${role.toUpperCase()} successfully!`);
            if (onLoginSuccess) {
                onLoginSuccess(response, history);
            }
            history.push('/');
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errMsg);
            toast.error('Login Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="position-relative d-flex justify-content-center align-items-center min-vh-100 overflow-hidden px-3 py-5">
            {/* Background Effects */}
            <div className="background-effects">
                <div className="orb orb-primary"></div>
                <div className="orb orb-secondary"></div>
                <div className="orb orb-accent"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="card glass-card p-4 p-md-5 w-100" 
                style={{ maxWidth: '460px' }}
            >
                <div className="text-center mb-4">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        className="d-inline-flex p-3 rounded-circle gradient-primary mb-3 text-white"
                        style={{ boxShadow: '0 8px 20px rgba(30, 58, 138, 0.3)' }}
                    >
                        <LogIn size={28} />
                    </motion.div>
                    <h2 className="mb-1" style={{ fontWeight: 800 }}>Welcome Back</h2>
                    <p className="text-muted small">Access the Saveetha University Grievance Portal</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="alert alert-danger py-2 px-3 small border-0 d-flex align-items-center gap-2 mb-4"
                            style={{ borderRadius: 'var(--border-radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                        >
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Role Tabs Selection */}
                <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase tracking-wider">Select Your Role</label>
                    <div className="role-tabs">
                        {['student', 'staff', 'admin'].map((r) => (
                            <button
                                key={r}
                                type="button"
                                className={`role-tab-btn ${role === r ? 'active' : ''}`}
                                onClick={() => setRole(r)}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">Email Address</label>
                        <div className="position-relative">
                            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                <Mail size={18} />
                            </span>
                            <input
                                type="email"
                                className="form-control form-control-premium w-100 ps-5"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={`name@${role === 'student' ? 'saveetha.edu.in' : 'saveetha.edu.in'}`}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-muted small fw-bold">Password</label>
                        <div className="position-relative">
                            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                className="form-control form-control-premium w-100 ps-5"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary-premium w-100 py-3 d-flex align-items-center justify-content-center gap-2 mb-4"
                        style={{ fontSize: '1rem', fontWeight: 600 }}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <button 
                            type="button" 
                            className="btn btn-link text-decoration-none small text-muted hover-underline" 
                            onClick={() => history.push(`/register/${role}`)}
                            style={{ fontSize: '0.875rem' }}
                        >
                            Don't have an account? <span className="text-primary-blue fw-bold" style={{ color: 'var(--accent-blue)' }}>Register here</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
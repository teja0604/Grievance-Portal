import React, { useState } from 'react';
import axios from '../../api/axios';
import { useHistory } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowRight, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student');
    const [department, setDepartment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!name.trim() || !email.trim() || !password.trim() || !department.trim()) {
            setError('All fields are required');
            return;
        }
        
        setLoading(true);
        try {
            await axios.post('/api/auth/register', { 
                email: email.trim(), 
                password, 
                name: name.trim(), 
                role, 
                department: department.trim() 
            });

            setSuccess('Registration successful! Redirecting...');
            toast.success('Account created successfully!');
            setTimeout(() => {
                if (role === 'student') {
                    history.push('/login/student');
                } else if (role === 'staff') {
                    history.push('/login/staff'); // Redirect staff to login as well for standard flow, or follow original logic
                }
            }, 1500);
        } catch (err) {
            console.error('Registration error:', err);
            const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errMsg);
            toast.error(errMsg);
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
                style={{ maxWidth: '480px' }}
            >
                <div className="text-center mb-4">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        className="d-inline-flex p-3 rounded-circle gradient-primary mb-3 text-white"
                        style={{ boxShadow: '0 8px 20px rgba(30, 58, 138, 0.3)' }}
                    >
                        <UserPlus size={28} />
                    </motion.div>
                    <h2 className="mb-1" style={{ fontWeight: 800 }}>Create Account</h2>
                    <p className="text-muted small">Join the Saveetha University Grievance Portal</p>
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
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="alert alert-success py-2 px-3 small border-0 d-flex align-items-center gap-2 mb-4"
                            style={{ borderRadius: 'var(--border-radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}
                        >
                            <span>{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Role Tabs Selection */}
                <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase tracking-wider">I am registering as</label>
                    <div className="role-tabs">
                        {['student', 'staff'].map((r) => (
                            <button
                                key={r}
                                type="button"
                                className={`role-tab-btn ${role === r ? 'active' : ''}`}
                                onClick={() => {
                                    setRole(r);
                                    setDepartment('');
                                }}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">Full Name</label>
                        <div className="position-relative">
                            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                <User size={18} />
                            </span>
                            <input
                                type="text"
                                className="form-control form-control-premium w-100 ps-5"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    </div>

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
                                placeholder="Enter your email address"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
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
                                placeholder="Min. 6 characters"
                                minLength="6"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-muted small fw-bold">
                            {role === 'student' ? 'Department / Branch' : 'Functional Area / Department'}
                        </label>
                        <div className="position-relative">
                            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                <Building size={18} />
                            </span>
                            <select 
                                className="form-select form-select-premium w-100 ps-5" 
                                value={department} 
                                onChange={e => setDepartment(e.target.value)} 
                                required
                            >
                                <option value="">Select {role === 'student' ? 'Department' : 'Area'}</option>
                                <option value="IT">IT</option>
                                <option value="CSE">CSE</option>
                                <option value="CSD">CSD</option>
                                <option value="MECH">MECH</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="EIE">EIE</option>
                                <option value="AUTOMOB">AUTOMOB</option>
                                <option value="MTS">MTS</option>
                                <option value="AIDS">AIDS</option>
                                <option value="AIML">AIML</option>
                                <option value="CHEM">CHEM</option>
                                <option value="FT">FT</option>
                                <option value="1ST YEAR">1ST YEAR</option>
                                {role === 'staff' && (
                                    <>
                                        <option value="Hostel">Hostel</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Mess">Mess</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </>
                                )}
                            </select>
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
                                Create Account
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <button 
                            type="button" 
                            className="btn btn-link text-decoration-none small text-muted hover-underline" 
                            onClick={() => history.push('/login/student')}
                            style={{ fontSize: '0.875rem' }}
                        >
                            Already have an account? <span className="text-primary-blue fw-bold" style={{ color: 'var(--accent-blue)' }}>Login here</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;

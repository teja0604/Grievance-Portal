import React from 'react';
import { useHistory } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
    const history = useHistory();

    return (
        <div className="position-relative d-flex justify-content-center align-items-center min-vh-100 overflow-hidden px-3">
            {/* Background effects */}
            <div className="background-effects">
                <div className="orb orb-primary"></div>
                <div className="orb orb-secondary"></div>
                <div className="orb orb-accent"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="card glass-card p-5 text-center shadow-2xl w-100"
                style={{ maxWidth: '480px', borderRadius: 'var(--border-radius-lg)' }}
            >
                {/* Floating Space SVG Illustration */}
                <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="mb-4 d-inline-block text-warning mx-auto"
                >
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 8px 16px rgba(245, 158, 11, 0.2))' }}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        <path d="M2 12h20" />
                    </svg>
                </motion.div>

                <h1 className="display-6 fw-bold mb-2 text-main">🚀 Lost in Space</h1>
                <p className="text-muted mb-4 px-2" style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>
                    The page you're looking for drifted beyond our orbit.
                </p>

                <button 
                    className="btn btn-primary-premium py-2.5 px-4 d-inline-flex align-items-center justify-content-center gap-2 mx-auto"
                    onClick={() => history.push('/')}
                >
                    <Compass size={18} />
                    Back to Dashboard
                </button>
            </motion.div>
        </div>
    );
};

export default NotFound;

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, UserCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);
    const dropdownRef = useRef(null);

    // Mock notification alerts list
    const notifications = [
        {
            id: 1,
            title: 'Status updated',
            text: 'Hostel mess WiFi complaint status has been changed to Resolved.',
            time: '2 min ago',
            type: 'resolved',
            icon: <CheckCircle2 size={16} />,
            color: 'var(--success)'
        },
        {
            id: 2,
            title: 'Complaint assigned',
            text: 'Classroom AC repair request has been assigned to CSD maintenance team.',
            time: '15 min ago',
            type: 'assigned',
            icon: <UserCheck size={16} />,
            color: 'var(--accent-blue)'
        },
        {
            id: 3,
            title: 'New complaint submitted',
            text: 'A new grievance regarding library drinking water has been submitted.',
            time: '1 hour ago',
            type: 'submitted',
            icon: <Bell size={16} />,
            color: 'var(--warning)'
        }
    ];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpenToggle = () => {
        setIsOpen(!isOpen);
        setUnreadCount(0); // clear count upon review
    };

    return (
        <div ref={dropdownRef} className="position-relative">
            <button 
                className="btn btn-link nav-link-premium p-2 border-0 bg-transparent text-muted position-relative"
                onClick={handleOpenToggle}
                title="Notifications"
                style={{ cursor: 'pointer' }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span 
                        className="position-absolute top-0 start-50 translate-middle badge rounded-circle bg-danger border border-white"
                        style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: '0.65rem' }}
                    >
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="position-absolute end-0 mt-2 z-3 glass-card p-0 shadow-lg"
                        style={{ width: '320px', borderRadius: 'var(--border-radius-md)' }}
                    >
                        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white/5">
                            <span className="fw-bold small text-main">System Alerts</span>
                            <button className="btn btn-link p-0 text-muted small text-decoration-none" style={{ fontSize: '0.75rem' }} onClick={() => setUnreadCount(0)}>
                                Clear All
                            </button>
                        </div>

                        <div className="p-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div className="text-center py-4 text-muted small">
                                    No new notifications.
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className="p-3 rounded-3 mb-1 transition-all hover:bg-white/10 d-flex gap-2 align-items-start"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span 
                                            className={`d-flex p-1.5 rounded-circle mt-1 notification-icon-${notif.type}`}
                                        >
                                            {notif.icon}
                                        </span>
                                        <div>
                                            <span className="d-block fw-bold text-main" style={{ fontSize: '0.8rem' }}>{notif.title}</span>
                                            <p className="text-muted mb-1" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>{notif.text}</p>
                                            <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                                                <Clock size={10} />
                                                {notif.time}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;

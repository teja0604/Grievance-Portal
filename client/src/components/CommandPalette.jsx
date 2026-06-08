import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Search, Plus, ClipboardList, LogOut, Sun, ShieldAlert, Sparkles, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const CommandPalette = ({ userRole, onLogout, isLoggedIn }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const history = useHistory();
    const inputRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Build available commands
    const getCommands = () => {
        if (!isLoggedIn) {
            return [
                {
                    name: 'Login as Student',
                    desc: 'Sign in to submit complaints',
                    icon: <User size={18} />,
                    action: () => history.push('/login/student')
                },
                {
                    name: 'Login as Staff',
                    desc: 'Sign in to resolve complaints',
                    icon: <ClipboardList size={18} />,
                    action: () => history.push('/login/staff')
                },
                {
                    name: 'Login as Admin',
                    desc: 'Sign in to manage portal',
                    icon: <ShieldAlert size={18} />,
                    action: () => history.push('/login/admin')
                },
                {
                    name: 'Toggle Theme Mode',
                    desc: 'Switch between light and dark themes',
                    icon: <Sun size={18} />,
                    action: () => {
                        const isDark = document.body.classList.contains('dark');
                        if (isDark) {
                            document.body.classList.remove('dark');
                            localStorage.setItem('theme', 'light');
                            toast.success('Switched to Light Theme');
                        } else {
                            document.body.classList.add('dark');
                            localStorage.setItem('theme', 'dark');
                            toast.success('Switched to Dark Theme');
                        }
                    }
                }
            ];
        }

        const all = [];

        // Role-based commands
        if (userRole === 'student') {
            all.push(
                {
                    name: 'Create Complaint',
                    desc: 'Submit a new grievance',
                    icon: <Plus size={18} />,
                    action: () => history.push('/complaints/new')
                },
                {
                    name: 'My Complaints',
                    desc: 'View your submitted issues',
                    icon: <ClipboardList size={18} />,
                    action: () => history.push('/my-complaints')
                }
            );
        } else if (userRole === 'staff') {
            all.push({
                name: 'Staff Dashboard',
                desc: 'Manage assigned grievances',
                icon: <ClipboardList size={18} />,
                action: () => history.push('/staff/dashboard')
            });
        } else if (userRole === 'admin') {
            all.push({
                name: 'Admin Dashboard',
                desc: 'System administration and assignments',
                icon: <ShieldAlert size={18} />,
                action: () => history.push('/admin/dashboard')
            });
        }

        // Common commands
        all.push(
            {
                name: 'Profile',
                desc: 'View user profile credentials',
                icon: <User size={18} />,
                action: () => {
                    toast.success(`Role: ${userRole?.toUpperCase()}\nSaveetha Grievance Portal`, {
                        icon: '👤',
                        duration: 3000
                    });
                }
            },
            {
                name: 'Settings',
                desc: 'Toggle dark mode preferences',
                icon: <Settings size={18} />,
                action: () => {
                    const isDark = document.body.classList.contains('dark');
                    if (isDark) {
                        document.body.classList.remove('dark');
                        localStorage.setItem('theme', 'light');
                        toast.success('Switched to Light Theme');
                    } else {
                        document.body.classList.add('dark');
                        localStorage.setItem('theme', 'dark');
                        toast.success('Switched to Dark Theme');
                    }
                }
            },
            {
                name: 'Logout',
                desc: 'Sign out from this portal session',
                icon: <LogOut size={18} />,
                action: () => onLogout()
            }
        );

        return all;
    };

    const commands = getCommands();

    const filteredCommands = commands.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.desc.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleNavigation = (e) => {
            if (!isOpen || filteredCommands.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                filteredCommands[activeIndex].action();
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleNavigation);
        return () => window.removeEventListener('keydown', handleNavigation);
    }, [isOpen, activeIndex, filteredCommands]);

    // Keep active item in view inside scrollable area
    useEffect(() => {
        if (!listRef.current) return;
        const activeNode = listRef.current.children[activeIndex];
        if (activeNode) {
            activeNode.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start z-5"
                    style={{ background: 'rgba(9, 13, 22, 0.4)', backdropFilter: 'blur(8px)', paddingTop: '15vh' }}
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -10 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="card glass-card p-0 border-0 w-100 overflow-hidden shadow-2xl"
                        style={{ maxWidth: '560px', borderRadius: 'var(--border-radius-md)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Command Menu Header */}
                        <div className="d-flex align-items-center justify-content-between px-3 pt-3 pb-2 bg-white/5 border-bottom">
                            <span className="fw-bold small text-main d-flex align-items-center gap-1.5" style={{ letterSpacing: '0.5px' }}>
                                <span style={{ color: 'var(--accent-blue)', fontSize: '1.1rem' }}>⌘</span>
                                Command Menu
                            </span>
                            <span className="badge bg-white/10 text-muted px-2 py-1 font-semibold small border">ESC</span>
                        </div>

                        {/* Search Input Bar */}
                        <div className="d-flex align-items-center border-bottom px-3 py-2.5 gap-2">
                            <Search size={16} className="text-muted" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-100 border-0 bg-transparent text-main outline-none"
                                placeholder="Type a command or search..."
                                style={{ outline: 'none', border: 'none', fontSize: '0.9rem', background: 'transparent' }}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setActiveIndex(0);
                                }}
                            />
                        </div>

                        {/* Commands List */}
                        <div 
                            ref={listRef}
                            style={{ maxHeight: '300px', overflowY: 'auto' }}
                            className="p-2"
                        >
                            {filteredCommands.length === 0 ? (
                                <div className="text-center py-4 text-muted small">
                                    No results found for query.
                                </div>
                            ) : (
                                filteredCommands.map((cmd, idx) => (
                                    <div
                                        key={idx}
                                        className={`d-flex align-items-center justify-content-between p-3 rounded-3 mb-1 transition-all`}
                                        style={{ 
                                            cursor: 'pointer',
                                            background: activeIndex === idx ? 'rgba(15, 118, 110, 0.12)' : 'transparent',
                                            borderLeft: activeIndex === idx ? '3px solid var(--accent-blue)' : '3px solid transparent'
                                        }}
                                        onClick={() => {
                                            cmd.action();
                                            setIsOpen(false);
                                        }}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <span style={{ color: activeIndex === idx ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                                                {cmd.icon}
                                            </span>
                                            <div>
                                                <span className="d-block fw-bold small text-main">{cmd.name}</span>
                                                <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>{cmd.desc}</span>
                                            </div>
                                        </div>
                                        {activeIndex === idx && (
                                            <span className="badge bg-white/10 text-muted px-2 py-1 font-semibold small border d-flex align-items-center gap-1">
                                                <Sparkles size={10} />
                                                Enter
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;


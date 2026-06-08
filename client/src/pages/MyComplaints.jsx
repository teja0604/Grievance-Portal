import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import { useHistory } from 'react-router-dom';
import { 
  Inbox, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Send,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Animated Counter component
const AnimatedCounter = ({ value, duration = 800 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10);
        if (isNaN(end) || end === 0) {
            setCount(value);
            return;
        }
        if (start === end) return;

        const totalMiliseconds = duration;
        const steps = Math.min(end, 30);
        const increment = Math.ceil(end / steps);
        const stepTime = Math.abs(Math.floor(totalMiliseconds / steps));

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                clearInterval(timer);
                setCount(end);
            } else {
                setCount(start);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}</span>;
};

// Skeleton Loader component
const SkeletonCard = () => (
    <div className="col-md-6 col-lg-4 mb-4">
        <div className="skeleton-card glass-card">
            <div className="d-flex justify-content-between mb-3">
                <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '25%' }}></div>
            </div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '75%' }}></div>
            <div className="skeleton skeleton-text mt-4" style={{ width: '35%', height: '2rem' }}></div>
        </div>
    </div>
);

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackState, setFeedbackState] = useState({}); 
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const history = useHistory();

    const fetchComplaints = useCallback(async () => {
        try {
            const complaintsRes = await axios.get('/api/complaints/my');
            setComplaints(complaintsRes.data);
            calculateStats(complaintsRes.data);
        } catch (err) {
            toast.error('Failed to fetch complaints');
        }
    }, []);

    const fetchFeedbacks = useCallback(async () => {
        try {
            const feedbacksRes = await axios.get('/api/feedback');
            setFeedbacks(feedbacksRes.data);
        } catch (err) {
            toast.error('Failed to fetch feedbacks');
        }
    }, []);

    const fetchProfile = useCallback(async () => {
        try {
            const profileRes = await axios.get('/api/auth/profile');
            setUserInfo(profileRes.data);
        } catch (err) {
            toast.error('Failed to fetch profile');
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchComplaints(), fetchFeedbacks(), fetchProfile()]);
        setLoading(false);
    }, [fetchComplaints, fetchFeedbacks, fetchProfile]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const calculateStats = (complaintsData) => {
        const statsObj = {
            total: complaintsData.length,
            pending: complaintsData.filter(c => c.status === 'pending').length,
            inProgress: complaintsData.filter(c => c.status === 'in-progress').length,
            resolved: complaintsData.filter(c => c.status === 'resolved').length
        };
        setStats(statsObj);
    };

    const handleFeedbackChange = (complaintId, field, value) => {
        setFeedbackState(prev => ({
            ...prev,
            [complaintId]: {
                ...prev[complaintId],
                [field]: value
            }
        }));
    };

    const submitFeedback = async (complaintId) => {
        const fb = feedbackState[complaintId];
        if (!fb || !fb.rating) {
            alert("Please select a rating.");
            return;
        }
        try {
            await axios.post('/api/feedback', { 
                complaintId, 
                rating: parseInt(fb.rating, 10), 
                comment: fb.comment || '' 
            });
            setFeedbackState(prev => ({
                ...prev,
                [complaintId]: { ...prev[complaintId], submitted: true }
            }));
            fetchFeedbacks();
        } catch (err) {
            toast.error('Failed to submit feedback');
        }
    };

    const hasFeedback = (complaintId) => feedbacks.some(f => f.complaintId && f.complaintId._id === complaintId);

    const filteredAndSortedComplaints = complaints
        .filter(c => {
            const matchesFilter = filter === 'all' || c.status === filter;
            const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                c.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

    return (
        <div className="position-relative min-vh-100 py-5 px-3">
            {/* Background Effects */}
            <div className="background-effects">
                <div className="orb orb-primary"></div>
                <div className="orb orb-secondary"></div>
                <div className="orb orb-accent"></div>
            </div>

            <div className="container">
                {/* Header Section */}
                <div className="row mb-5 align-items-center">
                    <div className="col-md-8 text-center text-md-start">
                        <span className="badge bg-primary/10 text-primary-blue py-2 px-3 rounded-pill mb-2 fw-semibold" style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)' }}>
                            Student Dashboard
                        </span>
                        <h1 className="fw-bold mb-1" style={{ fontSize: '2.5rem' }}>My Complaints</h1>
                        {userInfo && <p className="text-muted mb-0">Track, manage and view status updates for your logged grievances, <strong>{userInfo.name}</strong></p>}
                    </div>
                    <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
                        <div className="d-flex gap-2 justify-content-center justify-content-md-end">
                            <button className="btn btn-outline-premium d-flex align-items-center gap-2" onClick={loadData}>
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                            <button className="btn btn-primary-premium d-flex align-items-center gap-2" onClick={() => history.push('/complaints/new')}>
                                <Plus size={16} />
                                File Complaint
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="row mb-5 g-4">
                    {[
                        { title: 'Total Logged', count: stats.total, color: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.08)' },
                        { title: 'Pending Audit', count: stats.pending, color: 'var(--text-muted)', bg: 'rgba(100, 116, 139, 0.08)' },
                        { title: 'In Progress', count: stats.inProgress, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.08)' },
                        { title: 'Resolved Cases', count: stats.resolved, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.08)' },
                    ].map((card, idx) => (
                        <div className="col-6 col-md-3" key={idx}>
                            <div className="card glass-card p-4 text-center h-100" style={{ borderLeft: `4px solid ${card.color}` }}>
                                <span className="small fw-semibold text-uppercase tracking-wider mb-2 d-block stat-card-title">{card.title}</span>
                                <h2 className="display-6 fw-bold mb-0 stat-card-number" style={{ color: card.color }}>
                                    {!loading ? <AnimatedCounter value={card.count} /> : '-'}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search, Filters, and Sorters */}
                <div className="card glass-card p-4 mb-5">
                    <div className="row g-4 align-items-end">
                        <div className="col-lg-4 col-md-6">
                            <label className="form-label text-muted small fw-bold">Search Keywords</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control form-control-premium w-100 ps-5"
                                    placeholder="Search by title, department..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <label className="form-label text-muted small fw-bold">Filter Status</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                    <Filter size={16} />
                                </span>
                                <select className="form-select form-select-premium w-100 ps-5" value={filter} onChange={e => setFilter(e.target.value)}>
                                    <option value="all">All Complaints</option>
                                    <option value="pending">Pending Audit</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-12">
                            <label className="form-label text-muted small fw-bold">Sort Order</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                    <Layers size={16} />
                                </span>
                                <select className="form-select form-select-premium w-100 ps-5" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <option value="date">Submission Date (Newest)</option>
                                    <option value="title">Alphabetical Title</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress bar overview */}
                {!loading && stats.total > 0 && (
                    <div className="card glass-card p-4 mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0">Portal Progress Summary</h6>
                            <span className="small text-muted">{Math.round((stats.resolved / stats.total) * 100)}% Resolved</span>
                        </div>
                        <div className="progress" style={{ height: '8px', borderRadius: '4px', background: 'var(--border-color)' }}>
                            <div className="progress-bar bg-success" style={{ width: `${(stats.resolved / stats.total) * 100}%` }}></div>
                            <div className="progress-bar bg-warning" style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}></div>
                            <div className="progress-bar bg-secondary" style={{ width: `${(stats.pending / stats.total) * 100}%` }}></div>
                        </div>
                    </div>
                )}

                {/* Complaints Grid/List */}
                <div className="row">
                    {loading ? (
                        <>
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </>
                    ) : filteredAndSortedComplaints.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div className="empty-state-container p-5 glass-card">
                                <Inbox className="empty-state-icon text-muted" size={48} />
                                <h4 className="fw-bold mb-2">No complaints yet</h4>
                                <p className="text-muted mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                                    {complaints.length === 0 
                                        ? "You haven't logged any grievances on Saveetha portal yet. Let us know if you need any assistance." 
                                        : "No grievances match your current search queries or filter selections."}
                                </p>
                                {complaints.length === 0 && (
                                    <button 
                                        className="btn btn-primary-premium px-4 py-2 d-inline-flex align-items-center gap-2" 
                                        onClick={() => history.push('/complaints/new')}
                                    >
                                        <Plus size={16} />
                                        Log Your First Complaint
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        filteredAndSortedComplaints.map(c => (
                            <div className="col-md-6 col-lg-4 mb-4" key={c._id}>
                                <motion.div 
                                    layout
                                    className="card glass-card h-100 d-flex flex-column justify-content-between"
                                    style={{ borderTop: `4px solid ${c.status === 'resolved' ? 'var(--success)' : c.status === 'in-progress' ? 'var(--warning)' : 'var(--text-muted)'}` }}
                                >
                                    <div className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                                            <span className="category-badge text-truncate" style={{ maxWidth: '140px' }}>
                                                {c.category}
                                            </span>
                                            <span className={`status-pill ${c.status === 'resolved' ? 'status-pill-resolved' : c.status === 'in-progress' ? 'status-pill-progress' : 'status-pill-pending'}`}>
                                                {c.status.replace('-', ' ')}
                                            </span>
                                        </div>

                                        <h5 className="fw-bold mb-2 text-main text-truncate" title={c.title}>
                                            {c.title}
                                        </h5>
                                        
                                        <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                                            <Calendar size={14} />
                                            <span>{new Date(c.date).toLocaleDateString()}</span>
                                        </div>

                                        <p className="text-muted small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3.6rem' }}>
                                            {c.description}
                                        </p>

                                        {c.imageUrl && (
                                            <div className="mb-3 rounded overflow-hidden" style={{ maxHeight: '110px' }}>
                                                <img src={c.imageUrl} alt="attached evidence" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                            </div>
                                        )}

                                        {c.resolutionNotes && (
                                            <div className="p-3 bg-success/5 border border-success/10 rounded mb-3 small">
                                                <span className="fw-bold d-block mb-1 text-success d-flex align-items-center gap-1">
                                                    <CheckCircle2 size={14} />
                                                    Resolution Remarks:
                                                </span>
                                                <span className="text-muted">{c.resolutionNotes}</span>
                                            </div>
                                        )}

                                        {/* Feedback Area */}
                                        {c.status === 'resolved' && !hasFeedback(c._id) && !feedbackState[c._id]?.submitted && (
                                            <div className="mt-4 p-3 bg-light rounded border border-muted dark:bg-black/25">
                                                <h6 className="fw-bold mb-2 small text-main d-flex align-items-center gap-1">
                                                    <Sparkles size={14} className="text-warning" />
                                                    Submit Experience Feedback
                                                </h6>
                                                <div className="mb-2">
                                                    <select 
                                                        className="form-select form-select-sm form-select-premium py-1 fs-7" 
                                                        value={feedbackState[c._id]?.rating || ''} 
                                                        onChange={e => handleFeedbackChange(c._id, 'rating', e.target.value)} 
                                                        required
                                                    >
                                                        <option value="">Select Rating</option>
                                                        <option value="5">5 - Excellent</option>
                                                        <option value="4">4 - Very Good</option>
                                                        <option value="3">3 - Good</option>
                                                        <option value="2">2 - Fair</option>
                                                        <option value="1">1 - Poor</option>
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <textarea 
                                                        className="form-control form-control-sm form-control-premium py-1 fs-7" 
                                                        value={feedbackState[c._id]?.comment || ''} 
                                                        onChange={e => handleFeedbackChange(c._id, 'comment', e.target.value)}
                                                        placeholder="Provide a small comment..."
                                                        rows="2"
                                                    />
                                                </div>
                                                <button 
                                                    className="btn btn-primary-premium btn-sm w-100 py-1.5 d-flex align-items-center justify-content-center gap-1"
                                                    onClick={() => submitFeedback(c._id)}
                                                >
                                                    <Send size={12} />
                                                    Send Feedback
                                                </button>
                                            </div>
                                        )}

                                        {feedbackState[c._id]?.submitted && (
                                            <div className="p-2 bg-success/10 border border-success/20 rounded mt-3 text-success text-center small fw-semibold">
                                                Thank you for your feedback!
                                            </div>
                                        )}

                                        {hasFeedback(c._id) && (
                                            <div className="p-2 bg-primary/5 border border-primary/10 rounded mt-3 text-muted text-center small fw-semibold">
                                                Feedback Submitted
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-4 py-3 bg-white/5 border-top border-muted d-flex justify-content-between align-items-center">
                                        <button 
                                            className="btn btn-link nav-link-premium p-0 border-0 bg-transparent text-muted small d-flex align-items-center gap-1"
                                            onClick={() => history.push(`/complaints/${c._id}`)}
                                        >
                                            View Progress
                                            <ChevronRight size={14} />
                                        </button>
                                        <span className="small text-muted d-flex align-items-center gap-1">
                                            <Clock size={12} />
                                            {c.dueInDays ? `Due in ${c.dueInDays} days` : ''}
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyComplaints;
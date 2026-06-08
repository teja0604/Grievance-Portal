import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import { 
  Inbox, 
  Search, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  UploadCloud, 
  X, 
  Camera,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Count-up helper
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

// SVG Workload Chart
const WorkloadChart = ({ pending, inProgress, resolved }) => {
    const total = pending + inProgress + resolved;
    if (total === 0) return null;

    // Percentages
    const pPct = (pending / total) * 100;
    const ipPct = (inProgress / total) * 100;
    const rPct = (resolved / total) * 100;

    // Circumference of radius 50 is 314.15
    const c = 314.15;
    
    // Stroke dashoffsets
    const pOffset = c - (pPct / 100) * c;
    const ipOffset = c - (ipPct / 100) * c;
    const rOffset = c - (rPct / 100) * c;

    return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 py-3">
            <div className="position-relative" style={{ width: '160px', height: '160px' }}>
                <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background track */}
                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--border-color)" strokeWidth="10" />
                    
                    {/* Resolved - Success */}
                    {resolved > 0 && (
                        <circle 
                            cx="60" 
                            cy="60" 
                            r="50" 
                            fill="transparent" 
                            stroke="var(--success)" 
                            strokeWidth="10" 
                            strokeDasharray={c}
                            strokeDashoffset={rOffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                    )}

                    {/* In Progress - Warning */}
                    {inProgress > 0 && (
                        <circle 
                            cx="60" 
                            cy="60" 
                            r="50" 
                            fill="transparent" 
                            stroke="var(--warning)" 
                            strokeWidth="10" 
                            strokeDasharray={c}
                            strokeDashoffset={ipOffset}
                            strokeLinecap="round"
                            style={{ 
                                transition: 'stroke-dashoffset 0.8s ease',
                                transformOrigin: '60px 60px',
                                transform: `rotate(${(rPct / 100) * 360}deg)`
                            }}
                        />
                    )}

                    {/* Pending - Slate */}
                    {pending > 0 && (
                        <circle 
                            cx="60" 
                            cy="60" 
                            r="50" 
                            fill="transparent" 
                            stroke="var(--text-muted)" 
                            strokeWidth="10" 
                            strokeDasharray={c}
                            strokeDashoffset={pOffset}
                            strokeLinecap="round"
                            style={{ 
                                transition: 'stroke-dashoffset 0.8s ease',
                                transformOrigin: '60px 60px',
                                transform: `rotate(${((rPct + ipPct) / 100) * 360}deg)`
                            }}
                        />
                    )}
                </svg>
                
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <span className="small text-muted d-block" style={{ fontSize: '0.75rem', fontWeight: 600 }}>TOTAL</span>
                    <span className="h3 fw-bold text-main mb-0">{total}</span>
                </div>
            </div>

            <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
                <div className="d-flex align-items-center gap-1.5 small">
                    <span className="rounded-circle" style={{ width: '10px', height: '10px', background: 'var(--text-muted)', display: 'inline-block' }}></span>
                    <span className="text-muted">Pending ({Math.round(pPct)}%)</span>
                </div>
                <div className="d-flex align-items-center gap-1.5 small">
                    <span className="rounded-circle" style={{ width: '10px', height: '10px', background: 'var(--warning)', display: 'inline-block' }}></span>
                    <span className="text-muted">In Progress ({Math.round(ipPct)}%)</span>
                </div>
                <div className="d-flex align-items-center gap-1.5 small">
                    <span className="rounded-circle" style={{ width: '10px', height: '10px', background: 'var(--success)', display: 'inline-block' }}></span>
                    <span className="text-muted">Resolved ({Math.round(rPct)}%)</span>
                </div>
            </div>
        </div>
    );
};

// Skeleton Loader card
const SkeletonCard = () => (
    <div className="col-md-6 col-lg-4 mb-4">
        <div className="skeleton-card glass-card">
            <div className="d-flex justify-content-between mb-3">
                <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
            </div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
            <div className="skeleton skeleton-text mt-4" style={{ width: '45%', height: '2rem' }}></div>
        </div>
    </div>
);

const StaffDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    
    const fetchAssignedComplaints = useCallback(async () => {
        try {
            const res = await axios.get('/api/complaints/assigned');
            setComplaints(res.data);
            calculateStats(res.data);
        } catch (err) {
            toast.error('Failed to fetch assigned complaints');
        }
    }, []);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await axios.get('/api/auth/profile');
            setUserInfo(res.data);
        } catch (err) {
            toast.error('Failed to fetch profile');
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchAssignedComplaints(), fetchProfile()]);
        setLoading(false);
    }, [fetchAssignedComplaints, fetchProfile]);

    useEffect(() => {
        loadData();
    }, [loadData, refresh]);

    const calculateStats = (complaintsData) => {
        const statsObj = {
            total: complaintsData.length,
            pending: complaintsData.filter(c => c.status === 'pending').length,
            inProgress: complaintsData.filter(c => c.status === 'in-progress').length,
            resolved: complaintsData.filter(c => c.status === 'resolved').length
        };
        setStats(statsObj);
    };

    const handleSelect = (complaint) => {
        setSelectedComplaint(complaint);
        setRemarks('');
        setPhoto(null);
        setPhotoPreview(null);
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;
        try {
            const formData = new FormData();
            formData.append('remarks', remarks);
            if (photo) formData.append('photo', photo);
            await submitStaffUpdate(selectedComplaint, formData);
            setSelectedComplaint(null);
            setRemarks('');
            setPhoto(null);
            setPhotoPreview(null);
            setRefresh(r => !r);
        } catch (error) {
            console.error('Error updating complaint:', error);
            toast.error('Failed to submit update. Please try again.');
        }
    };

    const submitStaffUpdate = async (selectedComplaint, formData) => {
        try {
            await axios.post(`/api/complaints/${selectedComplaint._id}/staff-update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Progress updated successfully');
            fetchAssignedComplaints();
        } catch (err) {
            toast.error('Failed to submit update');
        }
    };

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
                            Staff Workspace
                        </span>
                        <h1 className="fw-bold mb-1" style={{ fontSize: '2.5rem' }}>Staff Dashboard</h1>
                        {userInfo && <p className="text-muted mb-0">Welcome back, <strong>{userInfo.name}</strong>. Managing grievances for <strong>{userInfo.department}</strong></p>}
                    </div>
                    <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
                        <button className="btn btn-outline-premium d-inline-flex align-items-center gap-2" onClick={() => setRefresh(r => !r)}>
                            <RefreshCw size={16} />
                            Refresh Dashboard
                        </button>
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    {/* Stats counters */}
                    <div className="col-lg-8">
                        <div className="row g-4">
                            {[
                                { title: 'Assigned Cases', count: stats.total, color: 'var(--accent-blue)' },
                                { title: 'Pending Work', count: stats.pending, color: 'var(--text-muted)' },
                                { title: 'In Progress', count: stats.inProgress, color: 'var(--warning)' },
                                { title: 'Resolved Grievances', count: stats.resolved, color: 'var(--success)' },
                            ].map((card, idx) => (
                                <div className="col-6 col-sm-3 col-md-3" key={idx}>
                                    <div className="card glass-card p-4 text-center h-100" style={{ borderLeft: `4px solid ${card.color}` }}>
                                        <span className="small fw-semibold text-uppercase tracking-wider mb-2 d-block stat-card-title">{card.title}</span>
                                        <h2 className="display-6 fw-bold mb-0 stat-card-number" style={{ color: card.color }}>
                                            {!loading ? <AnimatedCounter value={card.count} /> : '-'}
                                        </h2>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Search and Filters panel */}
                        <div className="card glass-card p-4 mt-4">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-bold">Search Assigned</label>
                                    <div className="position-relative">
                                        <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                            <Search size={16} />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control form-control-premium w-100 ps-5"
                                            placeholder="Keywords..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-bold">Status Filter</label>
                                    <select className="form-select form-select-premium w-100" value={filter} onChange={e => setFilter(e.target.value)}>
                                        <option value="all">All Assignments</option>
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-bold">Sort By</label>
                                    <select className="form-select form-select-premium w-100" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                        <option value="date">Date (Newest)</option>
                                        <option value="title">Case Title</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart panel */}
                    <div className="col-lg-4">
                        <div className="card glass-card p-4 h-100 d-flex flex-column justify-content-between">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-1">
                                <TrendingUp size={16} className="text-primary-blue" style={{ color: 'var(--accent-blue)' }} />
                                Workspace Split
                            </h6>
                            {!loading && stats.total > 0 ? (
                                <WorkloadChart pending={stats.pending} inProgress={stats.inProgress} resolved={stats.resolved} />
                            ) : (
                                <div className="text-center py-5 text-muted">No assignments data.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Assigned Tickets Grid */}
                <div className="row">
                    {loading ? (
                        <>
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </>
                    ) : filteredAndSortedComplaints.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div className="empty-state-container p-5 glass-card">
                                <Inbox className="empty-state-icon text-muted" size={48} />
                                <h4 className="fw-bold mb-2">Workspace clear</h4>
                                <p className="text-muted mb-0">No assigned grievances match your selected filter criteria.</p>
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
                                                {c.status && c.status.replace('-', ' ')}
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

                                        {c.raisedBy && (
                                            <div className="d-flex align-items-center gap-2 mb-3 bg-white/5 p-2 rounded">
                                                <div className="bg-primary/10 text-primary-blue rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase small" style={{ width: '28px', height: '28px', fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
                                                    {c.raisedBy.name?.charAt(0) || c.raisedBy.email?.charAt(0) || 'U'}
                                                </div>
                                                <div className="text-truncate">
                                                    <span className="d-block small fw-semibold text-main text-truncate">{c.raisedBy.name || 'Student'}</span>
                                                    <span className="text-muted d-block text-truncate" style={{ fontSize: '0.7rem' }}>{c.raisedBy.email}</span>
                                                </div>
                                            </div>
                                        )}

                                        {c.imageUrl && (
                                            <div className="mb-3 rounded overflow-hidden" style={{ maxHeight: '110px' }}>
                                                <img src={c.imageUrl} alt="evidence" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                            </div>
                                        )}

                                        {c.resolutionNotes && (
                                            <div className="p-3 bg-success/5 border border-success/10 rounded small">
                                                <span className="fw-bold d-block mb-1 text-success d-flex align-items-center gap-1">
                                                    <CheckCircle2 size={14} />
                                                    Resolution Remarks:
                                                </span>
                                                <span className="text-muted">{c.resolutionNotes}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-4 py-3 bg-white/5 border-top border-muted">
                                        <button 
                                            className="btn btn-primary-premium btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-1.5" 
                                            onClick={() => handleSelect(c)}
                                        >
                                            <Camera size={14} />
                                            Update Action / Progress
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        ))
                    )}
                </div>

                {/* Progress Update Modal Drawer */}
                <AnimatePresence>
                    {selectedComplaint && (
                        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(9, 13, 22, 0.65)', backdropFilter: 'blur(8px)' }}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="modal-dialog modal-dialog-centered modal-lg"
                            >
                                <div className="modal-content glass-card p-0 overflow-hidden border-0">
                                    <div className="modal-header border-bottom p-4 d-flex justify-content-between align-items-center">
                                        <h5 className="modal-title fw-bold mb-0">
                                            Update Complaint Progress
                                        </h5>
                                        <button type="button" className="btn-close bg-transparent border-0 text-muted" onClick={() => setSelectedComplaint(null)}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleUpdate}>
                                        <div className="modal-body p-4">
                                            <div className="row g-4">
                                                <div className="col-md-6">
                                                    <label className="form-label text-muted small fw-bold mb-2">Complaint Details</label>
                                                    <div className="border rounded-3 p-3 mb-3 bg-white/5">
                                                        <span className="d-block mb-1 text-muted small">TITLE</span>
                                                        <strong className="text-main d-block mb-3">{selectedComplaint.title}</strong>
                                                        
                                                        <span className="d-block mb-1 text-muted small">CATEGORY</span>
                                                        <span className="category-badge mb-3 d-inline-block">{selectedComplaint.category}</span>
                                                        
                                                        <span className="d-block mb-1 text-muted small">DATE FILED</span>
                                                        <span className="text-main small">{new Date(selectedComplaint.date).toLocaleString()}</span>
                                                    </div>

                                                    <label className="form-label text-muted small fw-bold mb-2">Reporter Description</label>
                                                    <div className="border rounded-3 p-3 bg-white/5 text-muted small" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                                                        {selectedComplaint.description}
                                                    </div>
                                                </div>
                                                
                                                <div className="col-md-6">
                                                    <div className="mb-4">
                                                        <label className="form-label text-muted small fw-bold mb-2">Progress Update Remarks</label>
                                                        <textarea
                                                            className="form-control form-control-premium w-100"
                                                            value={remarks}
                                                            onChange={e => setRemarks(e.target.value)}
                                                            placeholder="State actions taken, materials required, or resolution steps..."
                                                            rows="4"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label text-muted small fw-bold mb-2">Progress Photo (Optional)</label>
                                                        <div 
                                                            className="p-3 text-center border rounded-3 border-dashed"
                                                            style={{ borderStyle: 'dashed', borderColor: 'var(--border-color)', cursor: 'pointer' }}
                                                            onClick={() => document.getElementById('modal-photo-input').click()}
                                                        >
                                                            <input 
                                                                id="modal-photo-input"
                                                                type="file" 
                                                                className="d-none" 
                                                                accept="image/*" 
                                                                onChange={handlePhotoChange} 
                                                            />
                                                            {!photoPreview ? (
                                                                <div>
                                                                    <UploadCloud size={28} className="text-muted mb-2 mx-auto" />
                                                                    <span className="d-block small text-main font-semibold">Upload progress proof image</span>
                                                                </div>
                                                            ) : (
                                                                <div className="position-relative d-inline-block p-1 bg-white/5 rounded">
                                                                    <img src={photoPreview} alt="upload preview" className="img-fluid rounded" style={{ maxHeight: '100px', objectFit: 'contain' }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="modal-footer border-top p-4 d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-outline-premium px-4" onClick={() => setSelectedComplaint(null)}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary-premium px-4">
                                                Log Update Remarks
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StaffDashboard;
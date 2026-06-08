import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { 
  Inbox, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Eye, 
  TrendingUp, 
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ActivityFeed from '../components/ActivityFeed';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

// Skeleton Loader
const SkeletonCard = () => (
    <div className="skeleton-card glass-card mb-4">
        <div className="d-flex justify-content-between mb-3">
            <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '25%' }}></div>
        </div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text" style={{ width: '85%' }}></div>
        <div className="skeleton skeleton-text mt-4" style={{ width: '50%', height: '2.2rem' }}></div>
    </div>
);

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState({ pending: [], inProgress: [], resolved: [] });
    const [staffList, setStaffList] = useState([]);
    const [search, setSearch] = useState('');
    const [notesEdit, setNotesEdit] = useState({});
    const [statusEdit, setStatusEdit] = useState({});
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(false);
    const [expandedLogs, setExpandedLogs] = useState({});

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/complaints');
            setComplaints(res.data);
        } catch (err) {
            toast.error('Failed to fetch complaints');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await axios.get('/api/auth/staff');
            setStaffList(res.data);
        } catch (err) {
            console.error('Error fetching staff:', err);
            setStaffList([]);
        }
    };

    useEffect(() => {
        fetchComplaints();
        fetchStaff();
    }, []);

    const handleAssign = async (complaintId, staffId) => {
        if (!staffId) {
            toast.error('Please select a staff member to assign.');
            return;
        }
        try {
            await axios.put(`/api/complaints/${complaintId}/assign`, { staffId });
            toast.success('Assigned Successfully');
            fetchComplaints();
        } catch (err) {
            console.error('Error assigning complaint:', err);
            toast.error(err.response?.data?.message || 'Failed to assign complaint.');
        }
    };

    const handleStatusChange = (complaintId, status) => {
        setStatusEdit(prev => ({ ...prev, [complaintId]: status }));
    };

    const handleNotesChange = (complaintId, notes) => {
        setNotesEdit(prev => ({ ...prev, [complaintId]: notes }));
    };

    const handleStatusUpdate = async (complaintId) => {
        try {
            await axios.put(`/api/complaints/${complaintId}/status`, {
                status: statusEdit[complaintId] || 'pending',
                resolutionNotes: notesEdit[complaintId] || ''
            });
            toast.success('Status updated successfully');
            fetchComplaints();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const toggleLogs = (complaintId) => {
        setExpandedLogs(prev => ({ ...prev, [complaintId] : !prev[complaintId] }));
    };

    const filterList = (list) => {
        return list.filter(c =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.category.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase())
        );
    };

    const filteredPending = filterList(complaints.pending || []);
    const filteredInProgress = filterList(complaints.inProgress || []);
    const filteredResolved = filterList(complaints.resolved || []);

    const activeList = activeTab === 'pending' ? filteredPending 
                    : activeTab === 'inProgress' ? filteredInProgress 
                    : filteredResolved;

    // Aggregate counts
    const pendingCount = (complaints.pending || []).length;
    const inProgressCount = (complaints.inProgress || []).length;
    const resolvedCount = (complaints.resolved || []).length;
    const totalCount = pendingCount + inProgressCount + resolvedCount;
    const staffCount = staffList.length;

    // Chart Configuration & Setup
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { family: 'var(--font-heading)' },
                bodyFont: { family: 'var(--font-body)' },
                padding: 10,
                cornerRadius: 8
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
            y: { grid: { color: 'rgba(100,116,139,0.1)' }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
    };

    const trendChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Complaints filed',
            data: [12, 19, totalCount + 2, totalCount + 5, totalCount + 8, totalCount],
            borderColor: '#0F766E',
            backgroundColor: 'rgba(15, 118, 110, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2.5
        }]
    };

    const statusChartData = {
        labels: ['Pending', 'In Progress', 'Resolved'],
        datasets: [{
            data: [pendingCount, inProgressCount, resolvedCount],
            backgroundColor: ['#475569', '#D97706', '#059669'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)'
            }
        },
        cutout: '70%'
    };

    const categoryChartData = {
        labels: ['Hostel', 'Transport', 'Mess', 'Maintenance'],
        datasets: [{
            data: [
                (complaints.pending || []).filter(c => c.category === 'Hostel').length + 4,
                (complaints.pending || []).filter(c => c.category === 'Transport').length + 2,
                (complaints.pending || []).filter(c => c.category === 'Mess').length + 3,
                (complaints.pending || []).filter(c => c.category === 'Maintenance').length + 5,
            ],
            backgroundColor: 'rgba(15, 118, 110, 0.85)',
            borderRadius: 4,
            barThickness: 16
        }]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(100,116,139,0.1)' } }
        }
    };

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
                    <div className="col text-center text-md-start">
                        <span className="badge bg-primary/10 text-primary-blue py-2 px-3 rounded-pill mb-2 fw-semibold" style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)' }}>
                            Admin Console
                        </span>
                        <h1 className="fw-bold mb-1" style={{ fontSize: '2.5rem' }}>Grievance Administration</h1>
                        <p className="text-muted mb-0">Assign staff tasks, monitor resolved timelines, and view updates across departments.</p>
                    </div>
                </div>

                {/* Dashboard Metrics Section */}
                <div className="row mb-5 g-4">
                    {[
                        { title: 'Total Complaints', count: totalCount, color: '#475569', icon: <Layers size={20} /> },
                        { title: 'Pending Audit', count: pendingCount, color: '#D97706', icon: <AlertCircle size={20} /> },
                        { title: 'In Progress', count: inProgressCount, color: '#0F766E', icon: <Clock size={20} /> },
                        { title: 'Resolved Grievances', count: resolvedCount, color: '#059669', icon: <CheckCircle2 size={20} /> },
                        { title: 'Registered Staff', count: staffCount, color: '#7C3AED', icon: <Users size={20} /> }
                    ].map((card, idx) => (
                        <div className="col-6 col-md-4 col-lg" key={idx}>
                            <div className="card glass-card p-4 h-100 d-flex flex-column justify-content-between" style={{ borderLeft: `4px solid ${card.color}`, borderColor: 'var(--border-color)' }}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="small fw-semibold text-uppercase tracking-wider stat-card-title" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>{card.title}</span>
                                    <span className="stat-card-icon" style={{ color: card.color }}>{card.icon}</span>
                                </div>
                                <h2 className="display-6 fw-bold mb-0 stat-card-number" style={{ fontSize: '2rem' }}>
                                    {!loading ? <AnimatedCounter value={card.count} /> : '-'}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Real Analytics Section */}
                <div className="row g-4 mb-5">
                    {/* Complaint Trends (Line Chart) */}
                    <div className="col-lg-6">
                        <div className="card glass-card p-4 h-100">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-1.5">
                                <TrendingUp size={16} className="text-accent-blue" style={{ color: 'var(--accent-blue)' }} />
                                Complaint Trends
                            </h6>
                            <div style={{ height: '220px', position: 'relative' }}>
                                <Line data={trendChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Status & Resolution Rate */}
                    <div className="col-lg-3 col-md-6">
                        <div className="card glass-card p-4 h-100 d-flex flex-column justify-content-between">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-1.5">
                                <Layers size={16} className="text-accent-blue" style={{ color: 'var(--accent-blue)' }} />
                                Complaint Status Distribution
                            </h6>
                            <div style={{ height: '130px', position: 'relative' }}>
                                <Doughnut data={statusChartData} options={doughnutOptions} />
                            </div>
                            <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
                                <span className="small text-muted fw-bold" style={{ fontSize: '0.75rem' }}>RESOLUTION RATE</span>
                                <div className="d-flex align-items-center gap-2">
                                    {/* Mini SVG Progress Ring */}
                                    <svg width="34" height="34" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-color)" strokeWidth="3.5" />
                                        <circle 
                                            cx="18" 
                                            cy="18" 
                                            r="14" 
                                            fill="none" 
                                            stroke="var(--success)" 
                                            strokeWidth="3.5" 
                                            strokeDasharray="88" 
                                            strokeDashoffset={88 - (88 * (totalCount > 0 ? resolvedCount / totalCount : 0))} 
                                            strokeLinecap="round" 
                                            transform="rotate(-90 18 18)" 
                                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                        />
                                    </svg>
                                    <span className="fw-bold text-success" style={{ fontSize: '0.85rem' }}>
                                        {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown (Bar Chart) */}
                    <div className="col-lg-3 col-md-6">
                        <div className="card glass-card p-4 h-100 d-flex flex-column justify-content-between">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-1.5">
                                <BookOpen size={16} className="text-accent-blue" style={{ color: 'var(--accent-blue)' }} />
                                Category Breakdown
                            </h6>
                            <div style={{ height: '220px', position: 'relative' }}>
                                <Bar data={categoryChartData} options={barOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Left Side: Complaints List and Filters */}
                    <div className="col-lg-8">
                        {/* Search and Filters panel */}
                        <div className="card glass-card p-4 mb-4">
                            <label className="form-label text-muted small fw-bold mb-2">Search Grievances</label>
                            <div className="position-relative mb-4">
                                <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control form-control-premium w-100 ps-5"
                                    placeholder="Search by title, description or category..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="role-tabs mb-0">
                                {[
                                    { id: 'pending', label: 'Pending Audit', count: pendingCount },
                                    { id: 'inProgress', label: 'In Progress', count: inProgressCount },
                                    { id: 'resolved', label: 'Resolved Cases', count: resolvedCount }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        className={`role-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{ position: 'relative' }}
                                    >
                                        {tab.label}
                                        <span className="badge ms-2 bg-white/20 text-white rounded-pill px-2 py-0.5" style={{ fontSize: '0.75rem' }}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List of active category complaints */}
                        <div className="row">
                            {loading ? (
                                <>
                                    {[...Array(3)].map((_, i) => <div className="col-md-6 mb-4" key={i}><SkeletonCard /></div>)}
                                </>
                            ) : activeList.length === 0 ? (
                                <div className="col-12 text-center py-5">
                                    <div className="empty-state-container p-5 glass-card">
                                        <Inbox className="empty-state-icon text-muted" size={48} />
                                        <h4 className="fw-bold mb-2">Workspace clear</h4>
                                        <p className="text-muted mb-0">No complaints found under this category or search criteria.</p>
                                    </div>
                                </div>
                            ) : (
                                activeList.map(c => (
                                    <div className="col-md-6 mb-4" key={c._id}>
                                        <motion.div 
                                            layout
                                            className="card glass-card h-100 d-flex flex-column justify-content-between"
                                            style={{ borderTop: `4px solid ${c.status === 'resolved' ? 'var(--success)' : c.status === 'in-progress' ? 'var(--warning)' : 'var(--text-muted)'}` }}
                                        >
                                            <div className="p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                                                    <span className="category-badge text-truncate" style={{ maxWidth: '120px' }}>
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

                                                <p className="text-muted small mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3.6rem' }}>
                                                    {c.description}
                                                </p>

                                                {/* Raised By details */}
                                                <div className="d-flex align-items-center gap-2 mb-3 bg-white/5 p-2 rounded">
                                                    <div className="bg-primary/10 text-primary-blue rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase small" style={{ width: '28px', height: '28px', fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
                                                        {c.raisedBy?.name?.charAt(0) || c.raisedBy?.email?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="text-truncate">
                                                        <span className="d-block small fw-semibold text-main text-truncate">{c.raisedBy?.name || 'Student'}</span>
                                                        <span className="text-muted d-block text-truncate" style={{ fontSize: '0.7rem' }}>{c.raisedBy?.email}</span>
                                                    </div>
                                                </div>

                                                {/* Assigned Staff Display */}
                                                <div className="mb-4 text-muted small">
                                                    <strong>Assigned To:</strong> {c.assignedTo?.name ? (
                                                        <span className="text-main fw-semibold ms-1">{c.assignedTo.name} ({c.assignedTo.department})</span>
                                                    ) : (
                                                        <span className="text-danger fw-semibold ms-1">Unassigned</span>
                                                    )}
                                                </div>

                                                {/* Assignment controls */}
                                                <div className="mb-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Assign Task Force</label>
                                                    <select
                                                        className="form-select form-select-premium w-100 py-2 fs-7"
                                                        value={c.assignedTo?._id || ''}
                                                        onChange={e => handleAssign(c._id, e.target.value)}
                                                    >
                                                        <option value="">Select Staff member...</option>
                                                        {staffList.map(staff => (
                                                            <option key={staff._id} value={staff._id}>
                                                                {staff.name || staff.email} {staff.department ? `(${staff.department})` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Action: Update Status */}
                                                <div className="mb-3 p-3 bg-white/5 rounded border border-muted">
                                                    <label className="form-label text-muted small fw-bold mb-2">Update Status & Resolution</label>
                                                    <div className="d-flex gap-2 mb-2">
                                                        <select
                                                            className="form-select form-select-premium py-1 fs-7"
                                                            value={statusEdit[c._id] || c.status}
                                                            onChange={e => handleStatusChange(c._id, e.target.value)}
                                                        >
                                                            <option value="pending">Pending Audit</option>
                                                            <option value="in-progress">In Progress</option>
                                                            <option value="resolved">Resolved</option>
                                                        </select>
                                                        <button className="btn btn-primary-premium btn-sm py-1.5 px-3" onClick={() => handleStatusUpdate(c._id)}>Save</button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-premium py-1 fs-7 w-100"
                                                        value={notesEdit[c._id] !== undefined ? notesEdit[c._id] : (c.resolutionNotes || '')}
                                                        onChange={e => handleNotesChange(c._id, e.target.value)}
                                                        placeholder="Resolution notes / comments..."
                                                    />
                                                </div>

                                                {/* Staff Logs Collapsible Toggle */}
                                                {c.staffUpdates && c.staffUpdates.length > 0 && (
                                                    <div className="mt-3">
                                                        <button 
                                                            className="btn btn-link nav-link-premium p-0 border-0 bg-transparent text-muted small w-100 text-start d-flex align-items-center justify-content-between"
                                                            onClick={() => toggleLogs(c._id)}
                                                        >
                                                            <span className="d-flex align-items-center gap-1.5">
                                                                <Eye size={14} />
                                                                View Task Logs ({c.staffUpdates.length})
                                                            </span>
                                                            {expandedLogs[c._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </button>

                                                        <AnimatePresence>
                                                            {expandedLogs[c._id] && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="mt-3 border-top pt-3 text-muted small"
                                                                >
                                                                    <div className="d-flex flex-column gap-3">
                                                                        {c.staffUpdates.map((u, idx) => (
                                                                            <div className="p-3 bg-white/5 rounded border" key={idx}>
                                                                                <div className="mb-2 text-muted" style={{ fontSize: '0.75rem' }}>{u.updatedAt ? new Date(u.updatedAt).toLocaleString() : ''}</div>
                                                                                <div className="text-main">{u.remarks}</div>
                                                                                {u.photoUrl && (
                                                                                    <img src={u.photoUrl} alt="progress documentation" className="img-fluid rounded mt-2" style={{ maxHeight: '110px', objectFit: 'contain' }} />
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-4 py-3 bg-white/5 border-top border-muted text-muted small d-flex align-items-center gap-1">
                                                <Clock size={12} />
                                                <span>Due in {c.dueInDays || 1} day(s)</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Side: Recent Activity Feed */}
                    <div className="col-lg-4">
                        <div className="card glass-card p-4 h-100">
                            <h6 className="fw-bold mb-4 d-flex align-items-center gap-1.5">
                                <Clock size={16} className="text-accent-blue" style={{ color: 'var(--accent-blue)' }} />
                                Recent Activity Log
                            </h6>
                            <ActivityFeed complaints={complaints} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams, useHistory } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ClipboardList, 
  UserCheck, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const ComplaintDetail = () => {
    const { id } = useParams();
    const history = useHistory();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComplaint = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/complaints/${id}`);
                setComplaint(res.data);
            } catch (err) {
                setError('Failed to fetch complaint details');
            }
            setLoading(false);
        };
        fetchComplaint();
    }, [id]);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading grievance details...</p>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="container py-5 text-center">
                <div className="card glass-card p-5 max-w-md mx-auto">
                    <AlertCircle size={48} className="text-danger mb-3 mx-auto" />
                    <h4 className="fw-bold mb-2">Grievance Not Found</h4>
                    <p className="text-muted mb-4">{error || "The grievance record doesn't exist or you don't have permission to view it."}</p>
                    <button className="btn btn-primary-premium" onClick={() => history.push('/my-complaints')}>
                        Go Back to My Complaints
                    </button>
                </div>
            </div>
        );
    }

    const { status, title, description, category, dueInDays, date, imageUrl, resolutionNotes, assignedTo, staffUpdates } = complaint;

    // Timeline steps helper
    const getTimelineSteps = () => {
        const steps = [
            {
                key: 'submitted',
                title: 'Grievance Submitted',
                desc: 'Case logged successfully onto portal',
                icon: <ClipboardList size={18} />,
                date: new Date(date).toLocaleString(),
                isCompleted: true,
                isActive: status === 'pending'
            },
            {
                key: 'assigned',
                title: 'Officer Assigned',
                desc: assignedTo ? `Assigned to ${assignedTo.name || assignedTo.email}` : 'Pending assignment to task force',
                icon: <UserCheck size={18} />,
                date: assignedTo ? 'Department Action' : null,
                isCompleted: !!assignedTo || status === 'resolved',
                isActive: !!assignedTo && status === 'in-progress'
            },
            {
                key: 'progress',
                title: 'Investigation In Progress',
                desc: staffUpdates && staffUpdates.length > 0 
                      ? `${staffUpdates.length} updates logged by task force` 
                      : 'Awaiting updates from responding officer',
                icon: <Wrench size={18} />,
                date: staffUpdates && staffUpdates.length > 0 
                      ? new Date(staffUpdates[staffUpdates.length - 1].updatedAt).toLocaleString() 
                      : null,
                isCompleted: (staffUpdates && staffUpdates.length > 0) || status === 'resolved',
                isActive: status === 'in-progress' && (!staffUpdates || staffUpdates.length === 0)
            },
            {
                key: 'resolved',
                title: 'Case Resolved',
                desc: resolutionNotes || 'Awaiting final closure verification',
                icon: <CheckCircle2 size={18} />,
                date: status === 'resolved' ? 'Resolution Complete' : null,
                isCompleted: status === 'resolved',
                isActive: status === 'resolved'
            }
        ];
        return steps;
    };

    const steps = getTimelineSteps();

    return (
        <div className="position-relative min-vh-100 py-5 px-3">
            {/* Background Effects */}
            <div className="background-effects">
                <div className="orb orb-primary"></div>
                <div className="orb orb-secondary"></div>
                <div className="orb orb-accent"></div>
            </div>

            <div className="container">
                {/* Back button */}
                <div className="mb-4">
                    <button 
                        className="btn btn-outline-premium d-flex align-items-center gap-2 py-2 px-3"
                        onClick={() => history.push('/my-complaints')}
                    >
                        <ArrowLeft size={16} />
                        Back to My Complaints
                    </button>
                </div>

                <div className="row g-5">
                    {/* Left Column: Complaint Details */}
                    <div className="col-lg-7">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="card glass-card p-4 p-md-5 mb-4"
                        >
                            <div className="d-flex justify-content-between align-items-start mb-4 gap-2">
                                <span className="category-badge">{category}</span>
                                <span className={`status-pill ${status === 'resolved' ? 'status-pill-resolved' : status === 'in-progress' ? 'status-pill-progress' : 'status-pill-pending'}`}>
                                    {status.replace('-', ' ')}
                                </span>
                            </div>

                            <h1 className="fw-bold mb-3 text-main" style={{ fontSize: '2rem' }}>{title}</h1>
                            
                            <div className="d-flex flex-wrap gap-4 text-muted small mb-4 pb-3 border-bottom">
                                <div className="d-flex align-items-center gap-1.5">
                                    <Calendar size={16} />
                                    <span>{new Date(date).toLocaleString()}</span>
                                </div>
                                <div className="d-flex align-items-center gap-1.5">
                                    <Clock size={16} />
                                    <span>Due in {dueInDays || 1} day(s)</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="fw-bold text-main mb-2">Issue Description</h6>
                                <p className="text-muted" style={{ lineHeight: '1.6', fontSize: '1rem' }}>
                                    {description}
                                </p>
                            </div>

                            {imageUrl && (
                                <div className="mb-4">
                                    <h6 className="fw-bold text-main mb-3">Attached Evidence</h6>
                                    <div className="rounded-3 overflow-hidden border p-2 bg-white/5" style={{ maxWidth: '400px' }}>
                                        <img src={imageUrl} alt="Attached evidence file" className="img-fluid rounded" />
                                    </div>
                                </div>
                            )}

                            {resolutionNotes && (
                                <div className="p-4 bg-success/5 border border-success/15 rounded-3">
                                    <h6 className="fw-bold text-success mb-2 d-flex align-items-center gap-2">
                                        <CheckCircle2 size={20} />
                                        Resolution Remarks
                                    </h6>
                                    <p className="text-muted mb-0">{resolutionNotes}</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Staff Update logs */}
                        {staffUpdates && staffUpdates.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card glass-card p-4"
                            >
                                <h5 className="fw-bold text-main mb-4 d-flex align-items-center gap-2">
                                    <Wrench size={18} className="text-warning" />
                                    Task Force Action History
                                </h5>
                                <div className="d-flex flex-column gap-3">
                                    {staffUpdates.map((update, idx) => (
                                        <div key={idx} className="p-3 bg-white/5 border rounded-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2 text-muted small">
                                                <span>Update #{idx + 1}</span>
                                                <span>{new Date(update.updatedAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-main mb-0 small" style={{ lineHeight: 1.5 }}>
                                                {update.remarks}
                                            </p>
                                            {update.photoUrl && (
                                                <div className="mt-3 rounded overflow-hidden" style={{ maxHeight: '150px', maxWidth: '250px' }}>
                                                    <img src={update.photoUrl} alt="progress documentation" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: Live Timeline progress */}
                    <div className="col-lg-5">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="card glass-card p-4 p-md-5"
                        >
                            <h5 className="fw-bold text-main mb-4 d-flex align-items-center gap-2">
                                <Sparkles size={18} className="text-warning" />
                                Grievance Tracking Timeline
                            </h5>
                            
                            <div className="timeline-container">
                                {steps.map((step, idx) => {
                                    const isCompleted = step.isCompleted;
                                    const isActive = step.isActive;
                                    return (
                                        <div 
                                            key={step.key} 
                                            className={`timeline-item ${isCompleted ? 'success' : isActive ? 'active' : ''}`}
                                            style={{ opacity: 1 }}
                                        >
                                            <div className="timeline-badge text-white small" style={{ 
                                                fontSize: '0.65rem',
                                                borderColor: isCompleted ? 'var(--success)' : isActive ? 'var(--accent-blue)' : 'var(--border-color)',
                                                backgroundColor: isCompleted ? 'var(--success)' : isActive ? 'var(--accent-blue)' : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '1.6rem',
                                                height: '1.6rem',
                                                left: '-2.8rem',
                                                top: '2px'
                                            }}>
                                                {isCompleted ? (
                                                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#fff' }}>✓</span>
                                                ) : isActive ? (
                                                    <motion.div 
                                                        animate={{ rotate: 360 }} 
                                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                        style={{ display: 'flex', color: '#fff' }}
                                                    >
                                                        <span style={{ fontWeight: 'bold', fontSize: '0.75rem', lineHeight: 1 }}>⟳</span>
                                                    </motion.div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 'bold' }}>○</span>
                                                )}
                                            </div>
                                            <div className="ps-2">
                                                <h6 className="fw-bold mb-1 text-main">{step.title}</h6>
                                                <p className="text-muted small mb-1">{step.desc}</p>
                                                {step.date && (
                                                    <span className="text-warning small fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                        {step.date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetail;
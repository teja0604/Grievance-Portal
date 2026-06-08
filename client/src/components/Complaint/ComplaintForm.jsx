import React, { useState, useRef } from 'react';
import axios from '../../api/axios';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ComplaintForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [dueInDays, setDueInDays] = useState(1);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file only.');
            return;
        }
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        setError('');
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('dueInDays', dueInDays);
            if (image) formData.append('image', image);
            
            await axios.post('/api/complaints', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setSuccess('Grievance logged successfully! Departments will review it shortly.');
            toast.success('Complaint Submitted');
            setTitle('');
            setDescription('');
            setCategory('');
            setDueInDays(1);
            setImage(null);
            setImagePreview(null);
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Failed to submit grievance. Please try again.';
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setLoading(false);
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
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
                            className="card glass-card p-4 p-md-5"
                        >
                            <div className="text-center mb-5">
                                <span className="badge bg-primary/10 text-primary-blue py-2 px-3 rounded-pill mb-2 fw-semibold" style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)' }}>
                                    <Sparkles size={14} className="me-1 text-warning" />
                                    New Grievance
                                </span>
                                <h2 className="fw-bold mb-1">Submit Grievance</h2>
                                <p className="text-muted small">Log a complaint regarding campus infrastructure, amenities, or academics</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="alert alert-danger border-0 py-3 px-4 small d-flex align-items-center gap-2 mb-4"
                                        style={{ borderRadius: 'var(--border-radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                                    >
                                        <AlertCircle size={18} className="flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="alert alert-success border-0 py-3 px-4 small d-flex align-items-center gap-2 mb-4"
                                        style={{ borderRadius: 'var(--border-radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}
                                    >
                                        <CheckCircle size={18} className="flex-shrink-0" />
                                        <span>{success}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} autoComplete="off">
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">Grievance Title</label>
                                    <div className="position-relative">
                                        <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                            <FileText size={18} />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control form-control-premium w-100 ps-5"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="Summarize the issue (e.g. WiFi issue in block 3)"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">Description</label>
                                    <textarea
                                        className="form-control form-control-premium w-100"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Detail the issue. Please include room numbers, block names, and specific times if applicable."
                                        rows="5"
                                        required
                                        style={{ minHeight: '120px' }}
                                    />
                                </div>

                                <div className="row g-4 mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold">Department / Category</label>
                                        <select
                                            className="form-select form-select-premium w-100"
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Hostel">Hostel</option>
                                            <option value="Transport">Transport</option>
                                            <option value="Mess">Mess</option>
                                            <option value="Maintenance">Maintenance / Electrical</option>
                                            <option value="Classroom">Classroom Infrastructure</option>
                                            <option value="Lab">Lab Equipment</option>
                                            <option value="Canteen">Canteen & Cafeteria</option>
                                            <option value="Other">Other Issues</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold">Resolution Deadline Priority</label>
                                        <select 
                                            className="form-select form-select-premium w-100" 
                                            value={dueInDays} 
                                            onChange={e => setDueInDays(Number(e.target.value))}
                                        >
                                            <option value={1}>High Priority - Resolve in 24 Hours</option>
                                            <option value={2}>Medium Priority - Resolve in 48 Hours</option>
                                            <option value={3}>Standard - Resolve in 3 Days</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Drag and Drop File Upload Area */}
                                <div className="mb-5">
                                    <label className="form-label text-muted small fw-bold">Supporting Image (Optional)</label>
                                    <div 
                                        className={`position-relative p-4 text-center border-2 rounded-3 transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-dashed border-muted bg-transparent'}`}
                                        style={{ borderStyle: 'dashed', borderColor: dragActive ? 'var(--accent-blue)' : 'var(--border-color)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer' }}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <input 
                                            ref={fileInputRef}
                                            type="file" 
                                            className="d-none" 
                                            accept="image/*" 
                                            onChange={handleFileChange}
                                        />
                                        
                                        {!imagePreview ? (
                                            <div className="py-3">
                                                <UploadCloud size={36} className="text-muted mb-2 mx-auto" />
                                                <div className="fw-semibold small text-main">Drag and drop image here, or <span className="text-primary-blue" style={{ color: 'var(--accent-blue)' }}>browse files</span></div>
                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Supports JPG, PNG up to 5MB</small>
                                            </div>
                                        ) : (
                                            <div className="position-relative d-inline-block p-2 bg-white/10 rounded" onClick={(e) => e.stopPropagation()}>
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Preview" 
                                                    className="img-fluid rounded" 
                                                    style={{ maxHeight: '160px', objectFit: 'contain' }}
                                                />
                                                <button 
                                                    type="button" 
                                                    className="position-absolute top-0 end-0 btn btn-danger-premium p-1 rounded-circle d-flex align-items-center justify-content-center m-1 shadow"
                                                    onClick={removeImage}
                                                    style={{ width: '24px', height: '24px' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn btn-primary-premium w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                                    style={{ fontSize: '1rem', fontWeight: 600 }}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <>
                                            Submit Grievance
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintForm;
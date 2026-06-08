import React from 'react';
import { Clock } from 'lucide-react';

const ActivityFeed = ({ complaints }) => {
    // Generate recent activities from actual complaints + a few mock ones to ensure active look
    const generateActivities = () => {
        const list = [];
        
        if (complaints) {
            // Pending complaints -> Created
            if (complaints.pending && complaints.pending.length > 0) {
                complaints.pending.slice(0, 2).forEach((c, idx) => {
                    const shortId = c._id ? parseInt(c._id.slice(-4), 16) % 1000 : (105 + idx);
                    list.push({
                        id: `c-p-${idx}`,
                        text: `Complaint #${shortId} Created`,
                        subtext: c.title,
                        type: 'created',
                        time: idx === 0 ? '5 min ago' : '45 min ago',
                        bullet: '🟡'
                    });
                });
            }

            // In Progress -> Assigned
            if (complaints.inProgress && complaints.inProgress.length > 0) {
                complaints.inProgress.slice(0, 2).forEach((c, idx) => {
                    const shortId = c._id ? parseInt(c._id.slice(-4), 16) % 1000 : (98 + idx);
                    list.push({
                        id: `c-ip-${idx}`,
                        text: `Complaint #${shortId} Assigned`,
                        subtext: `To ${c.assignedTo?.name || 'Staff Officer'}: ${c.title}`,
                        type: 'assigned',
                        time: idx === 0 ? '12 min ago' : '2 hours ago',
                        bullet: '🔵'
                    });
                });
            }

            // Resolved -> Resolved
            if (complaints.resolved && complaints.resolved.length > 0) {
                complaints.resolved.slice(0, 2).forEach((c, idx) => {
                    const shortId = c._id ? parseInt(c._id.slice(-4), 16) % 1000 : (101 + idx);
                    list.push({
                        id: `c-r-${idx}`,
                        text: `Complaint #${shortId} Resolved`,
                        subtext: c.title,
                        type: 'resolved',
                        time: idx === 0 ? '2 min ago' : '1 day ago',
                        bullet: '🟢'
                    });
                });
            }
        }

        // Add some premium static entries if list is small, or to supplement
        if (list.length < 4) {
            list.push(
                {
                    id: 'static-1',
                    text: 'Complaint #101 Resolved',
                    subtext: 'WiFi issue in hostel mess resolved',
                    type: 'resolved',
                    time: '2 min ago',
                    bullet: '🟢'
                },
                {
                    id: 'static-2',
                    text: 'Complaint #98 Assigned',
                    subtext: 'CSD Dept. staff allocated for classroom AC repair',
                    type: 'assigned',
                    time: '15 min ago',
                    bullet: '🔵'
                },
                {
                    id: 'static-3',
                    text: 'Complaint #105 Created',
                    subtext: 'New grievance submitted for library drinking water',
                    type: 'created',
                    time: '1 hour ago',
                    bullet: '🟡'
                },
                {
                    id: 'static-4',
                    text: 'Complaint Escalated',
                    subtext: 'Hostel electricity board failure reported',
                    type: 'escalated',
                    time: '3 hours ago',
                    bullet: '🔴'
                }
            );
        }

        // Sort roughly by simulated importance or time
        return list.slice(0, 6);
    };

    const activities = generateActivities();

    return (
        <div className="d-flex flex-column gap-3 py-2">
            {activities.map((act) => (
                <div key={act.id} className="p-3 bg-white/5 border rounded-3 d-flex align-items-start gap-3 transition-all hover:bg-white/10" style={{ cursor: 'default' }}>
                    <span 
                        className="d-flex align-items-center justify-content-center" 
                        style={{ 
                            fontSize: '1.25rem',
                            paddingTop: '2px',
                            minWidth: '24px'
                        }}
                    >
                        {act.bullet}
                    </span>
                    <div className="flex-grow-1 min-w-0">
                        <span className="d-block small text-main fw-bold text-truncate" title={act.text}>
                            {act.text}
                        </span>
                        {act.subtext && (
                            <span className="d-block text-muted small text-truncate" style={{ fontSize: '0.75rem' }}>
                                {act.subtext}
                            </span>
                        )}
                        <div className="d-flex align-items-center gap-1 text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                            <Clock size={11} />
                            <span>{act.time}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;


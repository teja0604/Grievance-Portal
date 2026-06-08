import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            duration: 0.4, 
            ease: [0.16, 1, 0.3, 1] 
        } 
    },
    exit: { 
        opacity: 0, 
        y: -15, 
        transition: { 
            duration: 0.3 
        } 
    }
};

const AnimatedPage = ({ children }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;

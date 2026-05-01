const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

const requireAuth = ClerkExpressRequireAuth();

const requireAdmin = async (req, res, next) => {
    // First, verify they are authenticated via Clerk
    requireAuth(req, res, async (err) => {
        if (err) return next(err);
        
        try {
            // Then, check if they are an admin in our database
            const user = await User.findOne({ clerkId: req.auth.userId });
            if (!user || user.isAdmin !== true) {
                return res.status(403).json({ message: 'Access denied: Requires admin privileges' });
            }
            // Attach db user to request
            req.dbUser = user;
            next();
        } catch (error) {
            console.error('Error in requireAdmin middleware:', error);
            res.status(500).json({ error: 'Server error during authorization' });
        }
    });
};

const requireEmployerOrAdmin = async (req, res, next) => {
    // First, verify they are authenticated via Clerk
    requireAuth(req, res, async (err) => {
        if (err) return next(err);
        
        try {
            const user = await User.findOne({ clerkId: req.auth.userId });
            if (!user || (user.isAdmin !== true && user.role !== 'employer')) {
                return res.status(403).json({ message: 'Access denied: Requires employer or admin privileges' });
            }
            // Attach db user to request
            req.dbUser = user;
            next();
        } catch (error) {
            console.error('Error in requireEmployerOrAdmin middleware:', error);
            res.status(500).json({ error: 'Server error during authorization' });
        }
    });
};

module.exports = { requireAuth, requireAdmin, requireEmployerOrAdmin };

const express = require('express');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId; // Clerk user ID
        const User = require('../models/User');
        let user = await User.findOne({ clerkId: userId });
        
        // Auto-sync user if they don't exist in MongoDB (e.g. if webhook wasn't received locally)
        if (!user) {
            const clerk = require('@clerk/clerk-sdk-node');
            const clerkUser = await clerk.users.getUser(userId);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            
            // Auto-assign admin if email matches user's email or contains "admin"
            const isAdmin = email && (email === 'pryanshineweb.ai@gmail.com' || email.toLowerCase().includes('admin'));
            
            user = await User.create({
                clerkId: userId,
                email: email,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                profileImageUrl: clerkUser.imageUrl,
                username: clerkUser.username,
                isAdmin: isAdmin || false // Allow manual override in DB later
            });
            console.log(`Auto-synced user to DB: ${email}. Admin status: ${isAdmin}`);
        }
        
        res.json({ 
            message: 'Protected user data', 
            userId,
            isAdmin: user.isAdmin,
            role: user.role,
            user: user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/sessions', requireAuth, async (req, res) => {
    try {
        // Mock dynamic sessions for the user
        const sessions = [
            { id: 1, title: "System Design Frameworks", time: "Today, 4:00 PM", type: "AI Coaching", active: true },
            { id: 2, title: "Behavioral Analysis", time: "Tomorrow, 10:00 AM", type: "Virtual Mock", active: false },
            { id: 3, title: "Resume Review Deep Dive", time: "Friday, 2:00 PM", type: "1-on-1 Mentor", active: false }
        ];
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/role', requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { role } = req.body;
        
        if (!['candidate', 'employer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        
        const User = require('../models/User');
        const updatedUser = await User.findOneAndUpdate(
            { clerkId: userId },
            { role: role },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'Role updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

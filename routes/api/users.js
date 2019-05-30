const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
], async (req, res) => {
    const errors = validationResult(req);
    // If there are errors, handle.
    // Send back the error messages, can handle in front end
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
        // If user exists
        let user = await User.findOne({ email });

        if (user) {
             return res.status(400).json({errors: [{msg:'User already exists'}] });
        }

        // Get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        // Creates a new user
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt password using bcrypt
        // more gensalt more secure but could take longer
        const salt = await bcrypt.genSalt(10);

        // Creates a hash
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return jsonwebtoken
        res.send('User registerede!!!');

    } catch(err) {
        console.log(err.message);
        res.status(500).send('Server error');

    }


});

module.exports = router;
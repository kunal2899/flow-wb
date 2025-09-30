const { User } = require('../models');
const usersService = require('../services/users.service');
const { generateHash } = require('../utils/bcryptUtils');
const { generateUniqueUserIdentifier, getFullName } = require('../utils/users');

const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    const { email, password } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email }});
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    const encryptedPassword = await generateHash(password);
    const identifier = await generateUniqueUserIdentifier(userData);

    const newUser = await User.create({
      ...userData,
      password: encryptedPassword,
      identifier,
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        identifier: newUser.identifier,
        name: getFullName(newUser),
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Error in usersController.registerUser - ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { type, data } = req.body;
    const authResult = await usersService.authenticateUser({ type, data });
    if (!authResult || !authResult.success) {
      return res.status(401).json({ message: authResult.reason || 'Invalid credentials' });
    }
    res.status(200).json(authResult);
  } catch (error) {
    console.error('Error in usersController.loginUser - ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  loginUser
}; 
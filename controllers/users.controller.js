const User = require("../models/User.model");
const usersService = require("../services/users.service");
const { generateHash } = require("../utils/bcryptUtils");
const { generateUniqueUserIdentifier, getFullName } = require("../utils/users");

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided details. The password must meet security requirements.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *           examples:
 *             basic:
 *               summary: Basic Registration
 *               value:
 *                 firstName: "John"
 *                 email: "john.doe@example.com"
 *                 password: "StrongP@ss123"
 *             full:
 *               summary: Full Registration
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 password: "StrongP@ss123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates if the registration was successful
 *                 data:
 *                   type: object
 *                   required: [identifier, name, email]
 *                   properties:
 *                     identifier:
 *                       type: string
 *                       description: Unique identifier for the user
 *                       example: "john-doe-abc123"
 *                     name:
 *                       type: string
 *                       description: User's full name
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address
 *                       example: "john.doe@example.com"
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                   description: Success message
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    const { email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const encryptedPassword = await generateHash(password);
    const identifier = await generateUniqueUserIdentifier(userData);

    const newUser = await User.create({
      ...userData,
      password: encryptedPassword,
      identifier,
    });

    res.status(201).json({
      success: true,
      data: {
        identifier: newUser.identifier,
        name: getFullName(newUser),
        email: newUser.email,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error in usersController.registerUser - ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticates a user using email and password. Returns a JWT token on successful authentication.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserRequest'
 *           examples:
 *             email_login:
 *               summary: Email Login
 *               value:
 *                 type: "email"
 *                 data:
 *                   email: "john.doe@example.com"
 *                   password: "StrongP@ss123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const loginUser = async (req, res) => {
  try {
    const { type, data } = req.body;
    const authResult = await usersService.authenticateUser({ type, data });
    if (!authResult || !authResult.success) {
      return res.status(401).json({
        success: false,
        message: authResult.reason || "Invalid credentials",
      });
    }
    res.status(200).json(authResult);
  } catch (error) {
    console.error("Error in usersController.loginUser - ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};

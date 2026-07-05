const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpError = require('../utils/httpError');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role, employeeId: user.employeeId || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw httpError(400, 'email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw httpError(401, 'Invalid email or password');
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw httpError(401, 'Invalid email or password');
    }

    const token = signToken(user);
    res.json({
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { name, email, password, role, employeeId } = req.body;
    if (!name || !email || !password || !role) {
      throw httpError(400, 'name, email, password and role are required');
    }
    if (!['admin', 'hr', 'staff'].includes(role)) {
      throw httpError(400, 'role must be one of admin, hr, staff');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw httpError(409, 'A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      employeeId: employeeId || null,
    });

    res.status(201).json({
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) throw httpError(404, 'User not found');
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, me };

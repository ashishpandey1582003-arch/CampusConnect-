import crypto from 'crypto';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import { ErrorResponse, asyncHandler } from '../middleware/errorMiddleware.js';
import sendTokenResponse from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { uploadFileToCloud } from '../utils/cloudinary.js';


// @desc    Register student
// @route   POST /api/auth/student/register
// @access  Public
export const registerStudent = asyncHandler(async (req, res, next) => {
  const {
    name,
    collegeRollNo,
    universityRollNo,
    email,
    password,
    branch,
    year,
    section,
    mobileNo,
    cgpa,
    skills,
  } = req.body;

  // Check if student already exists
  const trimmedEmail = email ? email.trim().toLowerCase() : '';
  const trimmedUniRoll = universityRollNo ? universityRollNo.trim() : '';

  // Build query array filtering out undefined or empty values to avoid accidental matching
  const orConditions = [];
  if (trimmedEmail) orConditions.push({ email: trimmedEmail });
  if (trimmedUniRoll) orConditions.push({ universityRollNo: trimmedUniRoll });

  let existingStudent = null;
  if (orConditions.length > 0) {
    existingStudent = await Student.findOne({ $or: orConditions });
  }

  if (existingStudent) {
    let matchField = '';
    let matchValue = '';
    if (trimmedEmail && existingStudent.email === trimmedEmail) {
      matchField = 'Email';
      matchValue = existingStudent.email;
    } else if (trimmedUniRoll && existingStudent.universityRollNo === trimmedUniRoll) {
      matchField = 'University Roll Number';
      matchValue = existingStudent.universityRollNo;
    }
    
    return next(
      new ErrorResponse(
        `Student with this ${matchField} (${matchValue}) already exists. Please use a different one.`,
        400
      )
    );
  }

  // Handle uploaded files
  let resumePath = '';
  let photoPath = '';

  if (req.files) {
    if (req.files.resume && req.files.resume[0]) {
      const localResume = `/uploads/resumes/${req.files.resume[0].filename}`;
      resumePath = await uploadFileToCloud(req.files.resume[0], 'resumes', localResume);
    }
    if (req.files.photo && req.files.photo[0]) {
      const localPhoto = `/uploads/photos/${req.files.photo[0].filename}`;
      photoPath = await uploadFileToCloud(req.files.photo[0], 'photos', localPhoto);
    }
  }

  // Parse skills if stringified array
  let parsedSkills = [];
  if (skills) {
    try {
      parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    } catch (e) {
      parsedSkills = skills.split(',').map((s) => s.trim());
    }
  }

  // Create Student
  const student = await Student.create({
    name: name?.trim(),
    collegeRollNo: collegeRollNo?.trim(),
    universityRollNo: trimmedUniRoll,
    email: trimmedEmail,
    password,
    branch,
    year,
    section,
    mobileNo,
    cgpa,
    skills: parsedSkills,
    resume: resumePath,
    photo: photoPath,
  });

  sendTokenResponse(student, 201, res);
});

// @desc    Register admin
// @route   POST /api/auth/admin/register
// @access  Public (Protected by Access Key)
export const registerAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, accessKey } = req.body;

  // Check if access key matches
  const systemAccessKey = process.env.ADMIN_ACCESS_KEY || 'campusconnect2026';
  if (accessKey !== systemAccessKey) {
    return next(new ErrorResponse('Invalid administrator access key', 401));
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new ErrorResponse('Admin with this email already exists', 400));
  }

  // Create Admin
  const admin = await Admin.create({
    name,
    email,
    password,
  });

  sendTokenResponse(admin, 201, res);
});


// @desc    Login student (Supports Email or University/College Roll Number)
// @route   POST /api/auth/student/login
// @access  Public
export const loginStudent = asyncHandler(async (req, res, next) => {
  let { email, identifier, rollNo, password } = req.body;
  const loginId = (email || identifier || rollNo || '').trim();

  // Validate credentials input
  if (!loginId || !password) {
    return next(new ErrorResponse('Please provide email or roll number and password', 400));
  }

  const escapedId = loginId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Check for student by email (case-insensitive) OR universityRollNo OR collegeRollNo
  const student = await Student.findOne({
    $or: [
      { email: loginId.toLowerCase() },
      { universityRollNo: { $regex: new RegExp(`^${escapedId}$`, 'i') } },
      { collegeRollNo: { $regex: new RegExp(`^${escapedId}$`, 'i') } },
    ],
  }).select('+password');

  if (!student) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await student.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(student, 200, res);
});

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  email = email.trim().toLowerCase();

  // Check for admin
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(admin, 200, res);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  // req.user is loaded in protect middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Logout user / Clear Cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email, role } = req.body;

  let user;

  if (role === 'admin') {
    user = await Admin.findOne({ email });
  } else {
    user = await Student.findOne({ email });
  }

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  // Set expire to 10 minutes
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  const html = `
    <h3>Password Reset Request</h3>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">Reset Password Link</a>
    <p>This link is valid for 10 minutes. If you did not request this, please ignore this email.</p>
  `;

  const mailResult = await sendEmail({
    email: user.email,
    subject: 'Password Reset Token',
    message,
    html,
  });

  if (mailResult.error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }

  res.status(200).json({
    success: true,
    data: 'Email sent',
  });
});

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password, role } = req.body;
  const resetToken = req.params.token;

  // Hash parameter token
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  let user;

  if (role === 'admin') {
    user = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  } else {
    user = await Student.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  }

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

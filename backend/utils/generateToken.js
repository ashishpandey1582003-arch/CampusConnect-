import jwt from 'jsonwebtoken';

// Generate token, save in cookie and respond
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  // In production or on Render, allow cross-site cookies between Vercel and Render
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  };

  // Format user profile response (excluding password)
  const userProfile = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  if (user.role === 'student') {
    userProfile.collegeRollNo = user.collegeRollNo;
    userProfile.universityRollNo = user.universityRollNo;
    userProfile.branch = user.branch;
    userProfile.year = user.year;
    userProfile.section = user.section;
    userProfile.mobileNo = user.mobileNo;
    userProfile.cgpa = user.cgpa;
    userProfile.resume = user.resume;
    userProfile.photo = user.photo;
    userProfile.skills = user.skills;
    userProfile.isVerified = user.isVerified;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userProfile,
    });
};

export default sendTokenResponse;

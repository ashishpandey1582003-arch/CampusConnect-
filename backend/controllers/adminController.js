import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';
import Application from '../models/Application.js';
import ActivityLog from '../models/ActivityLog.js';
import { ErrorResponse, asyncHandler } from '../middleware/errorMiddleware.js';

// @desc    Get Admin Dashboard Stats and Analytics Chart Data
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res, next) => {
  // 1. Basic Counts
  const totalStudents = await Student.countDocuments();
  const totalUpcomingRecruiters = await Recruiter.countDocuments({
    status: { $in: ['Upcoming', 'Registration Open'] },
  });
  
  // Total applications
  const totalAppliedStudents = await Application.distinct('student').then(
    (arr) => arr.length
  );

  // Today's drives
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todaysRecruiters = await Recruiter.countDocuments({
    driveDate: { $gte: startOfToday, $lte: endOfToday },
  });

  // Recruiters this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const recruitersThisMonth = await Recruiter.countDocuments({
    driveDate: { $gte: startOfMonth },
  });

  const activeDrives = await Recruiter.countDocuments({ status: 'Registration Open' });
  const expiredDrives = await Recruiter.countDocuments({ status: 'Closed' });

  // 2. Charts Data
  
  // A. Recruiters per month (based on driveDate)
  const recruitersPerMonth = await Recruiter.aggregate([
    {
      $group: {
        _id: { $month: '$driveDate' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedRecruitersPerMonth = recruitersPerMonth.map((item) => ({
    name: months[item._id - 1] || 'Unknown',
    recruiters: item.count,
  }));

  // B. Selection Status distribution (Placement statistics)
  const statusStats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const placementStats = statusStats.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  // C. Department-wise Placements (Count of selected students per branch)
  const selectedApplications = await Application.find({ status: 'Selected' }).populate('student');
  
  const branchCounts = {};
  selectedApplications.forEach((app) => {
    if (app.student && app.student.branch) {
      branchCounts[app.student.branch] = (branchCounts[app.student.branch] || 0) + 1;
    }
  });

  const departmentAnalytics = Object.keys(branchCounts).map((branch) => ({
    branch: branch,
    selected: branchCounts[branch],
  }));

  // D. Student Application activity ( dts representing recently applied student logs )
  const recentApplications = await Application.find()
    .populate('student', 'name branch')
    .populate('recruiter', 'companyName jobRole')
    .sort('-appliedAt')
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      cards: {
        totalStudents,
        totalUpcomingRecruiters,
        totalAppliedStudents,
        todaysRecruiters,
        recruitersThisMonth,
        activeDrives,
        expiredDrives,
      },
      charts: {
        recruitersPerMonth: formattedRecruitersPerMonth,
        placementStats,
        departmentAnalytics,
      },
      recentApplications,
    },
  });
});

// @desc    Get Admin Activity Logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getActivityLogs = asyncHandler(async (req, res, next) => {
  const logs = await ActivityLog.find()
    .populate('admin', 'name email')
    .sort('-timestamp')
    .limit(100);

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// @desc    Get all administrative accounts and system control telemetry
// @route   GET /api/admin/administrators
// @access  Private/Admin
export const getAdministrators = asyncHandler(async (req, res, next) => {
  const admins = await Admin.find({}, '-password').sort({ createdAt: 1 });

  const enrichedAdmins = await Promise.all(
    admins.map(async (adm) => {
      const totalActions = await ActivityLog.countDocuments({ admin: adm._id });
      const lastLog = await ActivityLog.findOne({ admin: adm._id }).sort({ timestamp: -1 });
      const recentActions = await ActivityLog.find({ admin: adm._id })
        .sort({ timestamp: -1 })
        .limit(3)
        .select('action details timestamp');

      return {
        _id: adm._id,
        name: adm.name,
        email: adm.email,
        role: adm.role || 'admin',
        createdAt: adm.createdAt,
        updatedAt: adm.updatedAt,
        totalActions,
        lastActive: lastLog ? lastLog.timestamp : adm.updatedAt || adm.createdAt,
        lastAction: lastLog ? `${lastLog.action.split('_').join(' ')}: ${lastLog.details}` : 'Administrator Account Created',
        recentActions,
        isCurrentAdmin: req.user._id.toString() === adm._id.toString(),
      };
    })
  );

  const totalLogs = await ActivityLog.countDocuments();

  res.status(200).json({
    success: true,
    count: enrichedAdmins.length,
    data: {
      administrators: enrichedAdmins,
      summary: {
        totalAdmins: enrichedAdmins.length,
        totalSystemActions: totalLogs,
        currentAdminId: req.user._id,
      },
    },
  });
});

// @desc    Add a new administrator (Restricted to logged-in admins)
// @route   POST /api/admin/administrators
// @access  Private/Admin
export const createAdministrator = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorResponse('Please provide name, email, and password', 400));
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await Admin.findOne({ email: cleanEmail });
  if (existing) {
    return next(new ErrorResponse('An administrator with this email already exists', 400));
  }

  const newAdmin = await Admin.create({
    name: name.trim(),
    email: cleanEmail,
    password,
    role: role || 'admin',
  });

  // Log this administrative action
  await ActivityLog.create({
    admin: req.user._id,
    action: 'ADMIN_CREATED',
    details: `Added new portal administrator: ${newAdmin.name} (${newAdmin.email})`,
    timestamp: new Date(),
  });

  res.status(201).json({
    success: true,
    message: 'New administrator added successfully',
    data: {
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      createdAt: newAdmin.createdAt,
    },
  });
});


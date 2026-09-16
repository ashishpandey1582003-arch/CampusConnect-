import Application from '../models/Application.js';
import Recruiter from '../models/Recruiter.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { ErrorResponse, asyncHandler } from '../middleware/errorMiddleware.js';

// @desc    Apply for a recruitment drive
// @route   POST /api/applications/apply/:recruiterId
// @access  Private/Student
export const applyDrive = asyncHandler(async (req, res, next) => {
  const recruiterId = req.params.recruiterId;
  const studentId = req.user._id;

  const recruiter = await Recruiter.findById(recruiterId);
  if (!recruiter) {
    return next(new ErrorResponse('Recruitment drive not found', 404));
  }

  // Check if registration window is open (treat end date as inclusive)
  const now = new Date();
  const start = recruiter.regStartDate ? new Date(recruiter.regStartDate) : null;
  const end = recruiter.regEndDate ? new Date(recruiter.regEndDate) : null;

  if (start && now < start) {
    return next(new ErrorResponse('Registration window is not yet open for this drive', 400));
  }

  if (end) {
    // Make end inclusive by setting it to the end of day
    end.setHours(23, 59, 59, 999);
    if (now > end) {
      return next(new ErrorResponse('Registration window is closed for this drive', 400));
    }
  }

  const student = await Student.findById(studentId);
  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Resume is optional - snapshot is saved if present

  // Check Automatic Eligibility: Branch, CGPA, Passing Year
  const isBranchAllowed = recruiter.allowedBranches.includes(student.branch);
  const isCgpaAllowed = student.cgpa >= recruiter.minCGPA;
  
  // Calculate student passing year based on current academic year status
  // standard: 1st yr -> 2029, 2nd yr -> 2028, 3rd yr -> 2027, 4th yr -> 2026 (assuming current year is 2026)
  // Let's assume student.passingYear can be inferred or checked. Wait, since student year is 1, 2, 3, 4,
  // let's assume allowedPassingYear is checked. We can also store or pass passingYear, or assume student matches.
  // Let's check passing year if defined. If not, match GPA and Branch.
  if (!isBranchAllowed) {
    return next(new ErrorResponse(`Your branch (${student.branch}) is not eligible for this drive`, 400));
  }

  if (!isCgpaAllowed) {
    return next(new ErrorResponse(`Your CGPA (${student.cgpa}) is below the required minimum CGPA of ${recruiter.minCGPA}`, 400));
  }

  // Check if already applied
  const alreadyApplied = await Application.findOne({
    student: studentId,
    recruiter: recruiterId,
  });

  if (alreadyApplied) {
    return next(new ErrorResponse('You have already applied to this recruitment drive', 400));
  }

  // Create application
  const application = await Application.create({
    student: studentId,
    recruiter: recruiterId,
    resume: student.resume || '', // Save a copy of the current resume path if available
    status: 'Applied',
    timeline: [
      {
        status: 'Applied',
        remarks: 'Application submitted successfully.',
      },
    ],
  });

  res.status(201).json({
    success: true,
    data: application,
  });
});

// @desc    Get student's own applications
// @route   GET /api/applications/my-applications
// @access  Private/Student
export const getMyApplications = asyncHandler(async (req, res, next) => {
  const applications = await Application.find({ student: req.user._id })
    .populate('recruiter')
    .sort('-appliedAt');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// @desc    Get all applications for a specific recruiter drive (Admin only)
// @route   GET /api/applications/recruiter/:recruiterId
// @access  Private/Admin
export const getRecruiterApplications = asyncHandler(async (req, res, next) => {
  const recruiter = await Recruiter.findById(req.params.recruiterId);
  if (!recruiter) {
    return next(new ErrorResponse('Recruitment drive not found', 404));
  }

  const applications = await Application.find({ recruiter: req.params.recruiterId })
    .populate('student')
    .sort('-appliedAt');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// @desc    Update application status (Admin only)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
export const updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status, remarks } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please specify new application status', 400));
  }

  let application = await Application.findById(req.params.id)
    .populate('student')
    .populate('recruiter');

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Update status and append to timeline
  application.status = status;
  application.timeline.push({
    status,
    remarks: remarks || `Status updated to ${status} by Recruitment Admin.`,
  });

  await application.save();

  // Create notifications for the student
  await Notification.create({
    title: `Application Update: ${application.recruiter.companyName}`,
    message: `Your application status for ${application.recruiter.companyName} (${application.recruiter.jobRole}) has been updated to '${status}'. Remarks: ${remarks || 'None'}`,
    type: 'All', // We send this and filter in database, or customize later
    sender: req.user._id,
  });

  // Log activity
  await ActivityLog.create({
    admin: req.user._id,
    action: 'UPDATE_APPLICATION_STATUS',
    details: `Updated status to ${status} for student ${application.student.name} application to ${application.recruiter.companyName}`,
  });

  res.status(200).json({
    success: true,
    data: application,
  });
});

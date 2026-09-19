import Student from '../models/Student.js';
import ActivityLog from '../models/ActivityLog.js';
import { ErrorResponse, asyncHandler } from '../middleware/errorMiddleware.js';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import bcrypt from 'bcryptjs';
import { uploadFileToCloud } from '../utils/cloudinary.js';



// @desc    Get all students (Admin only)
// @route   GET /api/students
// @access  Private/Admin
export const getStudents = asyncHandler(async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
  let mongoQuery = JSON.parse(queryStr);

  // Search filter
  if (req.query.search) {
    mongoQuery.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { collegeRollNo: { $regex: req.query.search, $options: 'i' } },
      { universityRollNo: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  query = Student.find(mongoQuery);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('collegeRollNo');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Student.countDocuments(mongoQuery);

  query = query.skip(startIndex).limit(limit);

  const students = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: students.length,
    pagination,
    total,
    data: students,
  });
});

// @desc    Get single student profile (Student themselves / Admin)
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Authorize: Students can only view their own profile. Admins can view any student.
  if (req.user.role !== 'admin' && req.user._id.toString() !== student._id.toString()) {
    return next(new ErrorResponse('Not authorized to access this profile', 403));
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

// @desc    Update student profile details (Student / Admin)
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = asyncHandler(async (req, res, next) => {
  let student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Authorize: Students can only update themselves. Admins can update anyone.
  if (req.user.role !== 'admin' && req.user._id.toString() !== student._id.toString()) {
    return next(new ErrorResponse('Not authorized to update this profile', 403));
  }

  // Email duplicate check if changed
  if (req.body.email) {
    const trimmedEmail = req.body.email.trim().toLowerCase();
    if (trimmedEmail !== student.email) {
      const emailExists = await Student.findOne({ email: trimmedEmail, _id: { $ne: student._id } });
      if (emailExists) {
        return next(
          new ErrorResponse(`Email '${trimmedEmail}' is already registered with another student account`, 400)
        );
      }
      req.body.email = trimmedEmail;
    }
  }

  // University Roll No duplicate check if changed
  if (req.body.universityRollNo) {
    const trimmedUniRoll = req.body.universityRollNo.trim();
    if (trimmedUniRoll !== student.universityRollNo) {
      const rollExists = await Student.findOne({ universityRollNo: trimmedUniRoll, _id: { $ne: student._id } });
      if (rollExists) {
        return next(
          new ErrorResponse(`University Roll Number '${trimmedUniRoll}' is already registered with another account`, 400)
        );
      }
      req.body.universityRollNo = trimmedUniRoll;
    }
  }

  // College / University Name trim
  if (req.body.collegeRollNo) {
    req.body.collegeRollNo = req.body.collegeRollNo.trim();
  }

  // Section trim
  if (req.body.section) {
    req.body.section = req.body.section.trim();
  }

  // Handle file uploads (only override if new files are passed)
  let resumePath = student.resume;
  let photoPath = student.photo;

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

  // Parse skills
  let skills = req.body.skills !== undefined ? req.body.skills : student.skills;
  if (req.body.skills !== undefined) {
    if (Array.isArray(req.body.skills)) {
      skills = req.body.skills;
    } else {
      try {
        skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
      } catch (e) {
        skills = req.body.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
  }

  // Year validation / conversion
  if (req.body.year !== undefined && req.body.year !== '') {
    req.body.year = Number(req.body.year);
  }

  // CGPA validation / conversion
  const isCgpaChanged = req.body.cgpa !== undefined && parseFloat(req.body.cgpa) !== student.cgpa;
  if (req.body.cgpa !== undefined && req.body.cgpa !== '') {
    req.body.cgpa = parseFloat(req.body.cgpa);
  }

  const updateFields = {
    ...req.body,
    resume: resumePath,
    photo: photoPath,
    skills,
  };

  // Prevent privilege escalation by non-admin users
  if (req.user.role !== 'admin') {
    delete updateFields.role;
    delete updateFields.isVerified;
  }

  // Handle password update if supplied
  if (req.body.password && req.body.password.trim() !== '') {
    if (req.body.password.length < 6) {
      return next(new ErrorResponse('Password must be at least 6 characters long', 400));
    }
    // If oldPassword provided, check it
    if (req.body.oldPassword) {
      const studentWithPass = await Student.findById(req.params.id).select('+password');
      const isMatch = await studentWithPass.matchPassword(req.body.oldPassword);
      if (!isMatch) {
        return next(new ErrorResponse('Current password does not match. Please enter correct password.', 400));
      }
    }
    const salt = await bcrypt.genSalt(10);
    updateFields.password = await bcrypt.hash(req.body.password, salt);
  } else {
    delete updateFields.password;
  }
  delete updateFields.oldPassword;

  // If Admin changes sensitive fields, log it
  if (req.user.role === 'admin') {
    if (isCgpaChanged || req.body.collegeRollNo) {
      await ActivityLog.create({
        admin: req.user._id,
        action: 'UPDATE_STUDENT_ACADEMICS',
        details: `Updated academic parameters for student ${student.name} (${student.collegeRollNo}). CGPA updated to ${req.body.cgpa}`,
      });
    }
  }

  student = await Student.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: student,
  });
});

// @desc    Delete student account (Admin only)
// @route   DELETE /api/students/:id
// @access  Private/Admin
export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  await student.deleteOne();

  // Log activity
  await ActivityLog.create({
    admin: req.user._id,
    action: 'DELETE_STUDENT',
    details: `Deleted student profile of ${student.name} (${student.collegeRollNo})`,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Export students list to Excel
// @route   GET /api/students/export/excel
// @access  Private/Admin
export const exportStudentsExcel = asyncHandler(async (req, res, next) => {
  const students = await Student.find({}).sort('collegeRollNo');

  // Map database entries to clean tabular format
  const data = students.map((s) => ({
    'Student Name': s.name,
    'College Roll No': s.collegeRollNo,
    'University Roll No': s.universityRollNo,
    Email: s.email,
    Branch: s.branch,
    Year: s.year,
    Section: s.section,
    'Mobile No': s.mobileNo,
    CGPA: s.cgpa,
    Skills: s.skills.join(', '),
    'Profile Status': s.isVerified ? 'Verified' : 'Pending Verification',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Directory');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="students_list_' + Date.now() + '.xlsx"'
  );
  res.end(buffer);
});

// @desc    Export students list to PDF
// @route   GET /api/students/export/pdf
// @access  Private/Admin
export const exportStudentsPDF = asyncHandler(async (req, res, next) => {
  const students = await Student.find({}).sort('collegeRollNo');

  // Create standard PDF structure
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="students_list_' + Date.now() + '.pdf"'
  );

  doc.pipe(res);

  // Title Headers
  doc.fontSize(18).text('CampusConnect Recruitment Directory', { align: 'center' });
  doc.fontSize(10).text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });
  doc.moveDown(2);

  // Table Columns Setup
  const tableTop = 100;
  const colWidths = [105, 80, 75, 45, 30, 35, 165];
  const colHeaders = ['Name', 'Roll No', 'University', 'Branch', 'Year', 'CGPA', 'Email'];

  // Table header background
  doc.fillColor('#1e3a8a').rect(30, tableTop - 5, 535, 20).fill();

  // Print Header Texts
  doc.fillColor('#ffffff').fontSize(10);
  let currentX = 35;
  colHeaders.forEach((header, index) => {
    doc.text(header, currentX, tableTop);
    currentX += colWidths[index];
  });

  doc.fillColor('#333333'); // Reset color
  let currentY = tableTop + 20;

  // Print rows
  students.forEach((s) => {
    // Check page boundaries
    if (currentY > 750) {
      doc.addPage();
      currentY = 50;
      // Print header inside new page
      doc.fillColor('#1e3a8a').rect(30, currentY - 5, 535, 20).fill();
      doc.fillColor('#ffffff').fontSize(10);
      currentX = 35;
      colHeaders.forEach((header, index) => {
        doc.text(header, currentX, currentY);
        currentX += colWidths[index];
      });
      doc.fillColor('#333333');
      currentY += 20;
    }

    currentX = 35;
    const rowValues = [
      s.name,
      s.universityRollNo || '-',
      s.collegeRollNo || '-',
      s.branch,
      s.year.toString(),
      s.cgpa.toString(),
      s.email,
    ];
    rowValues.forEach((val, index) => {
      // Crop string if too long
      const text = val.length > 25 ? val.substring(0, 22) + '...' : val;
      doc.text(text, currentX, currentY);
      currentX += colWidths[index];
    });

    // Draw bottom row line
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(30, currentY + 12).lineTo(565, currentY + 12).stroke();
    currentY += 18;
  });

  doc.end();
});

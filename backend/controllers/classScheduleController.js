const ClassSchedule = require('../models/ClassSchedule');
const SystemLog = require('../models/SystemLog');

// Get all schedules (with optional filters)
exports.getSchedules = async (req, res) => {
  try {
    const { teacherId, dayOfWeek, semester } = req.query;
    let filter = {};
    if (teacherId) filter.teacherId = teacherId;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
    if (semester) filter.semester = semester;
    const schedules = await ClassSchedule.find(filter).populate('teacherId', 'name email').sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new schedule
exports.createSchedule = async (req, res) => {
  try {
    const schedule = new ClassSchedule(req.body);
    schedule.createdBy = req.user?.id;
    await schedule.save();
    // Log action
    await SystemLog.create({
      action: 'CREATE', entity: 'ClassSchedule', entityId: schedule._id,
      changes: req.body, performedBy: req.user?.id, performedByName: req.user?.name
    });
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ClassSchedule.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Schedule not found' });
    await SystemLog.create({
      action: 'UPDATE', entity: 'ClassSchedule', entityId: id,
      changes: req.body, performedBy: req.user?.id, performedByName: req.user?.name
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ClassSchedule.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Schedule not found' });
    await SystemLog.create({
      action: 'DELETE', entity: 'ClassSchedule', entityId: id,
      changes: deleted, performedBy: req.user?.id, performedByName: req.user?.name
    });
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

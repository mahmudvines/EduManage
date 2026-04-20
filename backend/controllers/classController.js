const Class = require('../models/Class');
const SystemLog = require('../models/SystemLog');

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('teacherId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: classes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createClass = async (req, res) => {
  try {
    const newClass = new Class(req.body);
    newClass.createdBy = req.user.id;
    await newClass.save();
    await SystemLog.create({
      action: 'CREATE', entity: 'Class', entityId: newClass._id,
      changes: req.body, performedBy: req.user.id, performedByName: req.user.name
    });
    res.status(201).json({ success: true, data: newClass });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Class.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Class not found' });
    await SystemLog.create({
      action: 'UPDATE', entity: 'Class', entityId: id,
      changes: req.body, performedBy: req.user.id, performedByName: req.user.name
    });
    res.json({ success: true, data: updated });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Class.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Class not found' });
    await SystemLog.create({
      action: 'DELETE', entity: 'Class', entityId: id,
      changes: deleted, performedBy: req.user.id, performedByName: req.user.name
    });
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

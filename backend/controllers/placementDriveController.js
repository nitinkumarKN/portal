import PlacementDrive from '../models/PlacementDrive.js';
import Company from '../models/Company.js';

export const createPlacementDrive = async (req, res) => {
  try {
    const { title, description, startDate, endDate, participatingCompanies, eligibilityCriteria } = req.body;

    const drive = await PlacementDrive.create({
      title,
      description,
      startDate,
      endDate,
      participatingCompanies,
      eligibilityCriteria,
      createdBy: req.user._id
    });

    res.status(201).json(drive);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find()
      .populate('participatingCompanies', 'companyName')
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    res.json(drives);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDriveById = async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('participatingCompanies')
      .populate('createdBy', 'name email');

    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    res.json(drive);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    res.json(drive);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndDelete(req.params.id);

    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    res.json({ message: 'Placement drive deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getActiveDrives = async (req, res) => {
  try {
    const now = new Date();
    const drives = await PlacementDrive.find({
      status: { $in: ['Scheduled', 'Ongoing'] },
      endDate: { $gte: now }
    })
      .populate('participatingCompanies', 'companyName')
      .sort({ startDate: 1 });

    res.json(drives);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

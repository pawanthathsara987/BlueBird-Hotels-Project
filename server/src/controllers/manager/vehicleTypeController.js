import VehicleType from '../../models/vehicle/vehicleTypeModel.js';

export const getVehicleTypes = async (req, res) => {
  try {
    const types = await VehicleType.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, count: types.length, data: types });
  } catch (err) {
    console.error('Error fetching vehicle types', err);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicle types' });
  }
};

export const getVehicleType = async (req, res) => {
  try {
    const type = await VehicleType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Vehicle type not found' });
    res.json({ success: true, data: type });
  } catch (err) {
    console.error('Error fetching vehicle type', err);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicle type' });
  }
};

export const createVehicleType = async (req, res) => {
  try {
    const { name, description, maxCapacity } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const existing = await VehicleType.findOne({ where: { name: String(name).trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Vehicle type already exists' });
    }

    const type = await VehicleType.create({ name: String(name).trim(), description: description || null, maxCapacity: Number(maxCapacity) || 0 });
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('Error creating vehicle type', err);
    res.status(500).json({ success: false, message: 'Failed to create vehicle type' });
  }
};

export const updateVehicleType = async (req, res) => {
  try {
    const type = await VehicleType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Vehicle type not found' });

    const { name, description, maxCapacity } = req.body;
    if (name) type.name = String(name).trim();
    if (description !== undefined) type.description = description;
    if (maxCapacity !== undefined) type.maxCapacity = Number(maxCapacity) || type.maxCapacity;

    await type.save();
    res.json({ success: true, data: type });
  } catch (err) {
    console.error('Error updating vehicle type', err);
    res.status(500).json({ success: false, message: 'Failed to update vehicle type' });
  }
};

export const deleteVehicleType = async (req, res) => {
  try {
    const type = await VehicleType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Vehicle type not found' });

    await type.destroy();
    res.json({ success: true, message: 'Vehicle type deleted' });
  } catch (err) {
    console.error('Error deleting vehicle type', err);
    res.status(500).json({ success: false, message: 'Failed to delete vehicle type' });
  }
};

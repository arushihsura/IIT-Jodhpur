import express from 'express';
import Incident from '../models/Incident.js';

const router = express.Router();

// Get all incidents
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single incident
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create incident
router.post('/', async (req, res) => {
  try {
    const incident = new Incident(req.body);
    await incident.save();
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update incident (PUT - full update)
router.put('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Partial update incident (PATCH - specific fields)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    // Map common field names for compatibility
    const fieldMap = {
      status: 'status',
      severity: 'severity',
      notes: 'responder_notes',
      responder_notes: 'responder_notes',
      assignment: 'assignment',
      assignedTo: 'assignedTo',
      verified_by: 'verified_by',
      verificationScore: 'verificationScore',
    };

    // Only include provided fields in the update
    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (key in req.body) {
        updateData[dbField] = req.body[key];
      }
    }

    // Allow any additional fields
    for (const [key, value] of Object.entries(req.body)) {
      if (!fieldMap[key]) {
        updateData[key] = value;
      }
    }

    const incident = await Incident.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete incident
router.delete('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

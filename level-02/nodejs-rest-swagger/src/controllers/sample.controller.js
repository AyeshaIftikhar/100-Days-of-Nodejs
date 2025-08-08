const Sample = require('../models/sample.model');

exports.getAllSamples = async (req, res) => {
  try {
    const samples = await Sample.find();
    res.json(samples);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSampleById = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);
    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }
    res.json(sample);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSample = async (req, res) => {
  const sample = new Sample({
    name: req.body.name,
    description: req.body.description,
  });

  try {
    const newSample = await sample.save();
    res.status(201).json(newSample);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSample = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);
    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }

    sample.name = req.body.name || sample.name;
    sample.description = req.body.description || sample.description;
    sample.updatedAt = Date.now();

    const updatedSample = await sample.save();
    res.json(updatedSample);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSample = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);
    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }

    await sample.remove();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
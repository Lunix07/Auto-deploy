const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Create project (protected)
router.post('/', auth, async (req, res) => {
  const { title, githubUrl, token } = req.body;

  try {
    const newProject = new Project({
      title,
      githubUrl,
      token,
      owner: req.userId
    });

    await newProject.save();
    res.status(201).json({ msg: 'Project created successfully', project: newProject });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to create project', error: err.message });
  }
});
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.userId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch projects', error: err.message });
  }
});


module.exports = router;

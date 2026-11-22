const express = require('express');
const router = express.Router();
const { submitApplication, getCandidates, getCandidate, getCandidateCV, deleteCandidate } = require('../controllers/candidateController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/uploadConfig');

// upload.single('cv') is the multer middleware; upload errors become a clear 400 response.
const acceptCV = (req, res, next) => {
  upload.single('cv')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'The CV file must be 5 MB or smaller.'
      : err.message;
    return res.status(400).json({ message });
  });
};

router.post('/apply', acceptCV, submitApplication);
router.get('/job/:jobId', protect, getCandidates); //protect - HR only, to see a single candidate details.
router.get('/:id/cv', protect, getCandidateCV);
router.get('/:id', protect, getCandidate);
router.delete('/:id', protect, deleteCandidate);

module.exports = router;

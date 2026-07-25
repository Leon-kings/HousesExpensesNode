const express = require('express');
const router = express.Router();
const {
  getSavings,
  createSavings,
  updateSavings,
  deleteSavings,
} = require('../controllers/savingsController');

router.route('/')
  .get(getSavings)
  .post(createSavings);

router.route('/:id')
  .put(updateSavings)
  .delete(deleteSavings);

module.exports = router;
const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

// Homepage - aggregated feed list
router.get('/', feedController.home);

// Article page
router.get('/article/:id', feedController.article);

// admin add feed (simple form)
router.get('/admin/add', (req, res) => {
  res.send(`<html><body>
  <h1>Add Feed</h1>
  <form method="POST" action="/admin/add">
    <label>id: <input name="id"/></label><br/>
    <label>title: <input name="title"/></label><br/>
    <label>url: <input name="url"/></label><br/>
    <button>Add</button>
  </form>
  </body></html>`);
});
router.post('/admin/add', feedController.addFeed);

module.exports = router;

const express = require('express');
const {
  createApi,
  getApis,
  getApi,
  updateApi,
  deleteApi,
  togglePublishStatus,
} = require('../controllers/apiController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { apiValidator } = require('../validators/apiValidator');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

/**
 * @swagger
 * /apis:
 *   get:
 *     summary: Get all APIs
 *     tags: [APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeUnpublished
 *         schema:
 *           type: boolean
 *         description: Include unpublished APIs (admins only)
 *     responses:
 *       200:
 *         description: List of APIs
 */
router.get('/', getApis);

/**
 * @swagger
 * /apis:
 *   post:
 *     summary: Create a new API
 *     tags: [APIs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - fields
 *               - endpoints
 *               - baseUrl
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *               endpoints:
 *                 type: array
 *                 items:
 *                   type: object
 *               baseUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: API created
 *       400:
 *         description: Validation error
 */
router.post('/', validate(apiValidator), createApi);

/**
 * @swagger
 * /apis/{id}:
 *   get:
 *     summary: Get a single API
 *     tags: [APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API ID
 *     responses:
 *       200:
 *         description: API details
 *       404:
 *         description: API not found
 */
router.get('/:id', getApi);

/**
 * @swagger
 * /apis/{id}:
 *   put:
 *     summary: Update an API
 *     tags: [APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: API updated
 *       404:
 *         description: API not found
 */
router.put('/:id', validate(apiValidator), updateApi);

/**
 * @swagger
 * /apis/{id}:
 *   delete:
 *     summary: Delete an API
 *     tags: [APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API ID
 *     responses:
 *       200:
 *         description: API deleted
 *       404:
 *         description: API not found
 */
router.delete('/:id', deleteApi);

/**
 * @swagger
 * /apis/{id}/publish:
 *   put:
 *     summary: Toggle API publish status
 *     tags: [APIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API ID
 *     responses:
 *       200:
 *         description: API publish status updated
 *       404:
 *         description: API not found
 */
router.put('/:id/publish', togglePublishStatus);

module.exports = router;

const express = require('express');
const { handleRequest } = require('../controllers/dynamicApiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /{apiName}:
 *   get:
 *     summary: Dynamic API endpoint (GET)
 *     tags: [Dynamic]
 *     parameters:
 *       - in: path
 *         name: apiName
 *         required: true
 *         schema:
 *           type: string
 *         description: API name
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: API not found
 */
router.get('/:apiName', handleRequest);
router.get('/:apiName/*', handleRequest);

/**
 * @swagger
 * /{apiName}:
 *   post:
 *     summary: Dynamic API endpoint (POST)
 *     tags: [Dynamic]
 *     parameters:
 *       - in: path
 *         name: apiName
 *         required: true
 *         schema:
 *           type: string
 *         description: API name
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: API not found
 */
router.post('/:apiName', handleRequest);
router.post('/:apiName/*', handleRequest);

/**
 * @swagger
 * /{apiName}:
 *   put:
 *     summary: Dynamic API endpoint (PUT)
 *     tags: [Dynamic]
 *     parameters:
 *       - in: path
 *         name: apiName
 *         required: true
 *         schema:
 *           type: string
 *         description: API name
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: API not found
 */
router.put('/:apiName', handleRequest);
router.put('/:apiName/*', handleRequest);

/**
 * @swagger
 * /{apiName}:
 *   patch:
 *     summary: Dynamic API endpoint (PATCH)
 *     tags: [Dynamic]
 *     parameters:
 *       - in: path
 *         name: apiName
 *         required: true
 *         schema:
 *           type: string
 *         description: API name
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: API not found
 */
router.patch('/:apiName', handleRequest);
router.patch('/:apiName/*', handleRequest);

/**
 * @swagger
 * /{apiName}:
 *   delete:
 *     summary: Dynamic API endpoint (DELETE)
 *     tags: [Dynamic]
 *     parameters:
 *       - in: path
 *         name: apiName
 *         required: true
 *         schema:
 *           type: string
 *         description: API name
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: API not found
 */
router.delete('/:apiName', handleRequest);
router.delete('/:apiName/*', handleRequest);

// Protected routes middleware
router.use(protect);

module.exports = router;

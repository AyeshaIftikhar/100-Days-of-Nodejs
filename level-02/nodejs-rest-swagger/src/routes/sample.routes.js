const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sample.controller');

/**
 * @swagger
 * tags:
 *   name: Samples
 *   description: Sample management
 */

/**
 * @swagger
 * /samples:
 *   get:
 *     summary: Get all samples
 *     tags: [Samples]
 *     responses:
 *       200:
 *         description: List of samples
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sample'
 */
router.get('/samples', sampleController.getAllSamples);

/**
 * @swagger
 * /samples/{id}:
 *   get:
 *     summary: Get a sample by ID
 *     tags: [Samples]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Sample ID
 *     responses:
 *       200:
 *         description: Sample data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sample'
 *       404:
 *         description: Sample not found
 */
router.get('/samples/:id', sampleController.getSampleById);

/**
 * @swagger
 * /samples:
 *   post:
 *     summary: Create a new sample
 *     tags: [Samples]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sample'
 *     responses:
 *       201:
 *         description: Sample created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sample'
 *       400:
 *         description: Bad request
 */
router.post('/samples', sampleController.createSample);

/**
 * @swagger
 * /samples/{id}:
 *   put:
 *     summary: Update a sample
 *     tags: [Samples]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Sample ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sample'
 *     responses:
 *       200:
 *         description: Sample updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sample'
 *       404:
 *         description: Sample not found
 *       400:
 *         description: Bad request
 */
router.put('/samples/:id', sampleController.updateSample);

/**
 * @swagger
 * /samples/{id}:
 *   delete:
 *     summary: Delete a sample
 *     tags: [Samples]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Sample ID
 *     responses:
 *       204:
 *         description: Sample deleted successfully
 *       404:
 *         description: Sample not found
 */
router.delete('/samples/:id', sampleController.deleteSample);

/**
 * @swagger
 * components:
 *   schemas:
 *     Sample:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the sample
 *         name:
 *           type: string
 *           description: The sample name
 *         description:
 *           type: string
 *           description: The sample description
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the sample was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the sample was last updated
 *       example:
 *         id: d5fE_asz
 *         name: Sample 1
 *         description: This is a sample description
 *         createdAt: 2023-01-01T00:00:00Z
 *         updatedAt: 2023-01-01T00:00:00Z
 */

module.exports = router;
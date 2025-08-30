// src/routes/documents.js
const express = require('express');
const router = express.Router();
const client = require('../elastic/client');
const { v4: uuidv4 } = require('uuid');

const INDEX = process.env.ELASTIC_INDEX || 'documents';

/**
 * Ensure index exists (simple mapping for text fields)
 */
async function ensureIndex() {
  const exists = await client.indices.exists({ index: INDEX });
  if (!exists) {
    await client.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            title: { type: 'text' },
            body: { type: 'text' },
            tags: { type: 'keyword' },
            createdAt: { type: 'date' }
          }
        }
      }
    });
  }
}

// call once on startup
ensureIndex().catch(err => {
  console.error('Error ensuring index:', err);
});

/**
 * Create / Index new document
 * POST /documents
 * body: { title, body, tags: [] }
 */
router.post('/', async (req, res) => {
  try {
    const { title, body, tags = [] } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body are required' });

    const id = uuidv4();
    const doc = {
      title,
      body,
      tags,
      createdAt: new Date().toISOString()
    };

    await client.index({
      index: INDEX,
      id,
      body: doc,
      refresh: 'wait_for'
    });

    return res.status(201).json({ id, result: 'created' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Read document by id
 * GET /documents/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = await client.get({ index: INDEX, id });
    return res.json(body._source);
  } catch (err) {
    if (err.meta && err.meta.statusCode === 404) return res.status(404).json({ error: 'not found' });
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Update document
 * PUT /documents/:id
 * body: partial fields to update
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = req.body;
    await client.update({
      index: INDEX,
      id,
      body: { doc },
      refresh: 'wait_for'
    });
    return res.json({ id, result: 'updated' });
  } catch (err) {
    if (err.meta && err.meta.statusCode === 404) return res.status(404).json({ error: 'not found' });
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Delete document
 * DELETE /documents/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await client.delete({ index: INDEX, id, refresh: 'wait_for' });
    return res.json({ id, result: 'deleted' });
  } catch (err) {
    if (err.meta && err.meta.statusCode === 404) return res.status(404).json({ error: 'not found' });
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Search
 * POST /documents/search
 * body: { q: 'search terms', page: 1, size: 10, tags: [] }
 */
router.post('/search', async (req, res) => {
  try {
    const { q = '', page = 1, size = 10, tags = [] } = req.body;
    const from = (page - 1) * size;

    const must = [];
    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['title^3', 'body'],
          fuzziness: 'AUTO'
        }
      });
    }

    const filter = [];
    if (tags && tags.length) {
      filter.push({ terms: { tags } });
    }

    const { body } = await client.search({
      index: INDEX,
      from,
      size,
      body: {
        query: {
          bool: {
            must: must.length ? must : [{ match_all: {} }],
            filter
          }
        }
      }
    });

    const hits = (body.hits.hits || []).map(h => ({ id: h._id, score: h._score, ...h._source }));
    return res.json({ total: body.hits.total?.value || 0, hits });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

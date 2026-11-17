const express = require('express');
const { insightsDb } = require('../database');
const { createLogger } = require('../logger');
const { slugify } = require('../slugify');
const log = createLogger('api/writer');

const router = express.Router();

/**
 * @swagger
 * /api/v1/writer/bulletins:
 *   post:
 *     tags:
 *       - Bulletins
 *     summary: Post new bulletin.
 *     description: Posts a new bulletin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - excerpt
 *               - content
 *               - tags
 *               - model
 *               - sources
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: string
 *               model:
 *                 type: string
 *               sources:
 *                 type: array
 *     responses:
 *       200:
 *         description: Bulletin posted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/bulletins', async (req, res) => {
  try {
    const { title, excerpt, content, tags, model, sources } = req.body;
    if (!title || !excerpt || !content || !tags || !model || !sources) {
      return res.status(400).json({ error: 'Invalid Request' });
    } else if (
      !title.length || !excerpt.length || !content.length
      || !tags.length || !model.length || !sources.length) {
      return res.status(400).json({ error: 'Invalid Request' });
    }

    const srcJSON = JSON.stringify(sources);
    const tzNow = new Date().valueOf();
    const id = slugify(["aidh", model, tzNow].join('_'));
    const slug = slugify(title);

    const bulletin = insightsDb.createBulletin({
      id, title, slug, excerpt, content, model, tags,
      sources: srcJSON,
      trending: 0,
    });

    return res.status(200).json({
      success: true,
      id: bulletin.id,
      slug: bulletin.slug,
    });
  } catch (error) {
    log.error('Error posting bulletin:', { error: error });
    res.status(500).json({ error: 'Failed to post bulletin' });
  }
});

/**
 * @swagger
 * /api/v1/writer/trending:
 *   post:
 *     tags:
 *       - Bulletins
 *     summary: Change trending value by bulletin ID.
 *     description: Sets/Unsets trending flag for a bulletin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - trending
 *             properties:
 *               id:
 *                 type: string
 *               trending:
 *                 type: number
 *     responses:
 *       200:
 *         description: Bulletin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                 trending:
 *                   type: boolean
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/trending', async (req, res) => {
  try {
    const { id, trending } = req.body;
    if (!id || !id.length || ![0, 1].includes(trending)) {
      return res.status(400).json({ error: 'Invalid Request' });
    }

    const bulletin = insightsDb.getBulletinByID(id);
    if (!bulletin) {
      return res.status(400).json({ error: 'Invalid Request' });
    }

    const updated = insightsDb.updateTrending({
      id, trending
    });

    return res.status(200).json({
      success: true,
      id: updated.id,
      trending: updated.trending === 1,
    });
  } catch (error) {
    log.error('Error updating bulletin:', { error: error });
    res.status(500).json({ error: 'Failed to updating bulletin' });
  }
});

module.exports = router;

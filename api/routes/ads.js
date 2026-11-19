const express = require('express');
const { insightsDb } = require('../database');
const { createLogger } = require('../logger');
const log = createLogger('api/ads');

const router = express.Router();

/**
 * @swagger
 * /api/v1/ads:
 *   get:
 *     tags:
 *       - Ads
 *     summary: List all ads
 *     description: Returns all ads from the database with their details.
 *     responses:
 *       200:
 *         description: Ads retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ads:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       cta_text:
 *                         type: string
 *                       cta_url:
 *                         type: string
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const cta_entries = insightsDb.getAllCTAEntries(10, 0);
    const total = insightsDb.getCTAEntriesCount();
    return res.status(200).json({
      ads: cta_entries,
      total: total,
    });
  } catch (error) {
    log.error('Error listing ads:', { error: error });
    res.status(500).json({ error: 'Failed to list ads' });
  }
});

/**
 * @swagger
 * /api/v1/ads/click:
 *   post:
 *     tags:
 *       - Ads
 *     summary: Register click for a cta_entries.
 *     description: Registers a click for a CTA.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ctaID
 *               - userID
 *             properties:
 *               ctaID:
 *                 type: string
 *               userID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Click registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 num_clicks:
 *                   type: number
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/click', async (req, res) => {
  try {
    const { ctaID, userID } = req.body;
    if (!ctaID || !userID) {
      return res.status(400).json({ error: 'Invalid Request' });
    }

    const cta_entry = insightsDb.addClick({
      id: ctaID,
    });

    log.info('CTA click registered successfully', {id: ctaID});

    return res.status(200).json({
      success: true,
      num_clicks: cta_entry.num_clicks,
    });
  } catch (error) {
    log.error('Error registering click:', { error: error });
    res.status(500).json({ error: 'Failed to register click' });
  }
});

module.exports = router;

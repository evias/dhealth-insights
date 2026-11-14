const express = require('express');
const { insightsDb } = require('../database');
const { createLogger } = require('../logger');
const log = createLogger('api/bulletins');

const router = express.Router();

/**
 * @swagger
 * /api/v1/bulletins/list:
 *   get:
 *     tags:
 *       - Bulletins
 *     summary: List all bulletins
 *     description: Returns all bulletins from the database with their details.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *         description: The pagination page number.
 *     responses:
 *       200:
 *         description: Bulletins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page: 
 *                   type: number
 *                 total: 
 *                   type: number
 *                 bulletins:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       excerpt:
 *                         type: string
 *                       content:
 *                         type: string
 *                       upvotes:
 *                         type: number
 *                       downvotes:
 *                         type: number
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/list', async (req, res) => {
  try {
    const { page } = req.query;
    let displayPage = !page ? 1 : page;
    const maxPerPage = 10;
    const offsetPage = (displayPage-1) * maxPerPage;
    const bulletins = insightsDb.getAllBulletins(maxPerPage, offsetPage);

    const cntBulletins = insightsDb.getBulletinsCount();
    return res.status(200).json({
      bulletins: bulletins,
      page: displayPage,
      total: cntBulletins,
    });
  } catch (error) {
    log.error('Error listing bulletins:', { error: error });
    res.status(500).json({ error: 'Failed to list bulletins' });
  }
});

router.post('/vote', async (req, res) => {
  try {
    const { bulletinID, userID, voteValue } = req.body;
    if (!bulletinID || !userID || (voteValue !== 1 && voteValue !== -1)) {
      return res.status(400).json({ error: 'Invalid Request' });
    }

    insightsDb.registerVote({
      bulletinID, userID, voteValue
    });

    return res.status(200);
  } catch (error) {
    log.error('Error registering vote:', { error: error });
    res.status(500).json({ error: 'Failed to register vote' });
  }
});

module.exports = router;

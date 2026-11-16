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
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *         description: The type of sorting to use.
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
 *                 sort:
 *                   type: string
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/list', async (req, res) => {
  try {
    const { page, sort } = req.query;
    let displayPage = !page ? 1 : page;
    const maxPerPage = 10;
    const offsetPage = (displayPage-1) * maxPerPage;
    const sortBy = ['hot', 'new', 'top'].includes(sort) ? sort : 'hot';

    const bulletins = insightsDb.getAllBulletins(sortBy, maxPerPage, offsetPage);
    const cntBulletins = insightsDb.getBulletinsCount();

    return res.status(200).json({
      bulletins: bulletins,
      page: displayPage,
      total: cntBulletins,
      sort: sortBy,
    });
  } catch (error) {
    log.error('Error listing bulletins:', { error: error });
    res.status(500).json({ error: 'Failed to list bulletins' });
  }
});

/**
 * @swagger
 * /api/v1/bulletins/vote:
 *   post:
 *     tags:
 *       - Bulletins
 *     summary: Register upvote/downvote for a bulletin.
 *     description: Registers a vote for a bulletin.
 *     responses:
 *       200:
 *         description: Vote registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 score:
 *                   type: number
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/vote', async (req, res) => {
  try {
    const { bulletinID, userID, voteValue } = req.body;
    if (!bulletinID || !userID || (voteValue !== 1 && voteValue !== -1)) {
      return res.status(400).json({ error: 'Invalid Request' });
    }

    const bulletin = insightsDb.registerVote({
      bulletinID, userID, voteValue
    });

    score = bulletin.upvotes - bulletin.downvotes;
    return res.status(200).json({
      success: true,
      score: score,
    });
  } catch (error) {
    log.error('Error registering vote:', { error: error });
    res.status(500).json({ error: 'Failed to register vote' });
  }
});

module.exports = router;

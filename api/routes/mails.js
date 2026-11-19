const express = require('express');
const { insightsDb } = require('../database');
const { createLogger } = require('../logger');
const log = createLogger('api/ads');

const router = express.Router();

/**
 * @swagger
 * /api/v1/mails/info:
 *   get:
 *     tags:
 *       - Mailer
 *     summary: Retrieve mailer information
 *     description: Retrieves mailer information.
 *     responses:
 *       200:
 *         description: Mailer information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 numSubscribers:
 *                   type: number
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/info', async (req, res) => {
  try {
    const cntSubscribers = insightsDb.getSubscribersCount();

    return res.status(200).json({
      numSubscribers: cntSubscribers,
    });
  }
  catch(error) {
    return res.status(200).json({
      numSubscribers: 0,
    });
  }
});

/**
 * @swagger
 * /api/v1/mails/subscribe:
 *   post:
 *     tags:
 *       - Mailer
 *     summary: Register subscriber
 *     description: Registers a new e-mail subscriber.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscriber registered successfully
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
router.post('/subscribe', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Invalid Request' });
    }

    const subscriber = insightsDb.createSubscriber({
        name,
        email,
    });

    log.info('Subscriber registered successfully', {email});

    return res.status(200).json({
      success: true,
      id: subscriber.id,
    });
  } catch (error) {
    log.error('Error registering subscriber:', { error: error });
    res.status(500).json({ error: 'Failed to register subscriber' });
  }
});

/**
 * @swagger
 * /api/v1/mails/unsubscribe:
 *   post:
 *     tags:
 *       - Mailer
 *     summary: Unsubscribe subscriber
 *     description: Unsubscribes a subscriber.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscriber unsubscribed successfully
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
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Invalid Request' });
    }

    const subscriber = insightsDb.getSubscriberByMail(email);
    if (!subscriber) {
      return res.status(400).json({ error: 'Invalid Request' });
    }

    insightsDb.unsubscribeSubscriber(subscriber.id);

    log.info('Subscriber unsubscribed successfully', {email});

    return res.status(200).json({
      success: true,
      id: subscriber.id,
    });
  } catch (error) {
    log.error('Error registering subscriber:', { error: error });
    res.status(500).json({ error: 'Failed to register subscriber' });
  }
});

module.exports = router;
import express from 'express';
import { SecretKey, encrypt } from "@nillion/blindfold";

const router = express.Router();

/**
 * @swagger
 * /api/blindfold/generatingkeys:
 *   get:
 *     summary: Generate secret keys
 *     description: Generates a new secret key for the cluster and stores it
 *     tags:
 *       - Keys
 *     responses:
 *       200:
 *         description: Secret key generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secretKey:
 *                   type: object
 *                   description: The generated secret key object
 *                   example: 
 *                     id: "key_123456"
 *                     value: "sk_abcdef123456"
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: Server error occurred during key generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to generate secret key"
 */
router.get('/generatingkeys', async (req, res) => {
  try {
    const cluster = {"nodes": [{}]};
    const secretKey = await SecretKey.generate(cluster, {"store": true});

    res.json({ secretKey });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/blindfold/encrypttext:
 *   get:
 *     summary: Encrypt text
 *     description: Generates a secret key and encrypts a predefined plaintext ("abc")
 *     tags:
 *       - Encryption
 *     responses:
 *       200:
 *         description: Text encrypted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secretKey:
 *                   type: object
 *                   description: The generated secret key object
 *                   example:
 *                     id: "key_123456"
 *                     value: "sk_abcdef123456"
 *                 ciphertext:
 *                   type: string
 *                   description: The encrypted text
 *                   example: "encrypted_data_xyz789"
 *       500:
 *         description: Server error occurred during encryption
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to encrypt text"
 */
router.get('/encrypttext', async (req, res) => {
  try {
    const cluster = {"nodes": [{}]};
    const secretKey = await SecretKey.generate(cluster, {"store": true});

    const plaintext = "abc";
    const ciphertext = await encrypt(secretKey, plaintext);
    res.json({ secretKey, ciphertext });
   } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/blindfold/decrypttext:
 *   post:
 *     summary: Decrypt text
 *     description: Decrypts ciphertext using the provided secret key
 *     tags:
 *       - Encryption
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - secretKey
 *               - ciphertext
 *             properties:
 *               secretKey:
 *                 type: object
 *                 description: The secret key object used for decryption
 *                 example:
 *                   id: "key_123456"
 *                   value: "sk_abcdef123456"
 *               ciphertext:
 *                 type: string
 *                 description: The encrypted text to decrypt
 *                 example: "encrypted_data_xyz789"
 *     responses:
 *       200:
 *         description: Text decrypted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 decrypted:
 *                   type: string
 *                   description: The decrypted plaintext
 *                   example: "abc"
 *       500:
 *         description: Server error occurred during decryption
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to decrypt text"
 */
router.post('/decrypttext', async (req, res) => {
  const secretKey = req.body.secretKey;
  const ciphertext = req.body.ciphertext;

  try {
    const decrypted = await blindfold.decrypt(secretKey, ciphertext);
    res.json({ decrypted });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
  }
});


export default router;
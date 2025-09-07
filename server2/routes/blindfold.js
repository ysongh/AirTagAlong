import express from 'express';
import { SecretKey, encrypt } from "@nillion/blindfold";

const router = express.Router();

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

router.get('/ciphertext', async (req, res) => {
  try {
    const cluster = {"nodes": [{}]};
    const secretKey = await SecretKey.generate(cluster, {"store": true});

    const plaintext = "abc";
    const ciphertext = await encrypt(secretKey, plaintext);
    res.json({ ciphertext });
   } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
  }
});


export default router;
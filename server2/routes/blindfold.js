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
import express from 'express';
import { SecretKey } from "@nillion/blindfold";

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

export default router;
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import https from 'https'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  try {
    const imageUrl = `https://177.234.196.99:8089/images/${url}`
    console.log('Fetching image from:', imageUrl);
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
    })

    const contentType = response.headers['content-type']
    res.setHeader('Content-Type', contentType)
    res.send(response.data)
  } catch (error) {
    console.error('Error fetching image:', error)
    res.status(500).json({ error: 'Error fetching image' })
  }
}
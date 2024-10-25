// pages/api/images/[...path].ts
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: imagePath } = req.query

  // Asegúrate de que imagePath es un array
  if (!Array.isArray(imagePath)) {
    return res.status(400).json({ error: 'Invalid image path' })
  }

  // Construye la ruta completa al archivo
  const filePath = path.join(process.cwd(), '//DESKTOP-J66J7CT/graficos', ...imagePath)

  // Verifica si el archivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image not found' })
  }

  // Lee el archivo y envíalo como respuesta
  const imageBuffer = fs.readFileSync(filePath)
  res.setHeader('Content-Type', 'image/jpeg') // Ajusta según el tipo de imagen
  res.send(imageBuffer)
}
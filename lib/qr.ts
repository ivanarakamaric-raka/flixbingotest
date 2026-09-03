import QRCode from 'qrcode'

export async function generatePlayerQR(playerId: string): Promise<string> {
  // Returns a data URL (base64 PNG) encoding just the player ID
  return QRCode.toDataURL(playerId, { width: 256, margin: 2 })
}

export function parseQRValue(value: string): string {
  // QR encodes a raw player UUID — just return it
  return value.trim()
}

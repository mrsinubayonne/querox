
import React, { useEffect, useState, useRef } from 'react';
import * as QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  title: string;
  size?: number;
  logo?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ url, title, size = 200, logo }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [url, size, logo]);

  const generateQRCode = async () => {
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        // Générer le QR code de base
        await QRCode.toCanvas(canvas, url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M' // Niveau de correction d'erreur moyen pour permettre l'ajout du logo
        });

        // Si un logo est fourni, l'ajouter au centre du QR code
        if (logo) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            logoImg.onload = () => {
              // Calculer la taille du logo (environ 15% de la taille du QR code)
              const logoSize = size * 0.15;
              const x = (size - logoSize) / 2;
              const y = (size - logoSize) / 2;

              // Dessiner un fond blanc circulaire pour le logo
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
              ctx.fill();

              // Dessiner le logo
              ctx.drawImage(logoImg, x, y, logoSize, logoSize);

              // Mettre à jour la data URL
              setQrCodeDataUrl(canvas.toDataURL());
            };
            logoImg.src = logo;
          }
        } else {
          // Sans logo, utiliser directement la data URL du canvas
          setQrCodeDataUrl(canvas.toDataURL());
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `qr-code-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = qrCodeDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Scannez ce code pour accéder au {title.toLowerCase()}
        </p>
        <Button
          onClick={downloadQRCode}
          variant="outline"
          size="sm"
          className="bg-white/50 hover:bg-white/80"
        >
          <Download size={14} className="mr-2" />
          Télécharger PNG
        </Button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;

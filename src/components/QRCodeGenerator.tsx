
import React, { useEffect, useState, useRef } from 'react';
import * as QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  title: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ url, title, size = 200 }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [url, size]);

  const generateQRCode = async () => {
    try {
      console.log('Generating QR code for URL:', url);
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Également créer une data URL pour le téléchargement
        const dataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(dataUrl);
        console.log('QR code generated successfully');
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

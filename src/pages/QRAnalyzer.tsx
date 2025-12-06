import { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link as LinkIcon, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface AnalysisResult {
  originalUrl: string;
  finalUrl: string;
  redirectChain: string[];
  pageType: string;
  safetyStatus: 'safe' | 'suspicious' | 'dangerous';
  safetyReasons: string[];
  pageTitle?: string;
  description?: string;
  warnings: string[];
}

const QRAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const decodeQRCode = (imageData: ImageData): string | null => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code ? code.data : null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageSrc = e.target?.result as string;
      setQrImage(imageSrc);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const decodedUrl = decodeQRCode(imageData);
          
          if (decodedUrl) {
            setUrl(decodedUrl);
            toast({
              title: 'QR Code Decoded',
              description: 'URL extracted successfully. Click "Analyze Link" to continue.',
            });
          } else {
            toast({
              title: 'Decoding Failed',
              description: 'Could not find a QR code in this image.',
              variant: 'destructive',
            });
          }
        }
      };
      img.src = imageSrc;
    };
    reader.readAsDataURL(file);
  };

  const analyzeLink = async () => {
    if (!url) {
      toast({
        title: 'URL Required',
        description: 'Please enter a URL or upload a QR code.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-link', {
        body: { url }
      });

      if (error) throw error;

      setResult(data as AnalysisResult);
      toast({
        title: 'Analysis Complete',
        description: 'Link has been analyzed successfully.',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze the link.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSafetyIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'suspicious':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'dangerous':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getSafetyColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-500/10 border-green-500/20';
      case 'suspicious':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'dangerous':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">QR Code & Link Analyzer</h1>
            <p className="text-muted-foreground text-lg">
              Upload a QR code or paste a link to analyze where it leads and check its safety
            </p>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload QR Code
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={analyzeLink} disabled={isAnalyzing}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Link'}
                </Button>
              </div>

              {qrImage && (
                <div className="flex justify-center">
                  <img src={qrImage} alt="Uploaded QR Code" className="max-w-xs rounded-lg border" />
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-6 pt-6 border-t">
                <div className={`p-6 rounded-lg border ${getSafetyColor(result.safetyStatus)}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {getSafetyIcon(result.safetyStatus)}
                    <div>
                      <h3 className="text-xl font-semibold capitalize">{result.safetyStatus}</h3>
                      <p className="text-sm text-muted-foreground">
                        Page Type: {result.pageType.replace('-', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {result.pageTitle && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Page Title</h4>
                      <p className="text-sm">{result.pageTitle}</p>
                    </div>
                  )}

                  {result.description && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{result.description}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Destination</h4>
                      <div className="bg-background/50 p-3 rounded space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Original:</span>
                          <a 
                            href={result.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-mono truncate hover:underline flex items-center gap-1"
                          >
                            {result.originalUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        {result.originalUrl !== result.finalUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Final:</span>
                            <a 
                              href={result.finalUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs font-mono truncate hover:underline flex items-center gap-1"
                            >
                              {result.finalUrl}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {result.redirectChain.length > 1 && (
                      <div>
                        <h4 className="font-semibold mb-2">Redirect Chain ({result.redirectChain.length} hops)</h4>
                        <div className="bg-background/50 p-3 rounded space-y-1">
                          {result.redirectChain.map((url, index) => (
                            <div key={index} className="text-xs font-mono truncate">
                              {index + 1}. {url}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.safetyReasons.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Safety Assessment</h4>
                        <ul className="space-y-1">
                          {result.safetyReasons.map((reason, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Warnings:</strong>
                          <ul className="mt-2 space-y-1">
                            {result.warnings.map((warning, index) => (
                              <li key={index} className="text-sm">• {warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default QRAnalyzer;

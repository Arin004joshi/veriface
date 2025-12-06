import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileImage, FileVideo, FileAudio, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CyberAuthorityReport } from "@/components/CyberAuthorityReport";

type AnalysisResult = {
  score: number;
  status: "authentic" | "suspicious" | "deepfake";
  anomalies: string[];
  confidence: number;
};

export default function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a file to analyze",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Determine media type
      const mediaType = file.type.startsWith('image/') ? 'image' 
        : file.type.startsWith('video/') ? 'video' 
        : file.type.startsWith('audio/') ? 'audio' 
        : 'unknown';

      console.log(`Analyzing ${mediaType} file:`, file.name);

      // Call the real backend analysis
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            mediaData: fileData,
            mediaType: mediaType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisResult: AnalysisResult = await response.json();
      
      setResult(analysisResult);
      
      toast({
        title: "Analysis Complete",
        description: `Reality Score: ${analysisResult.score.toFixed(1)}% - ${analysisResult.status}`,
        variant: analysisResult.status === "deepfake" ? "destructive" : "default",
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze media. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FileImage className="w-12 h-12 text-muted-foreground" />;
    
    if (file.type.startsWith("image/")) return <FileImage className="w-12 h-12 text-primary" />;
    if (file.type.startsWith("video/")) return <FileVideo className="w-12 h-12 text-primary" />;
    if (file.type.startsWith("audio/")) return <FileAudio className="w-12 h-12 text-primary" />;
    
    return <FileImage className="w-12 h-12 text-primary" />;
  };

  const getStatusIcon = () => {
    if (!result) return null;
    
    if (result.status === "authentic") return <CheckCircle className="w-8 h-8 text-success" />;
    if (result.status === "suspicious") return <AlertTriangle className="w-8 h-8 text-warning" />;
    return <XCircle className="w-8 h-8 text-destructive" />;
  };

  const getStatusColor = () => {
    if (!result) return "text-muted-foreground";
    if (result.status === "authentic") return "text-success";
    if (result.status === "suspicious") return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Media Analysis</h1>
            <p className="text-muted-foreground">Upload images, videos, or audio files for deepfake detection</p>
          </div>

          {/* Upload Card */}
          <Card className="p-8 mb-8 bg-card border-border">
            <div className="text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*,video/*,audio/*"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/20"
              >
                {getFileIcon()}
                <p className="mt-4 text-lg font-medium text-foreground">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Support for images, videos, and audio files
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {analyzing ? "Analyzing..." : "Start Analysis"}
                </Button>
              </div>
            )}
          </Card>

          {/* Analysis Progress */}
          {analyzing && (
            <Card className="p-8 mb-8 bg-card border-border">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Analyzing Media...</h3>
                <Progress value={66} className="h-2" />
                <p className="text-sm text-muted-foreground">Running AI detection models and anomaly analysis</p>
              </div>
            </Card>
          )}

          {/* Results */}
          {result && !analyzing && (
            <Card className="p-8 bg-card border-border">
              <div className="space-y-6">
                {/* Reality Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {getStatusIcon()}
                    <h2 className="text-3xl font-bold text-foreground">Reality Score</h2>
                  </div>
                  <div className="text-6xl font-bold mb-2">
                    <span className={getStatusColor()}>{result.score.toFixed(1)}%</span>
                  </div>
                  <p className="text-lg capitalize text-muted-foreground">
                    Status: <span className={getStatusColor()}>{result.status}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Confidence: {result.confidence.toFixed(1)}%
                  </p>
                </div>

                {/* Visual Score Bar */}
                <div className="space-y-2">
                  <Progress value={result.score} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Deepfake</span>
                    <span>Suspicious</span>
                    <span>Authentic</span>
                  </div>
                </div>

                {/* Anomalies */}
                {result.anomalies.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Detected Anomalies</h3>
                    <div className="space-y-3">
                      {result.anomalies.map((anomaly, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground">{anomaly}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cyber Authority Report - Only show for deepfakes */}
                {result.status === "deepfake" && (
                  <div className="mt-8">
                    <CyberAuthorityReport 
                      reportData={{
                        mediaHash: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                        realityScore: result.score,
                        confidence: result.confidence,
                        status: result.status,
                        anomalies: result.anomalies,
                        blockchainTimestamp: new Date().toISOString(),
                        webCrawlingFindings: [
                          "Found on suspicious website: deepfake-gallery.example.com",
                          "Detected on social media platform with altered metadata",
                          "Appears in 5+ locations with different timestamps"
                        ]
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-6">
                  <Button variant="outline" className="flex-1">
                    View Detailed Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Start Web Crawl
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

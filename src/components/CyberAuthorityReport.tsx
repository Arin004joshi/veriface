import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, FileText, Shield, CheckCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ReportData = {
  mediaHash: string;
  realityScore: number;
  confidence: number;
  status: string;
  anomalies: string[];
  blockchainTimestamp: string;
  webCrawlingFindings: string[];
};

type CyberAuthorityReportProps = {
  reportData: ReportData;
};

export const CyberAuthorityReport = ({ reportData }: CyberAuthorityReportProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [caseId] = useState(() => Math.random().toString(36).substr(2, 6).toUpperCase());
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report-pdf', {
        body: {
          caseId,
          ...reportData,
        },
      });

      if (error) throw error;

      // Convert response to blob and download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VeriFace_Report_${caseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Downloaded",
        description: "Cybercrime report has been generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReportSubmit = async () => {
    await handleDownloadPDF();
    setShowForm(false);
    setShowConfirmation(true);
  };

  return (
    <>
      {/* Alert Card */}
      <Alert className="border-destructive/50 bg-destructive/10 mb-6">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <AlertTitle className="text-destructive">Deepfake Detected - Action Required</AlertTitle>
        <AlertDescription className="text-foreground">
          Our AI system has detected significant manipulation in this media. You can report this to cyber authorities for further investigation.
        </AlertDescription>
      </Alert>

      {/* Report Button */}
      <Button 
        onClick={() => setShowForm(true)} 
        className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      >
        <Shield className="mr-2 h-5 w-5" />
        Report to Cyber Crime Authority
      </Button>

      {/* Report Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-2xl">Cyber Crime Report Submission</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              The following information will be submitted to cyber authorities for investigation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Media Hash */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Media Hash (SHA-256)</label>
              <div className="p-3 bg-secondary/30 border border-border rounded-md">
                <code className="text-xs text-muted-foreground break-all">{reportData.mediaHash}</code>
              </div>
            </div>

            {/* Detection Results */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Detection Results</label>
              <Card className="p-4 bg-secondary/20 border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Reality Score</p>
                    <p className="text-lg font-bold text-destructive">{reportData.realityScore.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-lg font-bold text-foreground">{reportData.confidence.toFixed(1)}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-lg font-bold text-destructive capitalize">{reportData.status}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Anomalies */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Detected Anomalies</label>
              <div className="space-y-2">
                {reportData.anomalies.map((anomaly, index) => (
                  <div key={index} className="p-3 bg-secondary/30 border border-border rounded-md flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{anomaly}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Timestamp */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Blockchain Timestamp</label>
              <div className="p-3 bg-secondary/30 border border-border rounded-md">
                <p className="text-sm text-muted-foreground">{reportData.blockchainTimestamp}</p>
              </div>
            </div>

            {/* Web Crawling Findings */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Reverse Web Crawling Findings</label>
              <div className="space-y-2">
                {reportData.webCrawlingFindings.map((finding, index) => (
                  <div key={index} className="p-3 bg-secondary/30 border border-border rounded-md">
                    <p className="text-sm text-foreground">{finding}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Preview */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Report Preview</label>
              <Card className="p-6 bg-secondary/20 border-border">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Cyber Crime Report</p>
                    <p className="text-xs text-muted-foreground">Generated: {new Date().toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-32 bg-secondary/50 rounded-md border border-border flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">PDF Report Preview</p>
                </div>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              variant="outline"
              disabled={isGenerating}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button 
              onClick={handleReportSubmit} 
              className="bg-primary hover:bg-primary/90"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-card border-border">
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <DialogTitle className="text-2xl mb-2 text-foreground">Report Submitted Successfully</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-4">
              Your report has been sent to the cyber crime authority.
            </DialogDescription>
            <Card className="p-4 bg-primary/10 border-primary/30 mb-4">
              <p className="text-sm text-muted-foreground mb-1">Case ID</p>
              <p className="text-2xl font-bold text-primary">{caseId}</p>
            </Card>
            <p className="text-sm text-muted-foreground mb-6">
              Please keep this Case ID for future reference. You will receive updates via email.
            </p>
            <Button onClick={() => setShowConfirmation(false)} className="bg-primary hover:bg-primary/90">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import jsPDF from "https://esm.sh/jspdf@2.5.2?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportData {
  caseId: string;
  mediaHash: string;
  realityScore: number;
  confidence: number;
  status: string;
  anomalies: string[];
  blockchainTimestamp: string;
  webCrawlingFindings: string[];
  filename?: string;
  fileType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reportData: ReportData = await req.json();
    console.log('Generating PDF report for case:', reportData.caseId);

    // Create PDF document
    const doc = new (jsPDF as any)({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Header - VeriFace
    doc.setFontSize(28);
    doc.setTextColor(220, 38, 38); // red
    doc.text('VeriFace', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Title
    doc.setFontSize(16);
    doc.setTextColor(26, 26, 26); // dark
    doc.text('CYBER CRIME DEEPFAKE DETECTION REPORT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102); // gray
    doc.text('Official Investigation Document', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Divider line
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Case Information Section
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('CASE INFORMATION', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text(`Case ID: `, margin, yPos);
    doc.setTextColor(220, 38, 38);
    doc.text(reportData.caseId, margin + 20, yPos);
    yPos += 6;

    doc.setTextColor(51, 51, 51);
    doc.text(`Report Generated: ${new Date().toLocaleString('en-US')}`, margin, yPos);
    yPos += 6;
    doc.text(`Blockchain Timestamp: ${reportData.blockchainTimestamp}`, margin, yPos);
    yPos += 10;

    // Media Information Section
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('MEDIA INFORMATION', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    if (reportData.filename) {
      doc.text(`Filename: ${reportData.filename}`, margin, yPos);
      yPos += 6;
    }
    if (reportData.fileType) {
      doc.text(`File Type: ${reportData.fileType.toUpperCase()}`, margin, yPos);
      yPos += 6;
    }
    
    doc.text('Media Hash (SHA-256):', margin, yPos);
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    const hashLines = doc.splitTextToSize(reportData.mediaHash, contentWidth);
    doc.text(hashLines, margin, yPos);
    yPos += hashLines.length * 4 + 10;

    // Detection Results Section
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('DETECTION RESULTS', margin, yPos);
    yPos += 7;

    // Results box
    doc.setFillColor(254, 226, 226); // light red
    doc.setDrawColor(220, 38, 38); // red border
    doc.rect(margin, yPos, contentWidth, 30, 'FD');
    yPos += 8;

    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text(`Reality Score: `, margin + 5, yPos);
    doc.setFontSize(16);
    doc.setTextColor(220, 38, 38);
    doc.text(`${reportData.realityScore.toFixed(1)}%`, margin + 40, yPos);
    yPos += 7;

    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text(`Confidence Level: ${reportData.confidence.toFixed(1)}%`, margin + 5, yPos);
    yPos += 7;

    doc.text(`Status: `, margin + 5, yPos);
    doc.setTextColor(220, 38, 38);
    doc.text(reportData.status.toUpperCase(), margin + 22, yPos);
    yPos += 15;

    // Anomalies Section
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('DETECTED ANOMALIES', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    reportData.anomalies.forEach((anomaly, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${anomaly}`, contentWidth - 10);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 5 + 2;
      
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    yPos += 5;

    // Web Crawling Findings Section
    if (reportData.webCrawlingFindings && reportData.webCrawlingFindings.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      doc.text('REVERSE WEB CRAWLING FINDINGS', margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      reportData.webCrawlingFindings.forEach((finding, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${finding}`, contentWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 2;
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
      yPos += 5;
    }

    // Recommendation Section
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('RECOMMENDATION', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    const recommendationText = 'Based on the AI-powered analysis, this media exhibits significant indicators of digital manipulation and deepfake technology. We recommend immediate investigation by cyber crime authorities and digital forensics teams. This report can be used as preliminary evidence in legal proceedings.';
    const recommendationLines = doc.splitTextToSize(recommendationText, contentWidth);
    doc.text(recommendationLines, margin, yPos);
    yPos += recommendationLines.length * 5 + 15;

    // Footer
    if (yPos > 260) {
      doc.addPage();
      yPos = 250;
    } else {
      yPos = 270;
    }

    doc.setFontSize(8);
    doc.setTextColor(153, 153, 153);
    doc.text('─'.repeat(80), pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text('This report is generated by VeriFace AI Deepfake Detection System', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text('For official use by authorized cyber crime investigation units only', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text(`Document ID: ${reportData.caseId} | Generated: ${new Date().toISOString()}`, pageWidth / 2, yPos, { align: 'center' });

    // Generate PDF as array buffer
    const pdfArrayBuffer = doc.output('arraybuffer');

    return new Response(pdfArrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="VeriFace_Report_${reportData.caseId}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
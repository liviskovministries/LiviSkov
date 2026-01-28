// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    console.log("[watermark-pdf] OPTIONS request received.");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[watermark-pdf] POST request received.");
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("[watermark-pdf] Request body parsed successfully.", { body: requestBody });
    } catch (jsonError: any) {
      console.error("[watermark-pdf] Error parsing request JSON:", { error: jsonError.message, stack: jsonError.stack });
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { pdfUrl, firstName, lastName, email } = requestBody;

    if (!pdfUrl || !firstName || !lastName || !email) {
      console.error("[watermark-pdf] Missing required parameters", { pdfUrl, firstName, lastName, email });
      return new Response(JSON.stringify({ error: 'Missing required parameters: pdfUrl, firstName, lastName, email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[watermark-pdf] Parameters received:", { pdfUrl, firstName, lastName, email });
    console.log("[watermark-pdf] Fetching PDF from:", pdfUrl);
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    console.log("[watermark-pdf] PDF fetched successfully. Loading PDF document.");
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    console.log("[watermark-pdf] PDF document loaded. Embedding font.");

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const watermarkText = `${firstName} ${lastName} - ${email}`;
    const fontSize = 10;
    const textColor = rgb(0.5, 0.5, 0.5);
    console.log("[watermark-pdf] Font embedded. Applying watermark to pages.");

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      
      // Posicionar no canto inferior direito, com um pouco de preenchimento
      const x = width - textWidth - 20;
      const y = 20;

      page.drawText(watermarkText, {
        x,
        y,
        font,
        size: fontSize,
        color: textColor,
        opacity: 0.5,
      });
    }
    console.log("[watermark-pdf] Watermark applied to all pages. Saving PDF.");

    const pdfBytes = await pdfDoc.save();

    console.log("[watermark-pdf] PDF watermarked successfully. Sending response.");
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Livi-Skov-Estacoes-Espirituais-Watermarked.pdf"',
      },
    });

  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    let errorStack = undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }

    console.error("[watermark-pdf] Error processing PDF:", { error: errorMessage, stack: errorStack });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
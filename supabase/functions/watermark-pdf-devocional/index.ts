// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Declaração de tipo para Deno.env para resolver erros de compilação
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    console.log("[watermark-pdf-devocional] OPTIONS request received.");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[watermark-pdf-devocional] POST request received.");
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("[watermark-pdf-devocional] Request body parsed successfully.", { body: requestBody });
    } catch (jsonError: any) {
      console.error("[watermark-pdf-devocional] Error parsing request JSON:", { error: jsonError.message, stack: jsonError.stack });
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { firstName, lastName, email, outputFileName } = requestBody;

    if (!firstName || !lastName || !email || !outputFileName) {
      console.error("[watermark-pdf-devocional] Missing required parameters", { firstName, lastName, email, outputFileName });
      return new Response(JSON.stringify({ error: 'Missing required parameters: firstName, lastName, email, outputFileName' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[watermark-pdf-devocional] Parameters received:", { firstName, lastName, email, outputFileName });

    // Configurações específicas para o Devocional 2026
    const bucketName = 'Devocional 2026';
    const filePath = 'Devocional-2026-Livi-Skov.pdf'; // CORRIGIDO: Nome do arquivo atualizado
    
    console.log(`[watermark-pdf-devocional] Using bucket: '${bucketName}', filePath: '${filePath}'`);

    // Generate a new signed URL for the private PDF using the service role key
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .createSignedUrl(filePath, 60); // URL valid for 60 seconds

    if (signedUrlError) {
      console.error("[watermark-pdf-devocional] Error generating signed URL:", signedUrlError.message);
      return new Response(JSON.stringify({ error: `Failed to generate signed URL: ${signedUrlError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pdfUrl = signedUrlData.signedUrl;
    console.log("[watermark-pdf-devocional] Signed URL generated:", pdfUrl);
    console.log("[watermark-pdf-devocional] Attempting to fetch PDF from generated signed URL.");
    
    const response = await fetch(pdfUrl);
    console.log("[watermark-pdf-devocional] PDF fetch response status:", response.status, response.statusText);
    
    if (!response.ok) {
      console.error("[watermark-pdf-devocional] Failed to fetch PDF:", response.status, response.statusText);
      return new Response(JSON.stringify({ error: `Failed to fetch PDF: ${response.status} ${response.statusText}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = response.headers.get('content-type');
    console.log("[watermark-pdf-devocional] Content-Type header:", contentType);
    if (!contentType || !contentType.includes('pdf')) {
      console.error("[watermark-pdf-devocional] Invalid content type:", contentType);
      return new Response(JSON.stringify({ error: 'The requested file is not a valid PDF.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const existingPdfBytes = await response.arrayBuffer();
    
    if (existingPdfBytes.byteLength < 4) {
      console.error("[watermark-pdf-devocional] PDF file too small or empty");
      return new Response(JSON.stringify({ error: 'Invalid PDF file: file is too small or empty.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const header = new Uint8Array(existingPdfBytes.slice(0, 4));
    const headerStr = String.fromCharCode(...header);
    if (!headerStr.startsWith('%PDF')) {
      console.error("[watermark-pdf-devocional] Invalid PDF header:", headerStr);
      return new Response(JSON.stringify({ error: 'Invalid PDF file: no PDF header found.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[watermark-pdf-devocional] PDF fetched successfully. Loading PDF document.");
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    console.log("[watermark-pdf-devocional] PDF document loaded. Embedding font.");

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const watermarkText = `© Livi Skov - Acesso exclusivo liberado para ${firstName} ${lastName} (${email}) - Proibida reprodução`;
    const fontSize = 8;
    const textColor = rgb(0.5, 0.5, 0.5);
    console.log("[watermark-pdf-devocional] Font embedded. Applying watermark to pages.");

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      const textWidth = watermarkText.length * fontSize * 0.6;
      const yPosition = (height / 2) + (textWidth / 2);
      
      console.log("[watermark-pdf-devocional] Page dimensions:", { width, height, textWidth, yPosition });
      
      page.drawText(watermarkText, {
        x: 15,
        y: yPosition,
        font,
        size: fontSize,
        color: textColor,
        opacity: 0.6,
        rotate: { type: 'degrees', angle: -90 },
      });
    }
    console.log("[watermark-pdf-devocional] Watermark applied to all pages. Saving PDF.");

    const pdfBytes = await pdfDoc.save();

    console.log("[watermark-pdf-devocional] PDF watermarked successfully. Sending response.");
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
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

    console.error("[watermark-pdf-devocional] Error processing PDF:", { error: errorMessage, stack: errorStack });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
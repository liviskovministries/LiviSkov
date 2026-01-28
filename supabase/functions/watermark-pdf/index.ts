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
    
    // Verificar se o conteúdo é realmente um PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      console.error("[watermark-pdf] Failed to fetch PDF:", response.status, response.statusText);
      return new Response(JSON.stringify({ error: `Failed to fetch PDF: ${response.status} ${response.statusText}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar o tipo de conteúdo
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('pdf')) {
      console.error("[watermark-pdf] Invalid content type:", contentType);
      return new Response(JSON.stringify({ error: 'The requested file is not a valid PDF' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const existingPdfBytes = await response.arrayBuffer();
    
    // Verificar se há dados suficientes para ser um PDF
    if (existingPdfBytes.byteLength < 4) {
      console.error("[watermark-pdf] PDF file too small or empty");
      return new Response(JSON.stringify({ error: 'Invalid PDF file: file is too small or empty' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar cabeçalho PDF (primeiros bytes devem ser '%PDF')
    const header = new Uint8Array(existingPdfBytes.slice(0, 4));
    const headerStr = String.fromCharCode(...header);
    if (!headerStr.startsWith('%PDF')) {
      console.error("[watermark-pdf] Invalid PDF header:", headerStr);
      return new Response(JSON.stringify({ error: 'Invalid PDF file: no PDF header found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[watermark-pdf] PDF fetched successfully. Loading PDF document.");
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    console.log("[watermark-pdf] PDF document loaded. Embedding font.");

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const watermarkText = `© Livi Skov - Acesso exclusivo liberado para ${firstName} ${lastName} (${email}) - Proibida reprodução`;
    const fontSize = 8;
    const textColor = rgb(0.5, 0.5, 0.5);
    console.log("[watermark-pdf] Font embedded. Applying watermark to pages.");

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Calcular a largura aproximada do texto rotacionado
      const textWidth = watermarkText.length * fontSize * 0.6; // Aproximação da largura do texto
      
      // Posicionar no centro vertical da página considerando o comprimento do texto
      const yPosition = (height / 2) + (textWidth / 2); // Centralizar considerando o comprimento
      
      console.log("[watermark-pdf] Page dimensions:", { width, height, textWidth, yPosition });
      
      // Desenhar a marca d'água rotacionada 90 graus na lateral esquerda
      page.drawText(watermarkText, {
        x: 15, // Posição X muito próxima da borda esquerda
        y: yPosition, // Posição Y centralizada verticalmente
        font,
        size: fontSize,
        color: textColor,
        opacity: 0.6,
        rotate: { type: 'degrees', angle: -90 }, // Rotacionar -90 graus para ficar paralelo à lombada
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
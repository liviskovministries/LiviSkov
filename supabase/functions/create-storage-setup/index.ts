// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Declaração de tipo para Deno.env para resolver erros de compilação
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

interface Bucket {
  name: string;
  id: string;
  public: boolean;
  file_size_limit?: number;
  allowed_mime_types?: string[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[create-storage-setup] Starting storage setup verification");

    // Verificar buckets existentes
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Error listing buckets: ${bucketsError.message}`);
    }

    const bucketNames = buckets.map((bucket: Bucket) => bucket.name);
    console.log("[create-storage-setup] Existing buckets:", bucketNames);

    // Verificar se nosso buckets existem
    const neededBuckets = ['Estacoes Espirituais', 'Devocional 2026'];
    const missingBuckets = neededBuckets.filter(name => !bucketNames.includes(name));

    if (missingBuckets.length > 0) {
      console.log("[create-storage-setup] Missing buckets:", missingBuckets);
      
      // TENTATIVA DE CRIAR BUCKETS (pode falhar sem permissão)
      for (const bucketName of missingBuckets) {
        try {
          const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: false
          });
          
          if (createError) {
            console.error(`[create-storage-setup] Error creating bucket ${bucketName}:`, createError.message);
          } else {
            console.log(`[create-storage-setup] Bucket ${bucketName} created successfully`);
          }
        } catch (error) {
          console.error(`[create-storage-setup] Failed to create bucket ${bucketName}:`, error);
        }
      }
    }

    return new Response(JSON.stringify({ 
      existingBuckets: bucketNames,
      missingBuckets: missingBuckets
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("[create-storage-setup] Setup verification failed:", error);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
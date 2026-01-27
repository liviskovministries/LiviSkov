import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SocialSidebar } from '@/components/social-sidebar';


export const metadata: Metadata = {
  title: 'Livi Skov - Estações Espirituais',
  description: 'Descubra as estações da sua jornada com Deus',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="!scroll-smooth">
      <head>
      </head>
      <body className="antialiased">
        <FirebaseClientProvider>
          <SocialSidebar />
          {children}
          <Toaster />
        </FirebaseClientProvider>
        <Script id="crisp-widget" strategy="afterInteractive">
          {`
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="9a3405de-6717-421b-bc90-28591942cb49";
            (function(){
              var d=document;
              var s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}

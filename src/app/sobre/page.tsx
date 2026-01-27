import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';

export default function SobrePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold text-primary">Sobre mim</h1>
          <p className="mt-4 text-lg text-muted-foreground">Página em construção.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

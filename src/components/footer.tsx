import Link from 'next/link';
import Image from 'next/image'; // Importar o componente Image

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-secondary py-12">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logoverde2.fw.png" // Caminho para a nova logo
                alt="Livi Skov Logo"
                width={120} // Ajuste a largura conforme necessário
                height={40} // Ajuste a altura conforme necessário
                className="h-8 w-auto" // Mantém a proporção, define a altura
              />
            </Link>
          </div>
          <div>
            <h4 className="font-semibold text-primary">Navegação</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/#inicio" className="text-muted-foreground hover:text-primary">Início</Link></li>
              <li><Link href="/#sobre" className="text-muted-foreground hover:text-primary">Sobre mim</Link></li>
              <li><Link href="/#agenda" className="text-muted-foreground hover:text-primary">Agenda</Link></li>
              <li><Link href="/#fale-conosco" className="text-muted-foreground hover:text-primary">Fale Conosco</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/termos-de-uso" className="text-muted-foreground hover:text-primary">Termos de Uso</Link></li>
              <li><Link href="/politica-de-privacidade" className="text-muted-foreground hover:text-primary">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Livi Skov. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
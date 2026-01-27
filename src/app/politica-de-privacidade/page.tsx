import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-4xl space-y-6">
          <h1 className="text-4xl font-bold text-primary">Política de Privacidade</h1>
          <p className="text-muted-foreground">Sua privacidade é importante para nós.</p>

          <div className="space-y-4 text-foreground/80">
            <h2 className="text-2xl font-semibold text-primary mt-6">1. Informações que Coletamos</h2>
            <p>Coletamos informações que você nos fornece diretamente ao se cadastrar, como nome, sobrenome, e-mail e telefone. Se você se conectar usando o Google, coletaremos as informações associadas à sua conta Google, como nome e e-mail. Também coletamos dados sobre seu progresso nos cursos para melhorar sua experiência de aprendizado.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">2. Como Usamos Suas Informações</h2>
            <p>Usamos suas informações para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer, operar e manter nossa Plataforma.</li>
              <li>Gerenciar sua conta e seu acesso aos cursos.</li>
              <li>Processar suas transações.</li>
              <li>Comunicar-nos com você, inclusive para suporte ao cliente.</li>
              <li>Personalizar sua experiência de aprendizado.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-primary mt-6">3. Compartilhamento de Informações</h2>
            <p>Não compartilhamos suas informações pessoais com terceiros, exceto com plataformas que operam no ecossistema do nosso site para fornecer serviços essenciais (como autenticação, processamento de pagamentos e armazenamento de dados), ou em casos de obrigação legal para proteger nossos direitos.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">4. Segurança dos Dados</h2>
            <p>Implementamos medidas de segurança para proteger suas informações pessoais. No entanto, nenhum sistema de segurança é impenetrável e não podemos garantir a segurança absoluta de suas informações.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">5. Seus Direitos</h2>
            <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Para exercer esses direitos, entre em contato conosco.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">6. Cookies</h2>
            <p>Usamos cookies e tecnologias de rastreamento semelhantes para operar e personalizar nosso serviço. Você pode instruir seu navegador a recusar todos os cookies, mas algumas partes do nosso serviço podem não funcionar.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">7. Alterações nesta Política</h2>
            <p>Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova política nesta página.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">8. Contato</h2>
            <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco através dos canais de suporte disponíveis no rodapé.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

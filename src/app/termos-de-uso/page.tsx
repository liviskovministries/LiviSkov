import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';

export default function TermosDeUsoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-4xl space-y-6">
          <h1 className="text-4xl font-bold text-primary">Termos de Uso</h1>
          <p className="text-muted-foreground">Bem-vindo(a) à nossa plataforma. Leia os termos com atenção.</p>

          <div className="space-y-4 text-foreground/80">
            <h2 className="text-2xl font-semibold text-primary mt-6">1. Aceitação dos Termos</h2>
            <p>Ao acessar e usar a plataforma de cursos de Livi Skov ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com estes termos, não deverá usar a Plataforma.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">2. Acesso à Plataforma e Cursos</h2>
            <p>Para acessar o conteúdo dos cursos, você deve criar uma conta e adquirir o curso através do link de pagamento fornecido (Stripe). Você é responsável por manter a confidencialidade de sua conta e senha.</p>
            <p>A compra do curso concede a você uma licença limitada, não exclusiva e intransferível para acessar e visualizar o conteúdo do curso para fins pessoais e não comerciais.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">3. Propriedade Intelectual</h2>
            <p>Todo o conteúdo disponível na Plataforma, incluindo vídeos, textos, materiais de apoio e o design do site, é propriedade de Livi Skov e protegido por leis de direitos autorais. Você não pode reproduzir, distribuir, modificar, criar trabalhos derivados, exibir publicamente, executar publicamente, republicar, baixar, armazenar ou transmitir qualquer material de nossa Plataforma sem consentimento prévio por escrito.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">4. Conduta do Usuário</h2>
            <p>Você concorda em usar a Plataforma apenas para fins legais. Você não deve usar a Plataforma para publicar ou transmitir qualquer material que seja ilegal, ameaçador, abusivo, ou que viole os direitos de terceiros.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">5. Pagamentos e Reembolsos</h2>
            <p>Os pagamentos para os cursos são processados através da plataforma Stripe. Ao fazer uma compra, você concorda com os termos de serviço do Stripe. As políticas de reembolso, se houver, serão especificadas na página de vendas do curso. Devido à natureza digital do produto, as vendas são, em geral, finais.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">6. Limitação de Responsabilidade</h2>
            <p>O conteúdo do curso é fornecido "como está", para fins educacionais e de inspiração espiritual. Livi Skov não garante resultados específicos de sua participação no curso. Não seremos responsáveis por quaisquer danos resultantes do uso da Plataforma.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">7. Alterações nos Termos</h2>
            <p>Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. O uso continuado da Plataforma após tais alterações constitui sua aceitação dos novos Termos de Uso.</p>

            <h2 className="text-2xl font-semibold text-primary mt-6">8. Contato</h2>
            <p>Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco através dos canais de suporte disponíveis no rodapé.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

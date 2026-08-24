import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/* Agenda Section */
<section id="agenda" className="bg-secondary py-20">
  <div className="container text-center">
    <h2 className="text-3xl font-bold text-primary">Agenda</h2>
    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
      Confira os próximos eventos e workshops.
    </p>
    <div className="mt-12 grid grid-cols-1 gap-8 text-left md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Setembro</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>06/09</strong> - Igreja Batista Blessing, São Paulo/SP</p>
          <p><strong>11-12/09</strong> - Conferência florescer na Igreja Batista Nacional em Brasnorte/MT</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Outubro</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>11/10</strong> - Igreja Batista Blessing</p>
          <p><strong>25/10</strong> - Igreja Cabo Verde São Paulo/SP</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Novembro</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>06-08/11</strong> - Conferência Sinfônica - Curitiba/PR</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Dezembro</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>13/12</strong> - Igreja Batista Blessing</p>
        </CardContent>
      </Card>
    </div>
    <div className="mt-12 text-center">
      <p className="text-lg text-muted-foreground">
        Caso deseje saber mais sobre os eventos ou mesmo marcar uma agenda com a Livi, entre em contato conosco.
      </p>
    </div>
  </div>
</section>
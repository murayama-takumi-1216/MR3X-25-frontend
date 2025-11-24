import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex justify-end">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/90"
          >
            Criar nova conta
          </Link>
        </div>
        <header className="space-y-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Termos Gerais de Uso e Política de Privacidade – MR3X
          </h1>
          <div className="text-sm sm:text-base text-muted-foreground space-y-1">
            <p>
              <strong>Vigência:</strong> 01 de dezembro de 2025 &nbsp;|&nbsp; <strong>Versão:</strong> 1.0
            </p>
            <p>
              <strong>Foro:</strong> Comarca de Guarujá/SP
            </p>
            <p>
              <strong>MR3X Tecnologia em Gestão de Pagamentos de Aluguéis LTDA</strong><br />
              CNPJ: 27.960.990/0001-66 &nbsp;|&nbsp;
              <Link href="mailto:contato@mr3x.com.br" className="text-primary hover:underline">
                contato@mr3x.com.br
              </Link>{' '}
              |{' '}
              <Link href="https://www.mr3x.com.br" target="_blank" className="text-primary hover:underline">
                www.mr3x.com.br
              </Link>
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/docs/termos-mr3x.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Baixar documento em PDF
            </Link>
          </div>
        </header>

        <section className="mt-10 space-y-8 text-sm sm:text-base leading-relaxed">
          <article className="space-y-3">
            <h2 className="text-xl font-semibold">1. Partes e Aceite</h2>
            <p>
              Este documento é celebrado entre a <strong>MR3X TECNOLOGIA EM GESTÃO DE PAGAMENTOS DE ALUGUÉIS LTDA</strong>
              (“MR3X”) e o <strong>Usuário</strong> (pessoa física ou jurídica que acessa, cadastra-se ou utiliza os
              serviços). Ao criar cadastro ou utilizar a plataforma, o Usuário declara ter <strong>lido, compreendido e
              aceito integralmente</strong> estes Termos, a Política de Privacidade, a Política de Tratamento de Dados e
              as Condições de Assinatura Eletrônica, que passam a reger o uso do sistema MR3X. O aceite eletrônico possui
              validade jurídica plena, nos termos do art. 10, §2º da Medida Provisória nº 2.200-2/2001.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">2. Objeto e Finalidade do Serviço</h2>
            <p>
              A MR3X é uma <strong>plataforma tecnológica (SaaS)</strong> destinada à gestão de pagamentos de aluguéis,
              assinatura eletrônica de contratos, conciliação financeira e automação imobiliária. A MR3X não realiza
              intermediação imobiliária, corretagem ou administração direta de imóveis. O uso da plataforma é de
              responsabilidade exclusiva de imobiliárias, corretores, gestores e proprietários que realizarem o cadastro.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">3. Uso do Serviço</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>O Usuário compromete-se a utilizar a plataforma <strong>de boa-fé</strong> e de acordo com a legislação vigente.</li>
              <li>É <strong>proibido</strong> o uso para atividades ilícitas, antiéticas, fraudulentas ou que envolvam violação da LGPD.</li>
              <li>O Usuário é o <strong>único responsável</strong> pelos dados, documentos e informações inseridos, armazenados ou compartilhados.</li>
              <li>A MR3X <strong>não se responsabiliza</strong> por obrigações contratuais firmadas entre locadores, locatários e intermediários.</li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, código, interface, marca e estrutura do sistema MR3X são <strong>propriedade exclusiva da MR3X</strong>,
              protegidos por leis nacionais e tratados internacionais. É vedado ao Usuário copiar, distribuir, modificar,
              sublicenciar, realizar engenharia reversa ou utilizar o software fora dos limites estabelecidos neste documento.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">5. Limitação de Responsabilidade</h2>
            <p>A MR3X não se responsabiliza por:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Informações incorretas inseridas pelos usuários;</li>
              <li>Perdas decorrentes de mau uso ou falta de atualização de dados;</li>
              <li>Inadimplemento contratual entre locador, locatário ou terceiros;</li>
              <li>Falhas de internet, provedores ou sistemas de terceiros;</li>
              <li>Casos fortuitos ou de força maior.</li>
            </ul>
            <p>
              A responsabilidade civil da MR3X está limitada ao valor equivalente a <strong>seis meses do plano contratado</strong>
              vigente à data do evento danoso. A MR3X atua somente como fornecedora de tecnologia, não sendo parte nos
              contratos firmados entre os usuários.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">6. Política de Privacidade</h2>
            <p>
              A MR3X coleta e trata dados pessoais em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>.
              Os dados são utilizados para fins de autenticação, geração de cobranças, assinatura eletrônica, comunicação
              e suporte. O Usuário pode solicitar acesso, correção ou exclusão de dados por meio do e-mail{' '}
              <Link href="mailto:privacidade@mr3x.com.br" className="text-primary hover:underline">
                privacidade@mr3x.com.br
              </Link>
              .
            </p>
            <p>
              Informações podem ser compartilhadas com parceiros de pagamento, provedores de assinatura eletrônica e
              serviços de nuvem, sempre observando medidas de segurança como criptografia, logs e controle de acesso.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">7. Segurança, Armazenamento e Logs</h2>
            <p>
              A MR3X mantém registros de acesso, emissão de boletos, assinaturas eletrônicas e atividades críticas por
              prazo mínimo de <strong>cinco anos</strong>. São adotadas políticas de backup, autenticação multifator e monitoramento
              contínuo para preservar a integridade do serviço.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">8. Planos, Pagamentos e Repasses</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Os planos e taxas são divulgados nos canais oficiais da MR3X.</li>
              <li>Repasses a proprietários podem ser agendados automaticamente após a confirmação do pagamento.</li>
              <li>A MR3X não responde por desacordos comerciais entre as partes envolvidas nas locações.</li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">9. Gestão de Aluguéis</h2>
            <p>
              As ferramentas de gestão de contratos, boletos e repasses devem ser utilizadas em conformidade com estes
              Termos. As responsabilidades civis, fiscais e contábeis de cada operação permanecem com os usuários
              (imobiliárias, corretores ou proprietários).
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">10. Cancelamento, Distrato e Multa</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>O Usuário pode solicitar o encerramento do uso a qualquer momento, respeitando obrigações já assumidas.</li>
              <li>Planos com fidelidade podem gerar <strong>multa proporcional</strong> em caso de cancelamento antecipado.</li>
              <li>A MR3X pode suspender ou rescindir o acesso em casos de fraude, uso indevido ou violação destes Termos.</li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">11. Alterações dos Termos</h2>
            <p>
              A MR3X poderá atualizar este documento a qualquer momento, publicando a versão mais recente em{' '}
              <Link href="https://www.mr3x.com.br/termos" target="_blank" className="text-primary hover:underline">
                www.mr3x.com.br/termos
              </Link>
              . As alterações entram em vigor <strong>10 (dez) dias</strong> após a notificação por e-mail ou aviso na plataforma.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">12. Lei Aplicável e Foro</h2>
            <p>
              Estes Termos são regidos pelas leis brasileiras, especialmente a LGPD, o Marco Civil da Internet e o Código Civil.
              Fica eleito o <strong>foro da Comarca de Guarujá/SP</strong> para dirimir quaisquer controvérsias.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">13. Assinatura Eletrônica</h2>
            <p>
              O cadastro, envio de documentos e aceite digital são registrados com hash criptográfico, endereço IP e data/hora,
              garantindo validade jurídica nos termos da MP 2.200-2/2001.
            </p>
            <p>
              Para verificar ou arquivar o documento original, utilize o botão “Baixar documento em PDF” no topo desta página.
            </p>
          </article>
        </section>

        <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            Ao continuar utilizando a plataforma MR3X, você reconhece que leu e concorda com estes Termos Gerais de Uso e com a
            Política de Privacidade.
          </p>
        </footer>
      </div>
    </div>
  )
}

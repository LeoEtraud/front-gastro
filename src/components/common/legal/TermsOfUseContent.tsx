import { LegalBody, LegalSection } from '@/components/common/legal/LegalDocumentModal';
import { TermsLegalReferences } from '@/components/common/legal/LegalReferences';
import {
  LEGAL_ENTITY,
  LEGAL_LAST_UPDATED,
  LEGAL_PRIVACY_EMAIL,
  LEGAL_SUPPORT_EMAIL,
} from '@/lib/legal-config';

export function TermsOfUseContent() {
  const { platform, name, cnpj, address } = LEGAL_ENTITY;

  return (
    <LegalBody>
      <LegalSection title="Introdução">
        <p className="font-medium text-foreground">TERMOS DE USO</p>
        <p className="font-medium text-foreground">{platform}</p>
        <p>Última atualização: {LEGAL_LAST_UPDATED}</p>
        <p>
          Estes Termos de Uso regulam o acesso e a utilização da plataforma {platform}, mantida por {name}, inscrita
          no CNPJ sob o nº {cnpj}, com endereço no {address}.
        </p>
        <p>
          Ao acessar ou utilizar a plataforma, o usuário declara que leu, compreendeu e concorda com as condições
          previstas neste documento.
        </p>
      </LegalSection>

      <LegalSection title="1. Definições">
        <p>Para fins destes Termos de Uso:</p>
        <ul>
          <li>
            <strong className="text-foreground">Plataforma:</strong> ambiente digital denominado {platform}, destinado
            à disponibilização de videoaulas, módulos e conteúdos educacionais.
          </li>
          <li>
            <strong className="text-foreground">Usuário/Aluno:</strong> pessoa cadastrada para acessar os conteúdos
            educacionais disponibilizados na plataforma.
          </li>
          <li>
            <strong className="text-foreground">Professor:</strong> usuário autorizado a acompanhar o progresso dos
            alunos e atividades relacionadas aos cursos.
          </li>
          <li>
            <strong className="text-foreground">Gestor:</strong> usuário autorizado a criar, organizar e administrar
            cursos, módulos, aulas e acessos dentro da plataforma.
          </li>
          <li>
            <strong className="text-foreground">{name}:</strong> responsável pela disponibilização e administração da
            plataforma.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Objeto da plataforma">
        <p>
          A plataforma {platform} tem por finalidade disponibilizar acesso a cursos online, compostos por videoaulas
          específicas, módulos e aulas organizadas pelo gestor da plataforma.
        </p>
        <p>A plataforma permite:</p>
        <ul>
          <li>acesso de alunos às videoaulas e conteúdos educacionais;</li>
          <li>acesso de professores para acompanhamento dos alunos;</li>
          <li>acesso de gestores para criação e organização da estrutura dos cursos, módulos e aulas.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Público-alvo">
        <p>
          A plataforma é destinada a médicos residentes em especialização, maiores de 18 anos, devidamente autorizados
          pela {name} a acessar o ambiente educacional.
        </p>
        <p>O acesso por menores de idade não é permitido.</p>
      </LegalSection>

      <LegalSection title="4. Natureza educacional dos conteúdos">
        <p>
          Os conteúdos disponibilizados na plataforma possuem finalidade exclusivamente educacional, acadêmica e
          informativa.
        </p>
        <p>
          O conteúdo da plataforma não substitui consulta médica, atendimento individualizado, diagnóstico, prescrição,
          orientação clínica específica ou acompanhamento profissional de pacientes.
        </p>
        <p>
          As informações disponibilizadas devem ser interpretadas dentro do contexto educacional dos cursos oferecidos,
          sendo responsabilidade do usuário aplicá-las de forma ética, técnica e conforme a legislação e normas
          profissionais aplicáveis.
        </p>
      </LegalSection>

      <LegalSection title="5. Cadastro e acesso à conta">
        <p>Para utilização da plataforma, poderão ser solicitados os seguintes dados do usuário:</p>
        <ul>
          <li>nome completo;</li>
          <li>e-mail;</li>
          <li>CPF;</li>
          <li>telefone.</li>
        </ul>
        <p>O usuário se compromete a fornecer informações verdadeiras, completas e atualizadas.</p>
        <p>
          O acesso à conta é pessoal, individual e intransferível. O usuário é responsável por manter a confidencialidade
          de suas credenciais de acesso, incluindo login e senha.
        </p>
        <p>É proibido compartilhar conta, senha ou qualquer forma de acesso com terceiros.</p>
      </LegalSection>

      <LegalSection title="6. Perfis de acesso">
        <p>A plataforma poderá possuir diferentes níveis de acesso, incluindo:</p>
        <ul>
          <li>
            <strong className="text-foreground">Aluno:</strong> acesso às videoaulas e materiais vinculados ao curso
            autorizado;
          </li>
          <li>
            <strong className="text-foreground">Professor:</strong> acompanhamento dos alunos e atividades relacionadas
            ao curso;
          </li>
          <li>
            <strong className="text-foreground">Gestor:</strong> administração de cursos, módulos, aulas, usuários e
            permissões.
          </li>
        </ul>
        <p>Cada usuário deverá utilizar a plataforma apenas dentro das permissões concedidas ao seu perfil.</p>
      </LegalSection>

      <LegalSection title="7. Cursos pagos, pagamentos e reembolsos">
        <p>
          Os cursos disponibilizados na plataforma são pagos. No entanto, os pagamentos não são processados diretamente
          pela plataforma {platform}.
        </p>
        <p>
          A contratação, pagamento, negociação comercial, eventual reembolso, cancelamento financeiro ou condição de
          acesso decorrente de pagamento serão tratados por meios externos, administrativos ou contratuais definidos
          pela {name}.
        </p>
        <p>A plataforma atua como ambiente de disponibilização dos conteúdos aos usuários autorizados.</p>
      </LegalSection>

      <LegalSection title="8. Prazo de acesso">
        <p>
          O prazo de acesso aos cursos será definido pelo gestor da plataforma, conforme as regras internas, comerciais
          ou acadêmicas aplicáveis a cada curso.
        </p>
        <p>
          A {name} poderá limitar, suspender ou encerrar o acesso do usuário ao conteúdo após o término do prazo
          definido.
        </p>
      </LegalSection>

      <LegalSection title="9. Certificados">
        <p>A plataforma não emite certificados.</p>
        <p>
          O acesso aos cursos, aulas e conteúdos não implica, por si só, certificação, habilitação profissional, título
          acadêmico, reconhecimento oficial ou comprovação formal de capacitação.
        </p>
      </LegalSection>

      <LegalSection title="10. Regras de conduta do usuário">
        <p>
          O usuário se compromete a utilizar a plataforma de forma ética, legal e compatível com sua finalidade
          educacional.
        </p>
        <p>É proibido ao usuário:</p>
        <ul>
          <li>compartilhar login, senha ou acesso com terceiros;</li>
          <li>
            copiar, baixar, gravar, reproduzir, distribuir, vender ou disponibilizar videoaulas sem autorização;
          </li>
          <li>tentar acessar áreas restritas sem permissão;</li>
          <li>comprometer a segurança, integridade ou funcionamento da plataforma;</li>
          <li>utilizar a plataforma para fins ilícitos, fraudulentos ou incompatíveis com estes Termos;</li>
          <li>inserir informações falsas no cadastro;</li>
          <li>violar direitos autorais, propriedade intelectual ou direitos de terceiros;</li>
          <li>
            realizar engenharia reversa, exploração de vulnerabilidades ou qualquer tentativa de acesso indevido.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="11. Propriedade intelectual">
        <p>
          Todos os conteúdos disponibilizados na plataforma, incluindo videoaulas, textos, imagens, materiais
          didáticos, estrutura dos cursos, marcas, layout, identidade visual, funcionalidades e demais elementos,
          pertencem à {name} ou a terceiros licenciantes/autorizados.
        </p>
        <p>O acesso à plataforma não confere ao usuário qualquer direito de propriedade sobre os conteúdos.</p>
        <p>
          É concedida ao usuário apenas uma licença limitada, pessoal, temporária, revogável, não exclusiva e
          intransferível para acessar os conteúdos aos quais tenha sido autorizado.
        </p>
      </LegalSection>

      <LegalSection title="12. Armazenamento de videoaulas">
        <p>
          As videoaulas da plataforma são armazenadas por meio do serviço AWS S3, utilizado para armazenamento e
          disponibilização dos conteúdos digitais.
        </p>
        <p>
          O usuário reconhece que a visualização das aulas depende de conexão com a internet, disponibilidade técnica
          da plataforma e funcionamento dos serviços de terceiros utilizados.
        </p>
      </LegalSection>

      <LegalSection title="13. Disponibilidade da plataforma">
        <p>A {name} empregará esforços razoáveis para manter a plataforma disponível e funcional.</p>
        <p>Entretanto, a plataforma poderá ficar temporariamente indisponível em razão de:</p>
        <ul>
          <li>manutenções programadas;</li>
          <li>atualizações;</li>
          <li>falhas técnicas;</li>
          <li>instabilidades de internet;</li>
          <li>indisponibilidade de serviços de terceiros;</li>
          <li>eventos fora do controle razoável da {name}.</li>
        </ul>
        <p>A {name} não garante funcionamento ininterrupto, livre de erros ou permanentemente disponível.</p>
      </LegalSection>

      <LegalSection title="14. Suspensão ou encerramento de acesso">
        <p>A {name} poderá suspender, restringir ou encerrar o acesso do usuário à plataforma em caso de:</p>
        <ul>
          <li>violação destes Termos de Uso;</li>
          <li>compartilhamento indevido de acesso;</li>
          <li>uso irregular da plataforma;</li>
          <li>tentativa de acesso não autorizado;</li>
          <li>encerramento do prazo de acesso definido pelo gestor;</li>
          <li>determinação administrativa, contratual, legal ou judicial.</li>
        </ul>
      </LegalSection>

      <LegalSection title="15. Responsabilidades do usuário">
        <p>O usuário é responsável:</p>
        <ul>
          <li>pelas informações fornecidas no cadastro;</li>
          <li>pela guarda de suas credenciais de acesso;</li>
          <li>pelo uso adequado da plataforma;</li>
          <li>pela interpretação e utilização dos conteúdos no contexto educacional;</li>
          <li>por manter seus dispositivos seguros e atualizados;</li>
          <li>por não violar direitos da {name}, de professores, alunos ou terceiros.</li>
        </ul>
      </LegalSection>

      <LegalSection title="16. Responsabilidades da GastroCentro">
        <p>
          A {name} será responsável por disponibilizar a plataforma conforme suas funcionalidades, observadas as
          limitações técnicas, operacionais e legais.
        </p>
        <p>A {name} não se responsabiliza por:</p>
        <ul>
          <li>uso inadequado da plataforma pelo usuário;</li>
          <li>compartilhamento de senha pelo próprio usuário;</li>
          <li>falhas de conexão de internet do usuário;</li>
          <li>indisponibilidade temporária de serviços de terceiros;</li>
          <li>aplicação prática indevida dos conteúdos educacionais;</li>
          <li>danos decorrentes de informações falsas fornecidas pelo usuário.</li>
        </ul>
      </LegalSection>

      <LegalSection title="17. Proteção de dados pessoais">
        <p>
          O tratamento de dados pessoais dos usuários será realizado conforme a Política de Privacidade da plataforma,
          em conformidade com a legislação aplicável, especialmente a Lei Geral de Proteção de Dados Pessoais — LGPD
          (Lei nº 13.709/2018).
        </p>
      </LegalSection>

      <LegalSection title="18. Alterações dos Termos de Uso">
        <p>
          A {name} poderá atualizar estes Termos de Uso para refletir alterações legais, técnicas, operacionais ou
          comerciais da plataforma.
        </p>
        <p>
          A versão atualizada será disponibilizada na página pública da plataforma, com indicação da data de
          atualização.
        </p>
        <p>
          O uso contínuo da plataforma após a publicação de alterações representa ciência e concordância com a versão
          atualizada.
        </p>
      </LegalSection>

      <LegalSection title="19. Legislação aplicável">
        <p>
          Estes Termos de Uso serão regidos pelas leis da República Federativa do Brasil, especialmente pelas normas
          aplicáveis à internet, proteção de dados, contratos e propriedade intelectual.
        </p>
      </LegalSection>

      <LegalSection title="20. Contato">
        <p>Para dúvidas, solicitações ou comunicações relacionadas à plataforma, o usuário poderá entrar em contato:</p>
        <p>
          E-mail de suporte:{' '}
          <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>
        </p>
        <p>
          Assuntos de privacidade e dados pessoais:{' '}
          <a href={`mailto:${LEGAL_PRIVACY_EMAIL}`} className="font-medium text-primary hover:underline">
            {LEGAL_PRIVACY_EMAIL}
          </a>
        </p>
      </LegalSection>

      <TermsLegalReferences />
    </LegalBody>
  );
}

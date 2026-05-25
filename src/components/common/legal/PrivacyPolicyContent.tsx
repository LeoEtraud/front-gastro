import { LegalBody, LegalSection } from '@/components/common/legal/LegalDocumentModal';
import { PrivacyLegalReferences } from '@/components/common/legal/LegalReferences';
import {
  LEGAL_DPO_NAME,
  LEGAL_ENTITY,
  LEGAL_LAST_UPDATED,
  LEGAL_PRIVACY_EMAIL,
  LEGAL_SUPPORT_EMAIL,
} from '@/lib/legal-config';

export function PrivacyPolicyContent() {
  const { platform, name, cnpj, address } = LEGAL_ENTITY;
  const dpoLine = LEGAL_DPO_NAME.trim()
    ? `Encarregado/DPO: ${LEGAL_DPO_NAME.trim()}`
    : 'Encarregado/DPO: canal indicado abaixo';

  return (
    <LegalBody>
      <LegalSection title="Introdução">
        <p className="font-medium text-foreground">POLÍTICA DE PRIVACIDADE</p>
        <p className="font-medium text-foreground">{platform}</p>
        <p>Última atualização: {LEGAL_LAST_UPDATED}</p>
        <p>
          Esta Política de Privacidade explica como a plataforma {platform}, mantida por {name}, inscrita no CNPJ sob o
          nº {cnpj}, com endereço no {address}, coleta, utiliza, armazena, protege e trata os dados pessoais dos
          usuários.
        </p>
        <p>
          A LGPD (Lei nº 13.709/2018) dispõe sobre o tratamento de dados pessoais, inclusive em meios digitais, com
          objetivo de proteger direitos fundamentais de liberdade, privacidade e livre desenvolvimento da personalidade
          da pessoa natural.
        </p>
      </LegalSection>

      <LegalSection title="1. Quem é o controlador dos dados">
        <p>
          Para fins desta Política, a {name} atua como controladora dos dados pessoais tratados no âmbito da plataforma{' '}
          {platform}, pois define as finalidades e os meios de tratamento dos dados dos usuários.
        </p>
        <ul className="list-none space-y-1 pl-0">
          <li>
            <strong className="text-foreground">Controladora:</strong> {name}
          </li>
          <li>
            <strong className="text-foreground">CNPJ:</strong> {cnpj}
          </li>
          <li>
            <strong className="text-foreground">Endereço:</strong> {address}
          </li>
          <li>
            <strong className="text-foreground">E-mail de privacidade/DPO:</strong>{' '}
            <a href={`mailto:${LEGAL_PRIVACY_EMAIL}`} className="text-primary hover:underline">
              {LEGAL_PRIVACY_EMAIL}
            </a>
          </li>
          <li>
            <strong className="text-foreground">E-mail de suporte:</strong>{' '}
            <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {LEGAL_SUPPORT_EMAIL}
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Quais dados pessoais coletamos">
        <p>
          A plataforma coleta apenas os dados necessários para cadastro, identificação e acesso dos usuários ao ambiente
          educacional.
        </p>
        <p>Podemos coletar os seguintes dados:</p>
        <ul>
          <li>nome completo;</li>
          <li>e-mail;</li>
          <li>CPF;</li>
          <li>telefone;</li>
          <li>dados de login e autenticação;</li>
          <li>registros de acesso à plataforma;</li>
          <li>informações sobre cursos, módulos e aulas acessadas;</li>
          <li>
            dados técnicos necessários ao funcionamento da plataforma, como endereço IP, data e horário de acesso,
            dispositivo e navegador utilizado.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Dados de saúde">
        <p>A plataforma não coleta dados pessoais sensíveis de saúde.</p>
        <p>
          Não são solicitadas informações sobre doenças, exames, diagnósticos, sintomas, medicamentos, prontuários,
          tratamentos, condições clínicas ou qualquer outro dado de saúde do usuário.
        </p>
        <p>
          Caso, futuramente, a plataforma passe a coletar dados de saúde ou outros dados pessoais sensíveis, esta
          Política de Privacidade deverá ser atualizada antes do início desse tratamento.
        </p>
      </LegalSection>

      <LegalSection title="4. Para que usamos os dados pessoais">
        <p>Os dados pessoais são utilizados para as seguintes finalidades:</p>
        <ul>
          <li>criar e manter o cadastro do usuário;</li>
          <li>permitir login e autenticação na plataforma;</li>
          <li>liberar acesso aos cursos autorizados;</li>
          <li>identificar alunos, professores e gestores;</li>
          <li>permitir ao professor acompanhar os alunos;</li>
          <li>permitir ao gestor organizar cursos, módulos e aulas;</li>
          <li>garantir segurança, controle de acesso e prevenção de uso indevido;</li>
          <li>prestar suporte ao usuário;</li>
          <li>manter registros técnicos de funcionamento da plataforma;</li>
          <li>cumprir obrigações legais, regulatórias ou determinações de autoridades competentes.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Bases legais para tratamento dos dados">
        <p>
          O tratamento dos dados pessoais poderá ocorrer com fundamento nas seguintes bases legais previstas na LGPD:
        </p>
        <ul>
          <li>
            execução de contrato ou procedimentos relacionados ao contrato, para permitir o acesso do usuário à
            plataforma educacional;
          </li>
          <li>cumprimento de obrigação legal ou regulatória, quando aplicável;</li>
          <li>
            legítimo interesse, para segurança da plataforma, prevenção de fraudes, suporte e melhoria dos serviços,
            observados os direitos e liberdades dos titulares;
          </li>
          <li>consentimento, quando necessário para finalidades específicas.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Cookies e tecnologias semelhantes">
        <p>
          A plataforma utiliza cookies necessários para permitir o login, manter a sessão do usuário ativa e garantir o
          funcionamento adequado do acesso à área restrita.
        </p>
        <p>
          Os cookies utilizados são voltados à autenticação e segurança da conta, não tendo como finalidade principal
          publicidade comportamental ou rastreamento comercial.
        </p>
        <p>
          A ANPD possui guia orientativo específico sobre cookies e proteção de dados pessoais, com recomendações para
          transparência e boas práticas no uso dessas tecnologias.
        </p>
      </LegalSection>

      <LegalSection title="7. Compartilhamento de dados com terceiros">
        <p>
          A {name} poderá compartilhar dados pessoais apenas quando necessário para funcionamento da plataforma,
          cumprimento legal ou execução dos serviços.
        </p>
        <p>A plataforma utiliza serviços de terceiros, incluindo:</p>
        <p>
          <strong className="text-foreground">AWS S3:</strong> utilizado para armazenamento das videoaulas e
          disponibilização dos conteúdos digitais.
        </p>
        <p>
          Também poderão ser utilizados serviços de infraestrutura, hospedagem, segurança, suporte técnico ou manutenção
          da plataforma.
        </p>
        <p>O compartilhamento será limitado ao necessário para atingir as finalidades descritas nesta Política.</p>
      </LegalSection>

      <LegalSection title="8. Armazenamento dos dados">
        <p>
          Os dados da plataforma serão armazenados em ambiente tecnológico utilizado pela {name} e/ou por fornecedores
          de infraestrutura contratados, incluindo serviços da AWS.
        </p>
        <p>As videoaulas são armazenadas no serviço AWS S3.</p>
        <p>
          A {name} adotará medidas técnicas e administrativas razoáveis para proteger os dados pessoais contra acessos
          não autorizados, perda, alteração, divulgação indevida ou qualquer forma de tratamento inadequado.
        </p>
      </LegalSection>

      <LegalSection title="9. Segurança da informação">
        <p>A {name} poderá adotar medidas de segurança como:</p>
        <ul>
          <li>controle de acesso por login e senha;</li>
          <li>restrição de permissões por perfil de usuário;</li>
          <li>uso de conexão segura;</li>
          <li>registros de acesso;</li>
          <li>mecanismos de autenticação;</li>
          <li>limitação de acesso administrativo;</li>
          <li>medidas de proteção da infraestrutura tecnológica.</li>
        </ul>
        <p>
          O usuário também deve contribuir para a segurança da plataforma, mantendo sua senha protegida e não
          compartilhando suas credenciais com terceiros.
        </p>
      </LegalSection>

      <LegalSection title="10. Prazo de retenção dos dados">
        <p>
          Os dados pessoais serão mantidos enquanto a plataforma estiver online e enquanto forem necessários para as
          finalidades descritas nesta Política.
        </p>
        <p>A {name} poderá manter determinados dados por prazo superior quando necessário para:</p>
        <ul>
          <li>cumprimento de obrigação legal ou regulatória;</li>
          <li>exercício regular de direitos;</li>
          <li>prevenção de fraudes;</li>
          <li>segurança da plataforma;</li>
          <li>cumprimento de obrigações contratuais ou administrativas.</li>
        </ul>
        <p>
          Quando os dados deixarem de ser necessários, poderão ser eliminados ou anonimizados, observadas as hipóteses
          legais de conservação.
        </p>
      </LegalSection>

      <LegalSection title="11. Direitos dos titulares">
        <p>Nos termos da LGPD, o usuário poderá solicitar, quando aplicável:</p>
        <ul>
          <li>confirmação da existência de tratamento de dados;</li>
          <li>acesso aos dados pessoais;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>
            anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;
          </li>
          <li>portabilidade dos dados, quando aplicável;</li>
          <li>informação sobre compartilhamento de dados;</li>
          <li>revogação do consentimento, quando o tratamento se basear em consentimento;</li>
          <li>
            eliminação dos dados tratados com base no consentimento, respeitadas as hipóteses legais de conservação.
          </li>
        </ul>
        <p>
          A LGPD prevê direitos dos titulares em relação aos seus dados pessoais, incluindo acesso, correção e
          informações sobre tratamento e compartilhamento.
        </p>
      </LegalSection>

      <LegalSection title="12. Como exercer seus direitos">
        <p>
          Para exercer seus direitos ou solicitar informações sobre o tratamento de dados pessoais, o usuário poderá
          entrar em contato:
        </p>
        <p>
          E-mail de privacidade/DPO:{' '}
          <a href={`mailto:${LEGAL_PRIVACY_EMAIL}`} className="font-medium text-primary hover:underline">
            {LEGAL_PRIVACY_EMAIL}
          </a>
        </p>
        <p>
          A solicitação poderá exigir confirmação da identidade do solicitante, a fim de proteger os dados pessoais
          contra acessos indevidos.
        </p>
      </LegalSection>

      <LegalSection title="13. Encarregado pelo tratamento de dados pessoais">
        <p>
          A {name} disponibilizará canal de contato para assuntos relacionados à privacidade e proteção de dados
          pessoais.
        </p>
        <p>{dpoLine}</p>
        <p>
          Contato:{' '}
          <a href={`mailto:${LEGAL_PRIVACY_EMAIL}`} className="font-medium text-primary hover:underline">
            {LEGAL_PRIVACY_EMAIL}
          </a>
        </p>
        <p>
          A ANPD orienta que o encarregado atua como canal de comunicação entre o controlador, os titulares dos dados e
          a Autoridade Nacional de Proteção de Dados.
        </p>
      </LegalSection>

      <LegalSection title="14. Pagamentos">
        <p>A plataforma não processa pagamentos diretamente.</p>
        <p>
          Informações relacionadas a cobrança, pagamento, reembolso, negociação comercial ou contratação dos cursos
          serão tratadas por meios externos definidos pela {name}.
        </p>
        <p>
          Caso futuramente a plataforma passe a processar pagamentos diretamente ou integrar provedores de pagamento,
          esta Política deverá ser atualizada para refletir os novos fluxos de dados.
        </p>
      </LegalSection>

      <LegalSection title="15. Menores de idade">
        <p>A plataforma não é destinada a menores de 18 anos.</p>
        <p>
          Caso a {name} identifique cadastro ou uso indevido por menor de idade, poderá suspender ou excluir o acesso,
          conforme as regras da plataforma e a legislação aplicável.
        </p>
      </LegalSection>

      <LegalSection title="16. Transferência internacional de dados">
        <p>
          Considerando a utilização de serviços de infraestrutura tecnológica, incluindo serviços da AWS, os dados
          poderão ser armazenados ou processados em ambientes localizados no Brasil ou no exterior, conforme a
          estrutura técnica dos fornecedores utilizados.
        </p>
        <p>
          Nesses casos, a {name} adotará medidas razoáveis para que o tratamento ocorra conforme a legislação aplicável
          de proteção de dados.
        </p>
      </LegalSection>

      <LegalSection title="17. Incidentes de segurança">
        <p>
          Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos usuários, a {name} adotará
          as providências cabíveis, incluindo avaliação do incidente, mitigação dos riscos e comunicação às autoridades
          e titulares quando exigido pela legislação aplicável.
        </p>
      </LegalSection>

      <LegalSection title="18. Alterações nesta Política de Privacidade">
        <p>
          Esta Política de Privacidade poderá ser atualizada para refletir alterações legais, técnicas, operacionais ou
          mudanças no funcionamento da plataforma.
        </p>
        <p>
          A versão atualizada será publicada na página pública da plataforma, com indicação da data de última
          atualização.
        </p>
      </LegalSection>

      <LegalSection title="19. Contato">
        <p>Para dúvidas, solicitações ou informações sobre esta Política de Privacidade:</p>
        <p>
          E-mail de suporte:{' '}
          <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>
        </p>
        <p>
          E-mail de privacidade/DPO:{' '}
          <a href={`mailto:${LEGAL_PRIVACY_EMAIL}`} className="font-medium text-primary hover:underline">
            {LEGAL_PRIVACY_EMAIL}
          </a>
        </p>
      </LegalSection>

      <PrivacyLegalReferences />
    </LegalBody>
  );
}

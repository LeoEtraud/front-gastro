import { LegalSection } from '@/components/common/legal/LegalDocumentModal';

const termsReferences = [
  {
    law: 'Lei nº 13.709/2018',
    name: 'Lei Geral de Proteção de Dados Pessoais (LGPD)',
    note: 'Tratamento de dados pessoais e direitos dos titulares (cap. III, arts. 17 a 22).',
  },
  {
    law: 'Lei nº 12.965/2014',
    name: 'Marco Civil da Internet',
    note: 'Direitos e deveres na utilização da internet no Brasil (arts. 7º a 11).',
  },
  {
    law: 'Lei nº 9.610/1998',
    name: 'Lei de Direitos Autorais',
    note: 'Proteção de obras intelectuais, incluindo conteúdos audiovisuais e didáticos.',
  },
  {
    law: 'Lei nº 9.609/1998',
    name: 'Lei de Proteção de Programas de Computador',
    note: 'Proteção de software e ambiente digital da plataforma.',
  },
  {
    law: 'Lei nº 10.406/2002',
    name: 'Código Civil',
    note: 'Contratos, obrigações e responsabilidade civil entre as partes.',
  },
  {
    law: 'Lei nº 8.078/1990',
    name: 'Código de Defesa do Consumidor (CDC)',
    note: 'Quando aplicável à relação de consumo na contratação de cursos.',
  },
  {
    law: 'Constituição Federal de 1988',
    name: 'Art. 5º, incisos V e X',
    note: 'Direito à privacidade, intimidade e proteção de dados pessoais.',
  },
];

const privacyReferences = [
  {
    law: 'Lei nº 13.709/2018',
    name: 'Lei Geral de Proteção de Dados Pessoais (LGPD)',
    note:
      'Bases legais (art. 7º), direitos dos titulares (art. 18), encarregado (art. 41), incidentes (art. 48) e transferência internacional (art. 33).',
  },
  {
    law: 'Constituição Federal de 1988',
    name: 'Art. 5º, incisos X e XXXIII',
    note: 'Privacidade, proteção de dados pessoais e acesso à informação.',
  },
  {
    law: 'Lei nº 12.965/2014',
    name: 'Marco Civil da Internet',
    note: 'Registros de conexão e aplicações de internet (art. 15), guarda de logs e privacidade.',
  },
  {
    law: 'Lei nº 12.527/2011',
    name: 'Lei de Acesso à Informação (LAI)',
    note: 'Quando houver tratamento de informações de interesse público por entes sujeitos à lei.',
  },
  {
    law: 'Autoridade Nacional de Proteção de Dados (ANPD)',
    name: 'Guias e orientações',
    note:
      'Boas práticas sobre cookies, encarregado (DPO) e comunicação com titulares, conforme referências no texto desta Política.',
  },
];

function ReferencesList({ items }: { items: typeof termsReferences }) {
  return (
    <ul className="mt-2 list-none space-y-3 pl-0">
      {items.map((item) => (
        <li key={item.law} className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5">
          <p className="font-medium text-foreground">
            {item.law} — {item.name}
          </p>
          <p className="mt-1 text-xs leading-relaxed">{item.note}</p>
        </li>
      ))}
    </ul>
  );
}

export function TermsLegalReferences() {
  return (
    <LegalSection title="Referências legais">
      <p>
        Estes Termos de Uso observam, entre outras normas aplicáveis no ordenamento brasileiro, as seguintes
        referências principais:
      </p>
      <ReferencesList items={termsReferences} />
    </LegalSection>
  );
}

export function PrivacyLegalReferences() {
  return (
    <LegalSection title="Referências legais">
      <p>
        Esta Política de Privacidade está alinhada às normas de proteção de dados e governança da informação no
        Brasil, em especial:
      </p>
      <ReferencesList items={privacyReferences} />
    </LegalSection>
  );
}

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_VERSION } from "@/lib/app-version";
import { Shield, FileText, AlertTriangle, Scale, X } from "lucide-react";

interface TermsOfUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Resumo informativo alinhado à LGPD e à LAI (versão publicada no rodapé da sidebar).
 * Não substitui parecer jurídico formal nem políticas assinadas em contrato.
 */
export function TermsOfUseModal({ open, onOpenChange }: TermsOfUseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        frameless
        className="max-h-[90dvh] min-h-0 gap-0 overflow-hidden rounded-2xl border-0 bg-card p-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] sm:max-w-4xl lg:max-w-5xl"
        hideCloseButton
      >
        <div className="relative shrink-0 overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary via-primary to-indigo-900 px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
          <DialogClose
            type="button"
            className="absolute right-2 top-2 z-20 flex size-8 items-center justify-center rounded-md border border-white/30 bg-white/15 text-primary-foreground shadow-none outline-none transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0 sm:right-3 sm:top-3"
            aria-label="Fechar"
          >
            <X className="size-3.5 shrink-0" aria-hidden />
          </DialogClose>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 h-48 w-48 translate-x-1/3 -translate-y-1/2 rounded-full bg-white" />
          </div>
          <DialogHeader className="relative z-10 space-y-1 pr-12 text-left sm:pr-14">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-white/20 bg-white/15 p-2.5 shadow-lg backdrop-blur-sm">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-bold tracking-tight text-primary-foreground sm:text-lg">
                  Termos de uso, privacidade e proteção de dados
                </DialogTitle>
                <DialogDescription className="text-xs text-primary-foreground/90 sm:text-sm">
                  GastroCentro — referência à Lei nº 13.709/2018 (LGPD) e à Lei nº 12.527/2011 (LAI) · versão{" "}
                  {APP_VERSION}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-card [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
          <div className="divide-y divide-border text-sm [&_p]:text-justify">
            <section className="px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="mb-2 flex items-center gap-2 text-left font-semibold text-foreground">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                1. Objeto e aceite
              </h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Este documento descreve, em linguagem acessível, como a plataforma GastroCentro trata dados pessoais,
                quais são as regras gerais de uso e como se relacionam com a{" "}
                <strong className="text-foreground">Lei Geral de Proteção de Dados (LGPD)</strong> e com a{" "}
                <strong className="text-foreground">Lei de Acesso à Informação (LAI)</strong>, quando aplicável. Ao
                utilizar o serviço, você declara ciência deste texto na versão {APP_VERSION}. O controlador das
                operações de tratamento é a organização responsável pela plataforma GastroCentro, na qualidade indicada nos
                canais oficiais da plataforma.
              </p>
            </section>

            <section className="px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="mb-2 flex items-center gap-2 text-left font-semibold text-foreground">
                <Scale className="h-4 w-4 shrink-0 text-primary" />
                2. LGPD — dados pessoais e direitos do titular
              </h3>
              <p className="mb-3 text-pretty leading-relaxed text-muted-foreground">
                Em conformidade com a <strong className="text-foreground">Lei nº 13.709/2018 (LGPD)</strong>, o
                tratamento de dados pessoais observa boas práticas de segurança, necessidade, transparência e
                finalidade determinada. Podem ser tratados, entre outros, dados de identificação, contato,
                perfil educacional, registros de uso da plataforma e dados necessários à prestação dos cursos,
                certificação e suporte.
              </p>
              <p className="mb-3 text-pretty leading-relaxed text-muted-foreground">
                As bases legais utilizadas podem incluir execução de contrato ou procedimentos preliminares,
                cumprimento de obrigação legal, legítimo interesse — quando cabível e com balanceamento de
                direitos — e consentimento, quando exigido para finalidades específicas.
              </p>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                O titular pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade
                e eliminação de dados nos limites legais, além de informações sobre compartilhamento e revogação de
                consentimento, conforme o art. 18 da LGPD. Pedidos devem ser encaminhados ao canal de privacidade
                indicado pela organização (incluindo o encarregado de dados, quando houver).
              </p>
            </section>

            <section className="px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="mb-2 flex items-center gap-2 text-left font-semibold text-foreground">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                3. LAI — transparência e acesso à informação
              </h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                A <strong className="text-foreground">Lei nº 12.527/2011 (LAI)</strong> disciplina o acesso a
                informações de interesse coletivo ou geral produzidas ou custodiadas por órgãos e entidades
                públicas. Sempre que a plataforma GastroCentro integrar processos sujeitos à LAI ou mantiver informações
                institucionais de natureza pública, serão observados os princípios da publicidade, transparência e
                resposta tempestiva às solicitações legítimas, sem prejuízo de dados pessoais protegidos pela LGPD e
                de segredos legais ou comerciais admitidos em lei.
              </p>
            </section>

            <section className="bg-destructive/[0.04] px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="mb-2 flex items-center gap-2 text-left font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                4. Uso aceitável e responsabilidades
              </h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                É vedado utilizar a plataforma para fins ilícitos, violação de direitos de terceiros, engenharia
                reversa abusiva, disseminação de malware ou qualquer conduta que comprometa a segurança, a
                confidencialidade ou a integridade dos dados de outros usuários. Conteúdos educacionais permanecem
                sujeitos às regras de propriedade intelectual e às licenças concedidas pelo titular do curso.
              </p>
            </section>

            <section className="bg-muted/40 px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="mb-2 text-left font-semibold text-foreground">5. Atualizações deste documento</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Este texto poderá ser atualizado para refletir mudanças legais ou na plataforma; a versão vigente
                será indicada no rodapé do menu lateral. Recomenda-se revisão periódica e o acompanhamento de
                políticas específicas (cookies, menores, transferência internacional), quando publicadas.
              </p>
            </section>
          </div>
        </div>

        <div className="shrink-0 overflow-hidden rounded-b-2xl border-t border-border bg-muted px-4 py-3 text-justify text-xs leading-relaxed text-muted-foreground sm:px-6">
          Documento informativo (v{APP_VERSION}) — não dispensa assessoria jurídica nem substitui contratos,
          políticas de privacidade ou termos específicos firmados com instituições parceiras.
        </div>
      </DialogContent>
    </Dialog>
  );
}

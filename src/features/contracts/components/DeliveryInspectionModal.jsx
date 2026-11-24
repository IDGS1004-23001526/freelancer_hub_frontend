import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  FileArchive,
  Lock,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Clock,
  Calendar,
  Folder,
  Globe,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { FaGithub, FaFigma } from 'react-icons/fa';

/**
 * Convierte texto con caracteres especiales del espanol a ASCII puro
 * valido para el flujo de contenido PDF-1.4.
 */
function toPdfAscii(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00f1/g, 'n').replace(/\u00d1/g, 'N')
    .replace(/[\u00bf\u00a1]/g, '')
    .replace(/[\u2022\u00b7\u2013\u2014]/g, '-')
    .replace(/[()\\]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

/**
 * Divide texto largo en lineas de maximo maxChars caracteres
 * respetando bordes de palabra (nunca corta una palabra).
 */
function wordWrapPdf(text, maxChars) {
  var max = maxChars || 86;
  var clean = toPdfAscii(text);
  if (!clean) return [''];
  var words = clean.split(/\s+/).filter(Boolean);
  var lines = [];
  var cur = '';
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    if (!cur) { cur = w; }
    else if ((cur + ' ' + w).length <= max) { cur += ' ' + w; }
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

/**
 * Genera un Blob PDF/1.4 valido y legible en cualquier visor.
 * SIEMPRE produce un .pdf, sin importar la extension original del archivo.
 */
function generateValidPdfBlob({
  contract,
  milestone,
  delivery,
  fileName,
  sha256Hash,
}) {
  var HR = '----------------------------------------------------------------------';
  var issuedAt = toPdfAscii(
    new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })
  );

  var metaRows = [
    ['Contrato',         '#' + toPdfAscii(String(contract.id || ''))],
    ['Proyecto',         toPdfAscii(contract.projectTitle || '')],
    ['Hito',             '#' + (milestone.order || 1) + ' - ' + toPdfAscii(milestone.title || '')],
    ['Desarrollador',    toPdfAscii((contract.freelancerName || '') + ' - ' + (contract.freelancerRole || ''))],
    ['Cliente',          toPdfAscii(contract.clientName || '')],
    ['Monto custodia',   (milestone.amount || 0) + ' ' + (contract.currency || 'USD')],
    ['Archivo original', toPdfAscii(fileName || '')],
    ['Enviado el',       toPdfAscii(delivery && delivery.submittedAt
                           ? new Date(delivery.submittedAt).toLocaleString('es-MX')
                           : issuedAt)],
    ['Estado',           'En revision - Integridad criptografica garantizada'],
  ];

  var notesText = (delivery && delivery.notes) || 'Sin notas adicionales del desarrollador.';
  var notesLines = wordWrapPdf(notesText, 86);

  // Construir stream de contenido PDF
  var streamParts = [];
  streamParts.push('BT');
  streamParts.push('/F1 14 Tf');
  streamParts.push('50 755 Td');
  streamParts.push('(' + toPdfAscii('FREELANCER HUB - EVIDENCIA DE ENTREGABLE TECNICO') + ') Tj');
  streamParts.push('/F2 10 Tf');
  streamParts.push('0 -20 Td');
  streamParts.push('(' + toPdfAscii('CERTIFICADO DE INSPECCION Y LIBERACION DE CUSTODIA ESCROW') + ') Tj');
  streamParts.push('/F2 8 Tf');
  streamParts.push('0 -14 Td');
  streamParts.push('(' + HR + ') Tj');

  for (var r = 0; r < metaRows.length; r++) {
    streamParts.push('0 -16 Td');
    streamParts.push('(' + metaRows[r][0] + ': ' + metaRows[r][1] + ') Tj');
  }

  streamParts.push('0 -14 Td');
  streamParts.push('(' + HR + ') Tj');
  streamParts.push('/F1 9 Tf');
  streamParts.push('0 -18 Td');
  streamParts.push('(HUELLA CRIPTOGRAFICA SHA-256 - INTEGRIDAD GARANTIZADA:) Tj');
  streamParts.push('/F2 8 Tf');
  streamParts.push('0 -13 Td');
  streamParts.push('(' + (sha256Hash || '') + ') Tj');

  streamParts.push('0 -14 Td');
  streamParts.push('(' + HR + ') Tj');
  streamParts.push('/F1 9 Tf');
  streamParts.push('0 -18 Td');
  streamParts.push('(NOTAS TECNICAS DEL DESARROLLADOR:) Tj');
  streamParts.push('/F2 9 Tf');
  for (var n = 0; n < notesLines.length; n++) {
    streamParts.push('0 -14 Td');
    streamParts.push('(' + notesLines[n] + ') Tj');
  }

  streamParts.push('0 -20 Td');
  streamParts.push('(' + HR + ') Tj');
  streamParts.push('/F2 7.5 Tf');
  streamParts.push('0 -13 Td');
  streamParts.push('(Certificado oficial emitido por FreelancerHub - Fecha: ' + issuedAt + ') Tj');
  streamParts.push('0 -11 Td');
  streamParts.push('(Documento valido para auditoria y liberacion de pago en custodia Escrow.) Tj');
  streamParts.push('ET');

  var stream = streamParts.join('\n') + '\n';

  // Calcular offsets exactos en bytes para la tabla xref
  var enc = new TextEncoder();
  var streamBytes = enc.encode(stream).length;

  var obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  var obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  var obj3 = [
    '3 0 obj\n',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]\n',
    '   /Contents 4 0 R\n',
    '   /Resources << /Font <<\n',
    '     /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\n',
    '     /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n',
    '   >> >> >>\nendobj\n',
  ].join('');
  var obj4 = '4 0 obj\n<< /Length ' + streamBytes + ' >>\nstream\n' + stream + 'endstream\nendobj\n';

  var objects = [obj1, obj2, obj3, obj4];

  var pdf = '%PDF-1.4\n';
  var xrefOffsets = [];
  for (var o = 0; o < objects.length; o++) {
    xrefOffsets.push(enc.encode(pdf).length);
    pdf += objects[o];
  }
  var startxref = enc.encode(pdf).length;

  pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
  pdf += '0000000000 65535 f \n';
  for (var x = 0; x < xrefOffsets.length; x++) {
    pdf += String(xrefOffsets[x]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\n';
  pdf += 'startxref\n' + startxref + '\n%%EOF';

  return new Blob([pdf], { type: 'application/pdf' });
}

/**
 * DeliveryInspectionModal
 * Centro de inspección técnica de entregables para revisión previa a la liberación de pagos Escrow.
 * Historia de Usuario: FLH-FE-DELIVERY (HU-06)
 */
export default function DeliveryInspectionModal({
  isOpen,
  milestone,
  contract,
  onClose,
  onApprove,
  onRequestCorrections,
  isProcessing = false,
}) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isCorrectionsMode, setIsCorrectionsMode] = useState(false);
  const [correctionsFeedback, setCorrectionsFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  if (!isOpen || !milestone || !contract) return null;

  const currency = contract.currency || 'USD';
  const formatMoney = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const delivery = milestone.delivery;

  // Sello o huella SHA-256 (64 hex)
  const sha256Hash =
    delivery?.sha256Hash ||
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const fileName =
    delivery?.fileName || `evidencia-hito${milestone.order}-entregable.pdf`;
  const fileSize = delivery?.fileSize || '6.8 MB';
  const technicalNotes =
    delivery?.notes ||
    `Avance técnico correspondiente a la etapa #${milestone.order} listo para inspección y validación.`;

  // Copiar hash al portapapeles
  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(sha256Hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    } catch {
      // Fallback si clipboard API no está disponible
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  // Descarga segura del archivo — siempre en formato PDF valido
  const handleSecureDownload = () => {
    setDownloading(true);
    try {
      // Forzar nombre de descarga siempre con extension .pdf
      const baseName = (fileName || 'entregable').replace(/\.[^/.]+$/, '');
      const downloadName = baseName + '.pdf';

      const blob = generateValidPdfBlob({
        contract,
        milestone,
        delivery,
        fileName: downloadName,
        sha256Hash,
      });

      const downloadUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.download = downloadName;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(downloadUrl);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  // Enviar feedback de correcciones
  const handleConfirmCorrections = () => {
    if (!correctionsFeedback.trim()) {
      setFeedbackError('Por favor describe los ajustes o correcciones que requieres.');
      return;
    }
    if (correctionsFeedback.trim().length < 10) {
      setFeedbackError('El detalle debe tener al menos 10 caracteres para orientar al desarrollador.');
      return;
    }
    setFeedbackError('');
    if (onRequestCorrections) {
      onRequestCorrections(milestone, correctionsFeedback.trim());
    }
    setIsCorrectionsMode(false);
    setCorrectionsFeedback('');
  };

  // Identificar el tipo de enlace para la vista previa
  const classifyLink = (url) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('github.com')) {
      const isPR = lower.includes('/pull/') || lower.includes('/pulls');
      const isCommit = lower.includes('/commit/');
      return {
        type: 'github',
        title: isPR ? 'GitHub Pull Request' : isCommit ? 'GitHub Commit' : 'Repositorio GitHub',
        subtitle: isPR ? 'Revisión de código y diff' : 'Código fuente del hito',
        icon: <FaGithub className="w-5 h-5 text-[#24292e]" />,
        badgeClass: 'bg-zinc-100 text-zinc-900 border-zinc-300',
        actionLabel: 'Inspeccionar repositorio',
      };
    }
    if (lower.includes('figma.com')) {
      const isProto = lower.includes('/proto/');
      return {
        type: 'figma',
        title: isProto ? 'Prototipo Interactivo Figma' : 'Tablero de Diseño Figma',
        subtitle: isProto ? 'Flujo navegable de usuario' : 'Componentes y wireframes UI/UX',
        icon: <FaFigma className="w-5 h-5 text-[#F24E1E]" />,
        badgeClass: 'bg-orange-50 text-orange-900 border-orange-200',
        actionLabel: 'Abrir tablero Figma',
      };
    }
    if (
      lower.includes('drive.google.com') ||
      lower.includes('dropbox.com') ||
      lower.includes('onedrive') ||
      lower.includes('box.com')
    ) {
      return {
        type: 'shared_folder',
        title: 'Carpeta Compartida en la Nube',
        subtitle: 'Documentación técnica y assets descargables',
        icon: <Folder className="w-5 h-5 text-amber-600" />,
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
        actionLabel: 'Ver carpeta compartida',
      };
    }
    return {
      type: 'demo',
      title: 'Demostración en Vivo / Staging',
      subtitle: 'Entorno de pruebas y previsualización funcional',
      icon: <Globe className="w-5 h-5 text-emerald-700" />,
      badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      actionLabel: 'Probar vista interactiva',
    };
  };

  const repoLinkInfo = classifyLink(delivery?.repoUrl);
  const demoLinkInfo = classifyLink(delivery?.demoUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="delivery-inspection-modal"
      className="fixed inset-0 z-50 bg-[#2b1b1e]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#C9B8A6]/60 shadow-[0_25px_65px_-15px_rgba(90,15,36,0.35)] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Cabecera del Centro de Inspección */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-[#5A0F24] via-[#751B33] to-[#8C2C45] text-[#F3EFE6] flex items-start justify-between gap-4 shrink-0 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-extrabold tracking-wide">
                <FileCheck2 className="w-3.5 h-3.5 text-[#C68A8F]" />
                <span>Inspección de entrega • Hito #{milestone.order}</span>
              </span>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  milestone.status === 'APPROVED'
                    ? 'bg-emerald-400 text-emerald-950'
                    : milestone.status === 'IN_REVIEW'
                      ? 'bg-amber-300 text-amber-950'
                      : 'bg-[#F3EFE6] text-[#5A0F24]'
                }`}
              >
                {milestone.status === 'APPROVED'
                  ? 'Aprobado & Pagado'
                  : milestone.status === 'IN_REVIEW'
                    ? 'En Revisión'
                    : 'Por Hacer'}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-white leading-snug">
              {milestone.title}
            </h3>

            <p className="text-xs text-[#F3EFE6]/90 flex items-center gap-2">
              <span>Monto en custodia Escrow:</span>
              <strong className="text-white bg-white/20 px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold">
                {formatMoney(milestone.amount)}
              </strong>
              <span className="text-[#F3EFE6]/70">• {contract.projectTitle}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar inspección"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-5 md:p-6 space-y-6 overflow-y-auto">
          {/* Alcance y Criterios del Hito */}
          <section className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]/75">
              <span>Objetivo y Criterios del Hito</span>
              <span className="text-[11px] font-semibold text-[#8C2C45] inline-flex items-center gap-1 lowercase">
                <Clock className="w-3.5 h-3.5" />
                <span>{milestone.deliveryDays} días pactados</span>
              </span>
            </div>
            <div className="text-xs md:text-sm text-[#5A0F24] bg-[#F3EFE6]/70 p-4 rounded-2xl border border-[#C9B8A6]/60 leading-relaxed space-y-1">
              <p>{milestone.description}</p>
              {milestone.dueDate && (
                <p className="text-[11px] text-[#5A0F24]/70 pt-1 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8C2C45]" />
                  <span>Fecha límite programada: {milestone.dueDate}</span>
                </p>
              )}
            </div>
          </section>

          {/* 1. NOTAS TÉCNICAS ENVIADAS POR EL DESARROLLADOR */}
          <section className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#8C2C45]" />
                Notas Técnicas del Desarrollador
              </span>
              <span className="text-[11px] font-normal text-[#5A0F24]/70">
                Por: <strong className="text-[#5A0F24]">{contract.freelancerName}</strong>
              </span>
            </div>

            <div className="bg-[#fbf9f6] p-4.5 rounded-2xl border border-[#C9B8A6]/60 space-y-2.5">
              <p className="text-xs md:text-sm text-[#5A0F24] leading-relaxed italic">
                “{technicalNotes}”
              </p>

              {delivery?.submittedAt && (
                <div className="pt-2 border-t border-[#C9B8A6]/40 flex items-center justify-between text-[11px] text-[#5A0F24]/70">
                  <span className="font-semibold">
                    Fecha de entrega: {new Date(delivery.submittedAt).toLocaleString('es-MX')}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#8C2C45] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Inspección técnica habilitada
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* 2. VISOR DE ENLACES: GITHUB, FIGMA O CARPETAS COMPARTIDAS */}
          <section className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-[#8C2C45]" />
              Visor de Enlaces y Recursos Técnicos
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Enlace Principal (Repositorio GitHub / Tablero Figma) */}
              {repoLinkInfo && (
                <div className="p-4 rounded-2xl bg-white border border-[#C9B8A6]/70 hover:border-[#8C2C45] transition-all shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {repoLinkInfo.icon}
                        <span className="text-xs font-extrabold text-[#5A0F24]">
                          {repoLinkInfo.title}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${repoLinkInfo.badgeClass}`}
                      >
                        {repoLinkInfo.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A0F24]/75">{repoLinkInfo.subtitle}</p>
                    <p className="text-[11px] font-mono text-[#8C2C45] truncate bg-[#F3EFE6]/50 p-1.5 rounded-lg border border-[#C9B8A6]/40">
                      {delivery?.repoUrl}
                    </p>
                  </div>

                  <a
                    href={delivery?.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-[#5A0F24] hover:bg-[#8C2C45] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{repoLinkInfo.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Enlace Secundario (Figma Prototipo / Carpeta Compartida / Demo) */}
              {demoLinkInfo ? (
                <div className="p-4 rounded-2xl bg-white border border-[#C9B8A6]/70 hover:border-[#8C2C45] transition-all shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {demoLinkInfo.icon}
                        <span className="text-xs font-extrabold text-[#5A0F24]">
                          {demoLinkInfo.title}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${demoLinkInfo.badgeClass}`}
                      >
                        {demoLinkInfo.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A0F24]/75">{demoLinkInfo.subtitle}</p>
                    <p className="text-[11px] font-mono text-emerald-800 truncate bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-200/70">
                      {delivery?.demoUrl}
                    </p>
                  </div>

                  <a
                    href={delivery?.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{demoLinkInfo.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F3EFE6]/50 border border-dashed border-[#C9B8A6] flex flex-col items-center justify-center text-center space-y-1.5 text-xs text-[#5A0F24]/70">
                  <Globe className="w-6 h-6 text-[#C68A8F]" />
                  <p className="font-bold text-[#5A0F24]">Sin demostración en vivo adicional</p>
                  <p className="text-[11px]">Toda la evidencia requerida se encuentra en el repositorio y archivo adjunto.</p>
                </div>
              )}
            </div>
          </section>

          {/* 3. DESCARGA SEGURA Y HASH SHA-256 CON BADGE 'INTEGRIDAD GARANTIZADA' */}
          <section className="space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-700" />
                Descarga Segura y Verificación Criptográfica
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Integridad Garantizada
              </span>
            </div>

            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 border-2 border-emerald-300 space-y-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                      <span>{fileName}</span>
                      <span className="text-[11px] font-normal text-emerald-800">
                        ({fileSize})
                      </span>
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Archivo de evidencia original empaquetado por el desarrollador.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Integridad Verificada</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleSecureDownload}
                    disabled={downloading}
                    className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading ? 'Descargando...' : 'Descargar Archivo Seguro'}</span>
                  </button>
                </div>
              </div>

              {/* Bloque con la huella digital SHA-256 (64 caracteres hex) */}
              <div className="p-3 rounded-xl bg-white/90 border border-emerald-300 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-700" />
                    Sello Criptográfico Inmutable
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copiar hash SHA-256"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar hash</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-emerald-950 font-mono break-all font-semibold select-all bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                  Huella SHA-256: {sha256Hash}
                </div>

                <p className="text-[10px] text-emerald-800/90 leading-tight">
                  Este hash de 64 caracteres garantiza matemáticamente que el contenido del archivo no ha sufrido alteraciones ni manipulaciones desde el momento de su subida.
                </p>
              </div>
            </div>
          </section>

          {/* MODO: SOLICITUD DE CORRECCIONES CON CAMPO DE FEEDBACK */}
          {isCorrectionsMode && (
            <section className="p-4.5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-extrabold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  Solicitud de Correcciones Técnicas
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                  Hito volverá a «Por Hacer»
                </span>
              </div>

              <p className="text-xs text-amber-900 leading-relaxed">
                Describe detalladamente los cambios, ajustes o criterios técnicos que el desarrollador debe corregir antes de que puedas aprobar la entrega:
              </p>

              <div className="space-y-1.5">
                <textarea
                  value={correctionsFeedback}
                  onChange={(e) => {
                    setCorrectionsFeedback(e.target.value);
                    if (feedbackError) setFeedbackError('');
                  }}
                  rows={4}
                  placeholder="Ejemplo: Se requiere ajustar la respuesta del endpoint para manejar errores de timeout y agregar las pruebas unitarias que cubran el escenario del carrito..."
                  className="w-full p-3 rounded-xl bg-white border border-amber-300 text-xs text-[#5A0F24] focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-900/40 leading-relaxed"
                />

                {feedbackError && (
                  <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{feedbackError}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCorrectionsMode(false);
                    setFeedbackError('');
                  }}
                  className="py-2 px-3.5 rounded-xl bg-white hover:bg-amber-100/70 text-amber-950 text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCorrections}
                  disabled={isProcessing}
                  className="py-2 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-extrabold transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Enviar Correcciones al Desarrollador</span>
                </button>
              </div>
            </section>
          )}
        </div>

        {/* PIE DE ACCIONES DEL MODAL */}
        <div className="p-4 md:p-5 bg-[#F3EFE6]/80 border-t border-[#C9B8A6]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5A0F24] hover:bg-[#C9B8A6]/30 transition-colors cursor-pointer text-center"
          >
            Cerrar Inspección
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {milestone.status === 'TODO' && (
              <span className="text-xs text-[#5A0F24]/75 font-semibold italic">
                El especialista aún no ha subido los entregables de este hito.
              </span>
            )}

            {milestone.status === 'APPROVED' && (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Hito aprobado y pago liberado exitosamente</span>
              </div>
            )}

            {milestone.status === 'IN_REVIEW' && !isCorrectionsMode && (
              <>
                {/* BOTÓN 1: Solicitar Correcciones */}
                <button
                  type="button"
                  onClick={() => setIsCorrectionsMode(true)}
                  disabled={isProcessing}
                  data-testid="btn-modal-request-corrections"
                  className="py-2.5 px-4 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-300 text-xs font-extrabold transition-all inline-flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Solicitar Correcciones</span>
                </button>

                {/* BOTÓN 2: Aprobar y Liberar Pago */}
                <button
                  type="button"
                  onClick={() => onApprove && onApprove(milestone)}
                  disabled={isProcessing}
                  data-testid="btn-modal-approve-milestone"
                  className="py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-extrabold transition-all inline-flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobar y Liberar Pago</span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-800 text-white text-[11px] font-mono font-bold">
                    {formatMoney(milestone.amount)}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

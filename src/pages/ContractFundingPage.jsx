import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  CreditCard,
  Wallet,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Copy,
  Check,
  Plus,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Toast from '../features/ui/Toast.jsx';
import CardInputForm from '../features/payments/CardInputForm.jsx';
import { contractApi } from '../api/contract.api.js';
import { paymentApi } from '../api/payment.api.js';
import { useProjectStore } from '../stores/project.store.js';

/**
 * Normaliza texto para el stream de contenido PDF-1.4 en formato ASCII estándar.
 */
function cleanPdfText(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ñÑ]/g, (c) => (c === 'ñ' ? 'n' : 'N'))
    .replace(/[•·–—]/g, '-')
    .replace(/[¿¡]/g, '')
    .replace(/[\\()]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

function wrapPdfLines(text, maxChars = 85) {
  const clean = cleanPdfText(text);
  if (!clean) return [''];
  const words = clean.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) {
      cur = w;
    } else if ((cur + ' ' + w).length <= maxChars) {
      cur += ' ' + w;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

/**
 * Genera el archivo PDF oficial del Comprobante Digital de Custodia Escrow conforme a PDF-1.4.
 */
function generateEscrowReceiptPdfBlob(receipt) {
  const HR = '-----------------------------------------------------------------------------------------';
  const title = 'FREELANCER HUB - COMPROBANTE DIGITAL DE DEPOSITO EN CUSTODIA ESCROW';
  const subtitle = 'CERTIFICADO DE RETENCION DE FONDOS EN GARANTIA (HU-05: FLH-FE-ESCROW)';

  const metaRows = [
    ['Folio de Comprobante', `#${receipt.id}`],
    ['ID de Transaccion', receipt.transactionId],
    ['Contrato Vinculado', `#${receipt.contractId}`],
    ['Proyecto / Convocatoria', receipt.projectTitle],
    ['Cliente Contratante', receipt.clientName],
    ['Especialista Seleccionado', `${receipt.freelancerName} (${receipt.freelancerRole || 'Freelancer'})`],
    ['Metodo de Pago', receipt.cardLast4 ? `${receipt.paymentMethod} (•••• ${receipt.cardLast4})` : receipt.paymentMethod],
    ['Subtotal Trabajo', `${receipt.subtotal.toLocaleString('es-MX')} ${receipt.currency}`],
    ['Tarifa de Servicio Escrow (10%)', `${receipt.serviceFee.toLocaleString('es-MX')} ${receipt.currency}`],
    ['TOTAL RETENIDO EN CUSTODIA', `${receipt.totalDeposited.toLocaleString('es-MX')} ${receipt.currency}`],
    ['Fecha y Hora de Fondeo', new Date(receipt.fundedAt).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })],
    ['Estado del Contrato', 'IN_PROGRESS - Fondos resguardados en cuenta custodia neutral'],
  ];

  const streamParts = [];
  streamParts.push('BT');
  streamParts.push('/F1 13 Tf');
  streamParts.push('50 750 Td');
  streamParts.push(`(${cleanPdfText(title)}) Tj`);

  streamParts.push('/F2 9.5 Tf');
  streamParts.push('0 -19 Td');
  streamParts.push(`(${cleanPdfText(subtitle)}) Tj`);

  streamParts.push('/F2 8 Tf');
  streamParts.push('0 -14 Td');
  streamParts.push(`(${HR}) Tj`);

  for (const [lbl, val] of metaRows) {
    const isTotal = lbl.includes('TOTAL');
    if (isTotal) {
      streamParts.push('/F1 9 Tf');
      streamParts.push('0 -17 Td');
      streamParts.push(`(${cleanPdfText(lbl)}: ${cleanPdfText(val)}) Tj`);
      streamParts.push('/F2 8.5 Tf');
    } else {
      streamParts.push('0 -15 Td');
      streamParts.push(`(${cleanPdfText(lbl)}: ${cleanPdfText(val)}) Tj`);
    }
  }

  streamParts.push('0 -14 Td');
  streamParts.push(`(${HR}) Tj`);

  streamParts.push('/F1 9 Tf');
  streamParts.push('0 -18 Td');
  streamParts.push('(SELLO CRIPTOGRAFICO SHA-256 (GARANTIA INMUTABLE DE DEPOSITO):) Tj');

  streamParts.push('/F2 8 Tf');
  streamParts.push('0 -14 Td');
  streamParts.push(`(${cleanPdfText(receipt.sha256Seal)}) Tj`);

  streamParts.push('0 -14 Td');
  streamParts.push(`(${HR}) Tj`);

  streamParts.push('/F2 7.5 Tf');
  streamParts.push('0 -17 Td');
  streamParts.push('(CONDICIONES DE LIBERACION DE FONDOS:) Tj');
  const terms = [
    '1. El dinero depositado permanece retenido de manera segura en la cuenta custodia de FreelancerHub.',
    '2. Los fondos de cada hito solo se liberan al especialista cuando el cliente inspecciona y aprueba el entregable tecnico.',
    '3. Ante cualquier inconformidad, el cliente puede solicitar correcciones o acudir a mediacion tecnica sin riesgo de perdida de capital.',
  ];
  for (const t of terms) {
    streamParts.push('0 -12 Td');
    streamParts.push(`(${cleanPdfText(t)}) Tj`);
  }

  streamParts.push('0 -16 Td');
  streamParts.push(`(${HR}) Tj`);
  streamParts.push('0 -13 Td');
  streamParts.push('(Documento digital con validez de auditoria emitido por la plataforma FreelancerHub.) Tj');
  streamParts.push('ET');

  const stream = streamParts.join('\n') + '\n';
  const enc = new TextEncoder();
  const streamBytes = enc.encode(stream).length;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}endstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const xrefOffsets = [];
  for (const obj of objects) {
    xrefOffsets.push(enc.encode(pdf).length);
    pdf += obj;
  }
  const startxref = enc.encode(pdf).length;

  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of xrefOffsets) {
    pdf += String(offset).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export default function ContractFundingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wallet } = useProjectStore();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedCards, setSavedCards] = useState([]);
  const [paymentType, setPaymentType] = useState('saved_card'); // 'saved_card' | 'wallet' | 'new_card'
  const [selectedCardId, setSelectedCardId] = useState('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  // Modales
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [toast, setToast] = useState(null);

  // Cargar contrato y tarjetas registradas
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        if (!id) {
          throw new Error('Falta el identificador del contrato.');
        }
        const [loadedContract, cards] = await Promise.all([
          contractApi.getContractById(id),
          paymentApi.getPaymentMethods(),
        ]);

        if (mounted) {
          setContract(loadedContract);
          setSavedCards(cards);
          if (cards.length > 0) {
            const def = cards.find((c) => c.isDefault) || cards[0];
            setSelectedCardId(def.id);
            setPaymentType('saved_card');
          } else {
            setPaymentType('new_card');
            setShowNewCardForm(true);
          }
        }
      } catch (err) {
        if (mounted) {
          setToast({
            type: 'error',
            title: 'Error al cargar',
            message: err?.response?.data?.message || err?.message || 'No se pudo obtener el contrato.',
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Cálculos financieros transparentes
  const subtotal = contract?.totalAmount || 0;
  const serviceFeeRate = 0.1; // 10% tarifa de plataforma y custodia Escrow
  const serviceFee = Math.round(subtotal * serviceFeeRate * 100) / 100;
  const totalToLock = Math.round((subtotal + serviceFee) * 100) / 100;
  const currency = contract?.currency || 'USD';

  const formatMoney = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);

  const selectedCard = useMemo(
    () => savedCards.find((c) => c.id === selectedCardId) || savedCards[0],
    [savedCards, selectedCardId]
  );

  // Registro rápido de nueva tarjeta
  const handleRegisterNewCard = async (cardPayload) => {
    try {
      const created = await paymentApi.registerPaymentMethod(cardPayload);
      const updated = await paymentApi.getPaymentMethods();
      setSavedCards(updated);
      setSelectedCardId(created.id);
      setPaymentType('saved_card');
      setShowNewCardForm(false);
      setToast({
        type: 'success',
        title: 'Tarjeta lista',
        message: `Tarjeta ${created.brand} terminación ${created.last4} registrada para el fondeo.`,
      });
    } catch {
      setToast({
        type: 'error',
        title: 'Error al registrar tarjeta',
        message: 'No se pudo validar la tarjeta bancaria. Inténtalo de nuevo.',
      });
    }
  };

  // Ejecución del fondeo Escrow (conecta al backend)
  const handleProcessFunding = async () => {
    if (!contract) return;
    setIsProcessing(true);
    try {
      const methodLabel =
        paymentType === 'wallet'
          ? 'wallet'
          : 'card';

      if (methodLabel === 'card' && !selectedCard) {
        setToast({
          type: 'error',
          title: 'Selecciona una tarjeta',
          message: 'Registra o elige una tarjeta antes de fondear el contrato.',
        });
        return;
      }

      const cardLast4 = methodLabel === 'card' ? selectedCard.last4 : undefined;

      const result = await contractApi.fundContract(contract.id, {
        paymentMethod: methodLabel,
        cardLast4,
        autoStart: true,
      });

      setContract(result.contract);
      setReceipt(result.receipt);
      setIsSecurityModalOpen(false);

      setToast({
        type: 'success',
        title: '¡Fondeo Exitoso!',
        message: 'Fondos retenidos en custodia Escrow y contrato activado en progreso.',
      });
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Error al procesar fondeo',
        message:
          err?.response?.data?.message || 'No fue posible completar la retención en custodia Escrow.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Descarga del Comprobante Oficial en PDF
  const handleDownloadReceiptPdf = () => {
    if (!receipt) return;
    const blob = generateEscrowReceiptPdfBlob(receipt);
    const url = URL.createObjectURL(blob);
    const temp = document.createElement('a');
    temp.href = url;
    temp.download = `Comprobante-Custodia-Escrow-${receipt.contractId.slice(0, 8)}.pdf`;
    document.body.appendChild(temp);
    temp.click();
    document.body.removeChild(temp);
    URL.revokeObjectURL(url);
  };

  const handleCopySeal = async () => {
    if (!receipt) return;
    try {
      await navigator.clipboard.writeText(receipt.sha256Seal);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#8C2C45] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-extrabold text-[#5A0F24]">
            Cargando resumen del acuerdo legal y custodia Escrow...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
        {toast && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Barra superior de navegación */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/contracts"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Tablero de Contratos</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5A0F24]/75">
              Estado del acuerdo:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                receipt || contract?.status === 'IN_PROGRESS' || contract?.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  : 'bg-amber-100 text-amber-950 border border-amber-300'
              }`}
            >
              {receipt || contract?.status === 'IN_PROGRESS' || contract?.status === 'ACTIVE'
                ? 'Fondeado & En Progreso'
                : 'Pendiente de Fondeo Escrow'}
            </span>
          </div>
        </div>

        {/* Encabezado Principal */}
        <div className="bg-gradient-to-r from-[#5A0F24] via-[#751B33] to-[#8C2C45] rounded-3xl p-6 sm:p-8 text-[#F3EFE6] shadow-[0_15px_35px_-15px_rgba(90,15,36,0.3)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-[11px] font-extrabold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C68A8F]" />
              <span>Custodia de Pago Escrow • HU-05</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Fondeo y Formalización del Contrato en Custodia
            </h1>
            <p className="text-xs sm:text-sm text-[#F3EFE6]/85 leading-relaxed">
              Resguarda el importe acordado en nuestra cuenta custodia neutral. Tu dinero permanecerá 100% protegido y solo se transferirá al especialista conforme apruebes cada entrega técnica.
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-5 border border-white/20 shrink-0 flex flex-col justify-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F3EFE6]/75">
              Total a Retener en Garantía
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatMoney(totalToLock)}
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Protección y arbitraje técnico incluidos</span>
            </span>
          </div>
        </div>

        {/* VISTA PRINCIPAL: Si ya se completó el fondeo, mostrar Comprobante Digital */}
        {receipt ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.2)] space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C9B8A6]/40">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950">
                    ¡Depósito en Custodia Escrow Confirmado!
                  </h2>
                  <p className="text-xs text-emerald-800">
                    El contrato ha pasado a estado <strong>IN_PROGRESS</strong>. El especialista ya fue notificado para iniciar los trabajos.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadReceiptPdf}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Comprobante Oficial (PDF)</span>
                </button>

                <Link
                  to="/contracts"
                  className="px-4 py-2.5 rounded-xl bg-[#5A0F24] hover:bg-[#8C2C45] text-white text-xs font-extrabold transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Ir al Tablero de Hitos</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Ficha técnica del Comprobante Digital */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-900/70 block">
                  Folio de Comprobante
                </span>
                <span className="font-mono font-extrabold text-emerald-950 text-sm">
                  {receipt.id}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-900/70 block">
                  Transacción de Custodia
                </span>
                <span className="font-mono font-extrabold text-emerald-950 text-sm truncate block">
                  {receipt.transactionId}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-900/70 block">
                  Monto Fondeado
                </span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {formatMoney(receipt.totalDeposited)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-900/70 block">
                  Método de Pago
                </span>
                <span className="font-semibold text-emerald-950">
                  {receipt.cardLast4 ? `${receipt.paymentMethod} •••• ${receipt.cardLast4}` : receipt.paymentMethod}
                </span>
              </div>
            </div>

            {/* Sello Criptográfico SHA-256 */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  Sello Criptográfico Inmutable de Depósito
                </span>
                <button
                  type="button"
                  onClick={handleCopySeal}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedHash ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Sello</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-xs text-emerald-950 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200 select-all break-all">
                {receipt.sha256Seal}
              </p>
            </div>
          </div>
        ) : (
          /* PANTALLA DE PROCESO DE FONDEO (HU-05) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda (7 cols): Resumen Legal + Calendario de Hitos + Selector de Pago */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. RESUMEN LEGAL DEL ACUERDO: Freelancer seleccionado + Proyecto */}
              <section className="bg-white rounded-3xl p-6 border border-[#C9B8A6]/60 shadow-[0_10px_30px_-15px_rgba(90,15,36,0.08)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#C9B8A6]/30">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#8C2C45]" />
                    Resumen Legal del Acuerdo
                  </h2>
                  <span className="text-[11px] text-[#5A0F24]/70 font-mono">
                    Contrato #{contract?.id?.slice(0, 8)}
                  </span>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F3EFE6]/50 border border-[#C9B8A6]/50">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8C2C45] to-[#5A0F24] text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                    {contract?.avatarInitials || 'MV'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-[#5A0F24]">
                        {contract?.freelancerName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Especialista Seleccionado
                      </span>
                    </div>
                    <p className="text-xs text-[#5A0F24]/80">
                      {contract?.freelancerRole}
                    </p>
                    <p className="text-xs text-[#8C2C45] font-semibold pt-0.5">
                      Proyecto: <strong>{contract?.projectTitle}</strong>
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. CALENDARIO Y CRONOGRAMA DE HITOS */}
              <section className="bg-white rounded-3xl p-6 border border-[#C9B8A6]/60 shadow-[0_10px_30px_-15px_rgba(90,15,36,0.08)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#C9B8A6]/30">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#8C2C45]" />
                    Calendario de Hitos y Entregables ({contract?.milestones?.length || 0})
                  </h3>
                  <span className="text-[11px] font-bold text-[#8C2C45]">
                    Subtotal: {formatMoney(subtotal)}
                  </span>
                </div>

                <div className="space-y-3">
                  {(contract?.milestones || []).map((ms) => (
                    <div
                      key={ms.id}
                      className="p-4 rounded-2xl bg-[#fbf9f6] border border-[#C9B8A6]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-[#8C2C45]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#8C2C45] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {ms.order}
                          </span>
                          <h4 className="text-xs font-extrabold text-[#5A0F24]">
                            {ms.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#5A0F24]/75 pl-7 leading-relaxed">
                          {ms.description}
                        </p>
                        <div className="flex items-center gap-3 pl-7 text-[10px] text-[#5A0F24]/60 font-semibold pt-1">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#8C2C45]" />
                            {ms.deliveryDays} días pactados
                          </span>
                          {ms.dueDate && (
                            <span>• Fecha estimada: {ms.dueDate}</span>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 pl-7 sm:pl-0">
                        <span className="text-sm font-black text-[#5A0F24]">
                          {formatMoney(ms.amount)}
                        </span>
                        <span className="block text-[10px] font-bold text-[#8C2C45]">
                          {currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. SELECTOR DE MÉTODO DE PAGO O FORMULARIO RÁPIDO DE TARJETA */}
              <section className="bg-white rounded-3xl p-6 border border-[#C9B8A6]/60 shadow-[0_10px_30px_-15px_rgba(90,15,36,0.08)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#C9B8A6]/30">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#8C2C45]" />
                    Método de Pago para la Retención en Custodia
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Cifrado Seguro PCI-DSS
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Opción 1: Tarjetas registradas */}
                  {savedCards.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-[#5A0F24] block">
                        Tus Tarjetas Guardadas:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedCards.map((card) => {
                          const isSelected =
                            paymentType === 'saved_card' &&
                            selectedCardId === card.id;

                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => {
                                setPaymentType('saved_card');
                                setSelectedCardId(card.id);
                                setShowNewCardForm(false);
                              }}
                              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#F3EFE6] border-[#8C2C45] shadow-xs ring-2 ring-[#8C2C45]/20'
                                  : 'bg-white border-[#C9B8A6]/60 hover:border-[#8C2C45]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#8C2C45]/15 text-[#8C2C45] flex items-center justify-center shrink-0">
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-extrabold text-[#5A0F24]">
                                    {card.brand} •••• {card.last4}
                                  </p>
                                  <p className="text-[10px] text-[#5A0F24]/65">
                                    Vence: {card.expMonth}/{card.expYear}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  isSelected
                                    ? 'border-[#8C2C45] bg-[#8C2C45]'
                                    : 'border-[#C9B8A6]'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Opción 2: Formulario rápido para nueva tarjeta */}
                  <div className="pt-2">
                    {!showNewCardForm ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCardForm(true);
                          setPaymentType('new_card');
                        }}
                        className="py-2.5 px-4 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] border border-[#C9B8A6]/70 text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#8C2C45]" />
                        <span>Pagar con una nueva tarjeta de crédito o débito</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#F3EFE6]/50 border border-[#C9B8A6]/60 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#C9B8A6]/30">
                          <span className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-[#8C2C45]" />
                            Formulario Rápido de Tarjeta
                          </span>
                          {savedCards.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewCardForm(false);
                                setPaymentType('saved_card');
                              }}
                              className="text-xs font-bold text-[#8C2C45] hover:underline"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>

                        <CardInputForm
                          onRegisterCard={handleRegisterNewCard}
                          isSubmitting={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Columna Derecha (5 cols): Desglose Financiero + Botón de Acción + Garantías */}
            <div className="lg:col-span-5 space-y-6 sticky top-24">
              {/* DESGLOSE FINANCIERO TRANSPARENTE */}
              <section className="bg-white rounded-3xl p-6 border-2 border-[#C9B8A6]/70 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.12)] space-y-5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5 pb-3 border-b border-[#C9B8A6]/40">
                  <ShieldCheck className="w-4 h-4 text-[#8C2C45]" />
                  Desglose Financiero Transparente
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[#5A0F24]">
                    <span>Monto neto del trabajo ({contract?.milestones?.length} hitos):</span>
                    <strong className="font-extrabold">{formatMoney(subtotal)}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[#5A0F24]">
                    <span className="flex items-center gap-1">
                      <span>Tarifa de servicio y protección Escrow (10%):</span>
                      <Info className="w-3.5 h-3.5 text-[#8C2C45]" title="Cubre administración de custodia, verificación técnica y mediación." />
                    </span>
                    <strong className="font-extrabold">{formatMoney(serviceFee)}</strong>
                  </div>

                  <div className="pt-3 border-t-2 border-[#C9B8A6]/40 flex items-baseline justify-between text-base font-black text-[#5A0F24]">
                    <span>Total a Retener:</span>
                    <span className="text-xl sm:text-2xl text-[#8C2C45] tracking-tight">
                      {formatMoney(totalToLock)}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5A0F24]/70 pt-1 leading-relaxed">
                    * El dinero se retiene de forma inmutable en una cuenta de garantía neutral y solo se transfiere al especialista conforme apruebes cada hito.
                  </p>
                </div>

                {/* BOTÓN DE ACCIÓN PRINCIPAL */}
                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(true)}
                  disabled={isProcessing}
                  data-testid="btn-autorizar-custodia"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#8C2C45] hover:bg-[#5A0F24] active:bg-[#481a27] text-white text-sm font-black shadow-[0_8px_25px_-5px_rgba(140,44,69,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Autorizar y Depositar en Custodia</span>
                </button>

                {/* Explicación de Garantía */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-extrabold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Garantía de Satisfacción Escrow</span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                    Si el entregable no cumple con lo estipulado en el acuerdo, puedes solicitar ajustes o correcciones técnicas sin límite antes de liberar el dinero.
                  </p>
                </div>
              </section>

              {/* Beneficios de Seguridad */}
              <div className="bg-[#F3EFE6]/60 rounded-3xl p-5 border border-[#C9B8A6]/50 space-y-3 text-xs text-[#5A0F24]">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C2C45] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tu acuerdo incluye:
                </h4>
                <ul className="space-y-2 text-[11px] text-[#5A0F24]/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Protección contra anticipos no respaldados por código o diseño.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Comprobante digital formal descargable con huella criptográfica.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Inicio inmediato del proyecto tras la confirmación de depósito.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMACIÓN VISUAL DE SEGURIDAD ANTES DEL COBRO */}
        {isSecurityModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            data-testid="modal-seguridad-fondeo"
            className="fixed inset-0 z-50 bg-[#2b1b1e]/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          >
            <div className="bg-white rounded-3xl max-w-lg w-full border border-[#C9B8A6]/60 shadow-[0_25px_65px_-15px_rgba(90,15,36,0.35)] overflow-hidden space-y-5 p-6 sm:p-7">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#5A0F24]">
                    Confirmar Retención en Custodia Escrow
                  </h3>
                  <p className="text-xs text-[#5A0F24]/75">
                    Verificación de seguridad previa a la formalización
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3EFE6]/60 border border-[#C9B8A6]/60 space-y-2.5 text-xs text-[#5A0F24]">
                <div className="flex items-center justify-between">
                  <span>Especialista a contratar:</span>
                  <strong>{contract?.freelancerName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hitos convenidos:</span>
                  <strong>{contract?.milestones?.length} entregables</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Método de cobro:</span>
                  <strong>
                    {paymentType === 'saved_card' && selectedCard
                      ? `${selectedCard.brand} •••• ${selectedCard.last4}`
                      : 'Tarjeta de Crédito / Débito'}
                  </strong>
                </div>
                <div className="pt-2 border-t border-[#C9B8A6]/40 flex items-center justify-between text-sm font-black text-[#8C2C45]">
                  <span>Total a depositar:</span>
                  <span>{formatMoney(totalToLock)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Al confirmar, se bloquearán <strong>{formatMoney(totalToLock)}</strong> en la cuenta de custodia. El especialista comenzará a trabajar de inmediato y el dinero solo se liberará conforme apruebes cada hito.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(false)}
                  disabled={isProcessing}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#5A0F24] hover:bg-[#F3EFE6] border border-[#C9B8A6] transition-colors cursor-pointer"
                >
                  Volver a revisar
                </button>

                <button
                  type="button"
                  onClick={handleProcessFunding}
                  disabled={isProcessing}
                  data-testid="btn-confirmar-deposito-modal"
                  className="py-2.5 px-5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-black transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Procesando depósito...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirmar y Autorizar Depósito</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

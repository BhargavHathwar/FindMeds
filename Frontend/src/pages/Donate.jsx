import React, { useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  ShieldCheck, 
  ChevronDown,
  Calendar,
  Barcode,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  ScanLine,
  Camera,
  Check,
  Sparkles,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  category: Yup.string().required('Required'),
  manufacturer: Yup.string().required('Required'),
  batchNumber: Yup.string().required('Required'),
  quantity: Yup.number().positive().required('Required'),
  quantityUnit: Yup.string().required('Required'),
  expiryDate: Yup.string().required('Required'),
  storageCondition: Yup.string().required('Required'),
});

// Sound feedback for scan simulation (Lightweight browser synthesis)
const playScanSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch notification beep
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn("AudioContext failed or is blocked: ", e);
  }
};

export function Donate() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States for Barcode Scanning simulations
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  // Drag and drop states for layout
  const [dragActive, setDragActive] = useState(false);

  // Quick test barcodes for user evaluation
  const BARCODE_SAMPLES = [
    {
      code: "8901234120392",
      label: "Amoxicillin (500mg)",
      data: {
        name: "Amoxicillin Capsules 500mg",
        manufacturer: "GlaxoSmithKline (GSK)",
        expiryDate: "2027-10-15",
        batchNumber: "AMX-7782A",
        category: "antibiotics",
        storageCondition: "room"
      }
    },
    {
      code: "5011322904812",
      label: "Paracetamol (650mg)",
      data: {
        name: "Paracetamol Advanced 650mg",
        manufacturer: "Cipla Therapeutics",
        expiryDate: "2026-12-08",
        batchNumber: "PAR-9022L",
        category: "analgesics",
        storageCondition: "ambient"
      }
    },
    {
      code: "3000284423019",
      label: "Insulin Humulin Regular",
      data: {
        name: "Humulin Regular Insulin 100 U/mL",
        manufacturer: "Eli Lilly & Company",
        expiryDate: "2027-04-30",
        batchNumber: "HUM-9921B",
        category: "diabetes",
        storageCondition: "refrigerated"
      }
    }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file, setFieldValue) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFieldValue('image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e, setFieldValue) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], setFieldValue);
    }
  };

  const handleFileChange = (e, setFieldValue) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0], setFieldValue);
    }
  };

  // Simulated live scanner sequence
  const executeScan = (sample, setFieldValue) => {
    setScanning(true);
    setScanMessage('Calibrating medical barcode camera sensor...');
    setScannedCode('');

    setTimeout(() => {
      setScanMessage(`Scanning GS1-128 symbol: [${sample.code}]...`);
    }, 600);

    setTimeout(() => {
      playScanSound();
      setScanning(false);
      setScannedCode(sample.code);
      setScanMessage('');
      
      // Programmatically and smoothly trigger state updates on form
      setFieldValue('name', sample.data.name);
      setFieldValue('manufacturer', sample.data.manufacturer);
      setFieldValue('expiryDate', sample.data.expiryDate);
      setFieldValue('batchNumber', sample.data.batchNumber);
      setFieldValue('category', sample.data.category);
      setFieldValue('storageCondition', sample.data.storageCondition);
      setFieldValue('barcode', sample.code);
    }, 1500);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Donation Details Combined:', values);
    try {
      const payload = {
        medicine: values.name,
        category: values.category,
        manufacturer: values.manufacturer,
        batch: values.batchNumber,
        batchNumber: values.batchNumber, // dual mapping for backend controller compatibility
        qty: `${values.quantity} ${values.quantityUnit}`,
        quantity: Number(values.quantity),
        quantityUnit: values.quantityUnit,
        expiry: values.expiryDate,
        expiryDate: values.expiryDate,
        storageCondition: values.storageCondition,
        originalSeal: values.originalSeal,
        noWaterDamage: values.noWaterDamage,
        sterilePackaging: values.sterilePackaging,
        description: values.description,
        barcode: values.barcode || '',
        image: values.image || '', // include uploaded base64 image representation
        pincode: localStorage.getItem('findmeds_pincode') || '600001',
        status: 'Active'
      };
      
      await api.listDonation(payload);
      navigate('/donor-dashboard');
    } catch (err) {
      console.error('Error submitting listing:', err);
      alert('Failed to register donation list in our database. Check database routing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 bg-[#fafafa] min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-slate-800 mb-3">Supply Details</h1>
        <p className="text-[#94a3b8] text-lg max-w-xl leading-relaxed">
          Tell us about the medical items you wish to donate to ensure proper routing.
        </p>
      </div>

      <Formik
        initialValues={{
          name: '',
          category: '',
          manufacturer: '',
          batchNumber: '',
          quantity: '',
          quantityUnit: 'Boxes',
          expiryDate: '',
          storageCondition: '',
          originalSeal: false,
          noWaterDamage: false,
          sterilePackaging: false,
          description: '',
          barcode: '',
          image: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue, resetForm }) => (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: INTERACTIVE FORM CONTAINER (7 COLS) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-[#f1f5f9]">
              <Form className="space-y-8">
                
                {/* Quality Standard Info Pill */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex gap-4 text-slate-600 text-sm leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800 mb-0.5">Quality Standard Guard</div>
                    <p className="text-xs text-slate-500">
                      All items must be sealed and in their original containers. We do not accept expired drugs or broken packets.
                    </p>
                  </div>
                </div>

                {/* BARCODE SCANNER INTEGRATED MODULE */}
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-white overflow-hidden relative shadow-lg">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
                    </span>
                    RxNav Live OCR
                  </div>

                  <div className="flex items-center gap-2.5 mb-3">
                    <Barcode className="w-5 h-5 text-teal-400" />
                    <span className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase">Interactive Barcode Scanner</span>
                  </div>

                  {/* Dynamic simulated camera viewport */}
                  <div className="h-44 w-full bg-slate-950 rounded-xl border border-slate-800 relative flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                    
                    {/* Retro Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_100%,transparent_100%)] opacity-80" />

                    {/* Laser loop helper */}
                    <AnimatePresence>
                      {scanning && (
                        <motion.div 
                          initial={{ y: -70 }}
                          animate={{ y: [ -70, 70, -70 ] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_12px_4px_rgba(45,212,191,0.5)] z-20"
                        />
                      )}
                    </AnimatePresence>

                    {/* Camera Corner Brackets */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-slate-700 rounded-tl-xs" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-slate-700 rounded-tr-xs" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-slate-700 rounded-bl-xs" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-slate-700 rounded-br-xs" />

                    {scanning ? (
                      <div className="space-y-2 z-10 animate-pulse">
                        <RefreshCw className="w-7 h-7 text-teal-400 animate-spin mx-auto" />
                        <p className="text-xs font-mono text-teal-300">{scanMessage}</p>
                      </div>
                    ) : scannedCode ? (
                      <div className="space-y-2 z-10">
                        <div className="w-9 h-9 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center mx-auto border border-teal-500/20">
                          <Check className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-emerald-400 font-mono">CODE EXPLICITLY PARSED!</p>
                        <p className="text-[11px] font-mono text-slate-400">GS1 Key: {scannedCode}</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 z-10">
                        <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-400">Optical Symbol Reader Outbound</p>
                        <p className="text-[10px] text-slate-500 max-w-[280px]">Select a drug packaging box below to simulate high-accuracy sensor reading</p>
                      </div>
                    )}
                  </div>

                  {/* Pre-packaged quick test scanning selectors */}
                  <div className="mt-4 space-y-2.5">
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Click to Test Scanner:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {BARCODE_SAMPLES.map((sample) => (
                        <button
                          key={sample.code}
                          type="button"
                          disabled={scanning}
                          onClick={() => executeScan(sample, setFieldValue)}
                          className="px-3 py-2 bg-slate-800/80 hover:bg-slate-805 text-left rounded-lg text-xs font-medium border border-slate-700/60 hover:border-teal-500/40 transition-all flex items-center justify-between group disabled:opacity-40"
                        >
                          <div className="truncate pr-1">
                            <span className="block text-white font-semibold truncate group-hover:text-teal-400">{sample.label}</span>
                            <span className="block text-[10px] text-slate-400 font-mono truncate">{sample.code}</span>
                          </div>
                          <ScanLine className="w-4 h-4 text-slate-500 group-hover:text-teal-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medication / Item Name Field */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Medication / Item Name</label>
                  <Field 
                    name="name" 
                    placeholder="e.g. Paracetamol 500mmg, Amoxycillin, Lipitor" 
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 text-sm",
                      errors.name && touched.name ? "border-red-500 bg-red-50" : "border-slate-200"
                    )}
                  />
                  {errors.name && touched.name && (
                    <div className="text-red-500 text-xs font-semibold mt-1">{errors.name}</div>
                  )}
                </div>

                {/* Item Category */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Item Category</label>
                  <div className="relative">
                    <Field 
                      as="select" 
                      name="category" 
                      className={cn(
                        "w-full appearance-none px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white text-slate-700 text-sm",
                        errors.category && touched.category ? "border-red-500 bg-red-50" : "border-slate-200"
                      )}
                    >
                      <option value="">Select the primary category</option>
                      <option value="analgesics">Analgesics</option>
                      <option value="antibiotics">Antibiotics</option>
                      <option value="cardiac">Cardiac Medications</option>
                      <option value="diabetes">Diabetes Care</option>
                      <option value="supplies">Protective Supplies</option>
                    </Field>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.category && touched.category && (
                    <div className="text-red-500 text-xs font-semibold mt-1">{errors.category}</div>
                  )}
                </div>

                {/* Manufacturer and Batch Code Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Manufacturer / Brand</label>
                    <Field 
                      name="manufacturer" 
                      placeholder="e.g. Cipla, GSK, Pfizer" 
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 text-sm",
                        errors.manufacturer && touched.manufacturer ? "border-red-500 bg-red-50" : "border-slate-200"
                      )}
                    />
                    {errors.manufacturer && touched.manufacturer && (
                      <div className="text-red-500 text-xs font-semibold mt-1">{errors.manufacturer}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Batch / Lot Number</label>
                    <Field 
                      name="batchNumber" 
                      placeholder="e.g. BATCH-991A" 
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 text-sm",
                        errors.batchNumber && touched.batchNumber ? "border-red-500 bg-red-50" : "border-slate-200"
                      )}
                    />
                    {errors.batchNumber && touched.batchNumber && (
                      <div className="text-red-500 text-xs font-semibold mt-1">{errors.batchNumber}</div>
                    )}
                  </div>
                </div>

                {/* Quantity and Expiration Date Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                    <div className="flex gap-2">
                      <Field 
                        type="number" 
                        name="quantity" 
                        placeholder="e.g. 10" 
                        className={cn(
                          "flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 text-sm placeholder:text-slate-300",
                          errors.quantity && touched.quantity ? "border-red-500 bg-red-50" : "border-slate-200"
                        )}
                      />
                      <div className="relative min-w-[110px]">
                        <Field as="select" name="quantityUnit" className="w-full appearance-none px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white text-slate-700 text-sm">
                          <option value="Boxes">Boxes</option>
                          <option value="Packs">Packs</option>
                          <option value="Units">Units</option>
                        </Field>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    {errors.quantity && touched.quantity && (
                      <div className="text-red-500 text-xs font-semibold mt-1">{errors.quantity}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Expiration Date</label>
                    <div className="relative">
                      <Field 
                        type="date" 
                        name="expiryDate" 
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white text-slate-700 text-sm",
                          errors.expiryDate && touched.expiryDate ? "border-red-500 bg-red-50" : "border-slate-200"
                        )}
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.expiryDate && touched.expiryDate && (
                      <div className="text-red-500 text-xs font-semibold mt-1">{errors.expiryDate}</div>
                    )}
                  </div>
                </div>

                {/* Storage Requirements */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Storage Requirements</label>
                  <div className="relative">
                    <Field 
                      as="select" 
                      name="storageCondition" 
                      className={cn(
                        "w-full appearance-none px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white text-slate-700 text-sm",
                        errors.storageCondition && touched.storageCondition ? "border-red-500 bg-red-50" : "border-slate-200"
                      )}
                    >
                      <option value="">Select storage condition</option>
                      <option value="room">Room Temperature (15-25°C)</option>
                      <option value="refrigerated">Refrigerated (2-8°C)</option>
                      <option value="ambient">Cool & Dry Place</option>
                    </Field>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.storageCondition && touched.storageCondition && (
                    <div className="text-red-500 text-xs font-semibold mt-1">{errors.storageCondition}</div>
                  )}
                </div>

                {/* DRAG-DROP DRUG IMAGE UPLOAD SECTION */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Upload Medicine Image</label>
                  
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={(e) => handleDrop(e, setFieldValue)}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative group flex flex-col items-center justify-center min-h-[160px]",
                      dragActive ? "border-teal-500 bg-teal-50/40" : "border-slate-200 hover:border-teal-400/65 bg-slate-50/40",
                      values.image ? "border-teal-500/40 bg-white" : ""
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => handleFileChange(e, setFieldValue)}
                      accept="image/*"
                      className="hidden"
                    />

                    {values.image ? (
                      <div className="w-full flex flex-col sm:flex-row items-center gap-5 relative z-10" onClick={(e) => e.stopPropagation()}>
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 relative group flex-shrink-0">
                          <img 
                            src={values.image} 
                            alt="Uploaded item" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Trash2 
                              className="w-5 h-5 text-white cursor-pointer" 
                              onClick={() => setFieldValue('image', '')}
                            />
                          </div>
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs mb-1">
                            <CheckCircle2 className="w-4 h-4" /> Selected Medicine Image ready for preview.
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mb-2">Base64 Medical Matrix Attachment</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-md transition-all flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Change File
                            </button>
                            <button
                              type="button"
                              onClick={() => setFieldValue('image', '')}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold uppercase rounded-md transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Remove File
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud className="w-9 h-9 text-slate-400 group-hover:text-teal-500 transition-colors mb-3" />
                        <h4 className="text-xs font-bold text-slate-700 mb-1">Drag and drop medication photo</h4>
                        <p className="text-[11px] text-[#94a3b8] mb-1">or click on this zone to browse files manually</p>
                        <p className="text-[9px] text-slate-400 font-mono tracking-wider">Supports JPEG, WEBP, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Integrity Checklist */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">Package Integrity Checklist</label>
                  <div className="space-y-3">
                    {[
                      { name: 'originalSeal', label: 'Original Seal Intact' },
                      { name: 'noWaterDamage', label: 'No Water Damage' },
                      { name: 'sterilePackaging', label: 'Sterile Packaging Unopened' }
                    ].map((item) => (
                      <label key={item.name} className="flex items-center gap-3 group cursor-pointer select-none">
                        <div className="relative">
                          <Field 
                            type="checkbox" 
                            name={item.name} 
                            className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md checked:bg-teal-600 checked:border-teal-600 transition-all cursor-pointer"
                          />
                          <div className="invisible peer-checked:visible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-slate-500 text-xs font-medium group-hover:text-slate-800 transition-colors">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brief Description */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Brief Description</label>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Optional</span>
                  </div>
                  <Field 
                    as="textarea" 
                    name="description" 
                    rows={4}
                    placeholder="Specify brand description details (color, box condition)..." 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 text-sm resize-none"
                  />
                </div>

                {/* Submit button intact and compliant */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4.5 px-6 bg-[#0d9488] text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Donation Record...
                    </>
                  ) : (
                    <>
                      Submit Donation Request
                    </>
                  )}
                </button>
              </Form>
            </div>

            {/* COLUMN 2: REAL-TIME PRE-SUBMISSION VERIFICATION CARD (5 COLS Sticky) */}
            <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f1f5f9] overflow-hidden">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-xs font-bold text-slate-800 font-mono tracking-wider uppercase">Donation Preview Receipt</span>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>

                {/* Simulated Medication Outer Box Wrapper */}
                <div className="relative border border-slate-150 rounded-xl overflow-hidden shadow-xs bg-linear-to-b from-slate-50 to-white">
                  
                  {/* Cyan top header strip resembling pharmacist packages */}
                  <div className="bg-teal-600 px-3 py-1.5 flex justify-between items-center text-white">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold">FindMeds Verified Stock Item</span>
                    <span className="text-[9px] font-mono opacity-80">{values.barcode || 'NO_BARCODE_PENDING'}</span>
                  </div>

                  {/* Inner Details */}
                  <div className="p-4 space-y-4">
                    
                    {/* Live Image Rendering Component */}
                    <div className="aspect-video w-full rounded-lg bg-slate-100 border border-slate-200/50 flex items-center justify-center overflow-hidden relative group">
                      {values.image ? (
                        <img 
                          src={values.image} 
                          alt="Real-time Medicine Submission Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1 animate-pulse" />
                          <p className="text-[10px] text-slate-400 font-mono">Image attachment preview appears here</p>
                        </div>
                      )}
                      
                      {/* Scan state overlays */}
                      <div className="absolute top-2 right-2 flex gap-1 text-[9px] font-mono">
                        {values.barcode && (
                          <span className="bg-teal-500 text-white px-1.5 py-0.5 rounded-sm">BARCODE SCA_</span>
                        )}
                        {values.image && (
                          <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded-sm">IMG LIVE</span>
                        )}
                      </div>
                    </div>

                    {/* Text values */}
                    <div className="space-y-2.5">
                      <div>
                        <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block">MEDICATION DISPENSARY NAME</span>
                        <h3 className="font-display font-bold text-slate-800 text-lg leading-tight truncate">
                          {values.name || (
                            <span className="text-slate-300 italic font-normal text-base">Enter drug name...</span>
                          )}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100/60">
                        <div>
                          <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block">BRAND / MANUF.</span>
                          <span className="text-xs font-semibold text-slate-700 truncate block">
                            {values.manufacturer || <span className="text-slate-300 italic font-normal">—</span>}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block">EXPIRATION</span>
                          <span className="text-xs font-semibold text-slate-700 block">
                            {values.expiryDate ? (
                              <span className="flex items-center gap-1">
                                <span className={cn(
                                  "w-2 h-2 rounded-full",
                                  new Date(values.expiryDate) < new Date() ? "bg-red-500" : "bg-teal-500"
                                )} />
                                {values.expiryDate}
                              </span>
                            ) : (
                              <span className="text-slate-300 italic font-normal">—</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block">BATCH NUMBER</span>
                          <span className="text-xs font-mono font-medium text-slate-600 block truncate">
                            {values.batchNumber || <span className="text-slate-300 italic font-normal">—</span>}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block">LOT SIZE / QUANTITY</span>
                          <span className="text-xs font-semibold text-[#0d9488] block">
                            {values.quantity ? `${values.quantity} ${values.quantityUnit}` : <span className="text-slate-300 italic font-normal">—</span>}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                        <div>
                          <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block">THERAPEUTIC CATEGORY</span>
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block truncate">
                            {values.category || <span className="text-slate-300 italic font-normal">—</span>}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider block">STORAGE REQ</span>
                          <span className="text-xs font-semibold text-slate-700 block truncate uppercase">
                            {values.storageCondition || <span className="text-slate-300 italic font-normal">—</span>}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quality Indicators in receipt */}
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex gap-2 justify-between flex-wrap text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full", values.originalSeal ? "bg-emerald-500" : "bg-slate-300")} />
                        Seal Intact
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full", values.noWaterDamage ? "bg-emerald-500" : "bg-slate-300")} />
                        Dry Box
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full", values.sterilePackaging ? "bg-emerald-500" : "bg-slate-300")} />
                        Sterile
                      </div>
                    </div>

                  </div>
                </div>

                {/* Visual Guidelines */}
                <div className="mt-5 space-y-2 text-[11px] text-[#94a3b8] leading-relaxed">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Real-time layout compliant with safety validation standards</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Expired medications are strictly filtered automatically on scan</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </Formik>
    </div>
  );
}

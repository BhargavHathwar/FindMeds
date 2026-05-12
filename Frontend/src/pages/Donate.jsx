import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ChevronDown,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object().shape({
  category: Yup.string().required('Required'),
  manufacturer: Yup.string().required('Required'),
  batchNumber: Yup.string().required('Required'),
  quantity: Yup.number().positive().required('Required'),
  quantityUnit: Yup.string().required('Required'),
  expiryDate: Yup.string().required('Required'),
  storageCondition: Yup.string().required('Required'),
});

export function Donate() {
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    console.log('Donation Details:', values);
    // Simulate submission
    setTimeout(() => {
      navigate('/donor-dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 bg-[#fafafa] min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-[#8ba3b8] mb-3">Supply Details</h1>
        <p className="text-[#94a3b8] text-lg max-w-xl leading-relaxed">
          Tell us about the medical items you wish to donate to ensure proper routing.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-[#f1f5f9]">
        <Formik
          initialValues={{
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
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form className="space-y-8">
              {/* Quality Standard Info Box */}
              <div className="bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl p-6 flex gap-4 text-[#475569] text-sm leading-relaxed">
                <ShieldCheck className="w-6 h-6 text-[#4d7c0f] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1e293b] mb-1">Quality Standard</div>
                  <p>
                    For patient safety, all items must be unexpired, sealed, and in their original packaging. 
                    We cannot accept opened sterile equipment.
                  </p>
                </div>
              </div>

              {/* Item Category */}
              <div>
                <label className="block text-sm font-bold text-[#334155] mb-2">Item Category</label>
                <div className="relative">
                  <Field as="select" name="category" className="w-full appearance-none px-4 py-3.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-brand-primary outline-none bg-white text-[#64748b]">
                    <option value="">Select the primary category</option>
                    <option value="analgesics">Analgesics</option>
                    <option value="antibiotics">Antibiotics</option>
                    <option value="cardiac">Cardiac Medications</option>
                    <option value="diabetes">Diabetes Care Care</option>
                    <option value="supplies">Protective Supplies</option>
                  </Field>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] pointer-events-none" />
                </div>
              </div>

              {/* Manufacturer and Batch Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#334155] mb-2">Manufacturer / Brand</label>
                  <Field 
                    name="manufacturer" 
                    placeholder="e.g. 3M, Johnson & Johnson" 
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-[#cbd5e1]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#334155] mb-2">Batch / Lot Number</label>
                  <Field 
                    name="batchNumber" 
                    placeholder="e.g. LOT12345" 
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-[#cbd5e1]"
                  />
                </div>
              </div>

              {/* Quantity and Expiration Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="block text-sm font-bold text-[#334155] mb-2">Quantity</label>
                  <div className="flex gap-2">
                    <Field 
                      type="number" 
                      name="quantity" 
                      placeholder="e.g. 50" 
                      className="flex-1 px-4 py-3.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-brand-primary outline-none placeholder:text-[#cbd5e1]"
                    />
                    <div className="relative min-w-[110px]">
                      <Field as="select" name="quantityUnit" className="w-full appearance-none px-4 py-3.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-brand-primary outline-none bg-white text-[#64748b]">
                        <option value="Boxes">Boxes</option>
                        <option value="Packs">Packs</option>
                        <option value="Units">Units</option>
                      </Field>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#334155] mb-2">Expiration Date</label>
                  <div className="relative">
                    <Field 
                      type="date" 
                      name="expiryDate" 
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-brand-primary outline-none bg-white text-[#64748b]"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Storage Requirements */}
              <div>
                <label className="block text-sm font-bold text-[#334155] mb-2">Storage Requirements</label>
                <div className="relative">
                  <Field as="select" name="storageCondition" className="w-full appearance-none px-4 py-3.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-brand-primary outline-none bg-white text-[#64748b]">
                    <option value="">Select storage condition</option>
                    <option value="room">Room Temperature (15-25°C)</option>
                    <option value="refrigerated">Refrigerated (2-8°C)</option>
                    <option value="ambient">Cool & Dry Place</option>
                  </Field>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] pointer-events-none" />
                </div>
              </div>

              {/* Integrity Checklist */}
              <div>
                <label className="block text-sm font-bold text-[#334155] mb-4">Package Integrity Checklist</label>
                <div className="space-y-3">
                  {[
                    { name: 'originalSeal', label: 'Original Seal Intact' },
                    { name: 'noWaterDamage', label: 'No Water Damage' },
                    { name: 'sterilePackaging', label: 'Sterile Packaging Unopened' }
                  ].map((item) => (
                    <label key={item.name} className="flex items-center gap-3 group cursor-pointer">
                      <div className="relative">
                        <Field 
                          type="checkbox" 
                          name={item.name} 
                          className="peer appearance-none w-6 h-6 border-2 border-[#e2e8f0] rounded-md checked:bg-brand-primary checked:border-brand-primary transition-all"
                        />
                        <div className="invisible peer-checked:visible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-[#64748b] font-medium group-hover:text-[#1e293b] transition-colors">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brief Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-[#334155]">Brief Description</label>
                  <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Optional</span>
                </div>
                <Field 
                  as="textarea" 
                  name="description" 
                  rows={4}
                  placeholder="Specify brand, size, or condition details..." 
                  className="w-full px-4 py-4 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-[#cbd5e1] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 px-8 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/25 hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing...' : 'Submit Donation Request'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

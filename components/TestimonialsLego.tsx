import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Testimonial } from '../types';
import { EditableText } from './ui/Editable';

interface TestimonialsLegosProps {
  content: {
    sectionTitle?: string;
    sectionSubtitle?: string;
    items: Testimonial[];
  };
  styles: any;
  onUpdate?: (newContent: any) => void;
  readOnly?: boolean;
  theme?: any;
}

const TestimonialsLego: React.FC<TestimonialsLegosProps> = ({ content, styles, onUpdate, readOnly, theme }) => {
  if (!content?.items || content.items.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-32 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <EditableText 
            tag="h3" 
            className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2" 
            value={content.sectionSubtitle} 
            onChange={(val) => onUpdate && onUpdate({ ...content, sectionSubtitle: val })} 
            placeholder="Livre d'Or"
            readOnly={readOnly}
          />
          <EditableText 
            tag="h2" 
            className="text-4xl md:text-5xl font-bold text-white font-serif" 
            value={content.sectionTitle} 
            onChange={(val) => onUpdate && onUpdate({ ...content, sectionTitle: val })} 
            placeholder="Ce que disent nos clients"
            readOnly={readOnly}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.items.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#111] border border-white/5 p-8 rounded-3xl flex flex-col"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={`${i < testimonial.rating ? 'text-gold-400 fill-current' : 'text-gray-600'}`} />
                ))}
              </div>
              <p className="text-gray-300 mb-6 flex-grow">"{testimonial.review}"</p>
              <p className="font-bold text-white">- {testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsLego;

import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Testimonial } from '../types';

interface TestimonialsLegosProps {
  items: Testimonial[];
  styles: any;
  title?: string;
}

const TestimonialsLego: React.FC<TestimonialsLegosProps> = ({ items, styles, title }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-32 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-[#FFD700] text-sm font-bold uppercase tracking-widest mb-2">{title || "Livre d'Or"}</h3>
          <h2 className="text-4xl md:text-5xl font-bold text-white font-serif">Ce que disent nos clients</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((testimonial, idx) => (
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

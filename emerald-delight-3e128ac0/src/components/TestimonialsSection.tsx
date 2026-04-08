import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const defaultTestimonials = [
  { name: "Dr. Priya Nair", role: "Chief Medical Officer, KIMS Hospital", text: "The Summit conference was a game-changer for our quality improvement initiatives. The insights on AI-driven patient safety were invaluable." },
  { name: "Dr. Ahmed Hassan", role: "Quality Director, Saudi German Hospital", text: "An exceptional gathering of healthcare leaders. The networking opportunities alone were worth the attendance." },
  { name: "Ms. Sarah Johnson", role: "VP Quality, Manipal Hospitals", text: "The sustainability track opened our eyes to practical green hospital strategies we've already begun implementing." },
  { name: "Dr. Chen Wei", role: "Research Lead, NUS Medical School", text: "Brilliant presentations and world-class speakers. This is the premier healthcare quality event in Asia." },
];

const TestimonialsSection = () => {
  const testimonials = JSON.parse(localStorage.getItem("summit-testimonials") || "null") || defaultTestimonials;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">What They Say</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Testimonials
          </h2>
        </motion.div>

        <div className="relative">
          <div className="bg-card rounded-xl gold-border p-8 md:p-12 min-h-[220px] flex flex-col items-center justify-center text-center">
            <Quote className="w-8 h-8 text-gold/40 mb-6" />
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-foreground text-lg md:text-xl italic leading-relaxed mb-6 max-w-2xl">
                  "{testimonials[current].text}"
                </p>
                <p className="font-serif font-bold text-foreground">{testimonials[current].name}</p>
                <p className="text-gold text-sm">{testimonials[current].role}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="p-2 rounded-full border border-border hover:border-gold/50 text-muted-foreground hover:text-gold transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-gold" : "bg-border"}`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full border border-border hover:border-gold/50 text-muted-foreground hover:text-gold transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

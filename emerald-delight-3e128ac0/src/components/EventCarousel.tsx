import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { heroApi } from "@/services/hero.services";
import carousel1 from "@/assets/carousel-1.jpg";
import carousel2 from "@/assets/carousel-2.jpg";
import carousel3 from "@/assets/carousel-3.jpg";
import carousel4 from "@/assets/carousel-4.jpg";
import carousel5 from "@/assets/carousel-5.jpg";

const defaultSlides = [
  { src: carousel1, caption: "Grand Auditorium — Opening Ceremony" },
  { src: carousel2, caption: "Keynote Address — Healthcare Innovation" },
  { src: carousel3, caption: "Networking — Industry Leaders Connect" },
  { src: carousel4, caption: "Exhibition Hall — Healthcare Technology" },
  { src: carousel5, caption: "Panel Discussion — Quality & Sustainability" },
];

interface Slide {
  src: string;
  caption: string;
}

const EventCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        const response = await heroApi.get();
        if (response.success && response.data.carousel && response.data.carousel.length > 0) {
          const apiSlides = response.data.carousel.map((item, index) => ({
            src: item.image,
            caption: `Conference Highlight ${index + 1}`,
          }));
          setSlides(apiSlides);
        }
      } catch (error) {
        console.error("Failed to fetch carousel:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarousel();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);

    const interval = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (loading) {
    return (
      <section className="py-16 bg-emerald-dark">
        <div className="container mx-auto px-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-gold" size={32} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-emerald-dark">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Glimpses</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground">
            Conference <span className="text-gradient-gold">Highlights</span>
          </h2>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div ref={emblaRef} className="overflow-hidden rounded-xl">
            <div className="flex">
              {slides.map((slide, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0 px-2">
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <img
                      src={slide.src}
                      alt={slide.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-dark/80 via-transparent to-transparent" />
                    <p className="absolute bottom-4 left-6 right-6 text-primary-foreground/90 text-sm md:text-base font-medium tracking-wide">
                      {slide.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/30 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/30 transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex
                    ? "bg-gold w-6"
                    : "bg-gold/30 hover:bg-gold/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCarousel;

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, ArrowRight } from "lucide-react";

interface SpeakerCardProps {
  id?: string;
  name: string;
  topic: string;
  quote: string;
  image?: string;
  index: number;
}

const SpeakerCard = ({ id, name, topic, quote, image, index }: SpeakerCardProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="bg-card rounded-lg p-8 gold-border gold-glow hover:scale-[1.02] transition-transform duration-300"
    >
      {image ? (
        <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover object-top mb-6 mx-auto" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 mx-auto">
          <User className="w-8 h-8 text-primary" />
        </div>
      )}
      <h3 className="font-serif text-xl font-bold text-foreground text-center mb-2">{name}</h3>
      <p className="text-sm font-medium text-gold text-center mb-4 uppercase tracking-wider">{topic}</p>
      <p className="text-muted-foreground text-sm italic text-center leading-relaxed line-clamp-3">"{quote}"</p>
      {id && (
        <span className="text-gold text-xs uppercase tracking-wider flex items-center justify-center gap-1 mt-4">
          View Profile <ArrowRight size={12} />
        </span>
      )}
    </motion.div>
  );

  if (id) {
    return (
      <Link to={`/speaker/${id}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default SpeakerCard;

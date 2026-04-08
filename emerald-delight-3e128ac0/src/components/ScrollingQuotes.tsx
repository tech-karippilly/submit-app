const quotes = [
  "Transforming Patient Safety Through Global Standards",
  "Integrating AI with Healthcare Quality Systems",
  "Sustainable Hospitals for a Responsible Future",
  "Elevating Kerala's Healthcare to International Excellence",
  "Quality is Not an Act, It is a Habit — Aristotle",
];

const ScrollingQuotes = () => {
  return (
    <div className="bg-emerald-dark overflow-hidden py-4 gold-border border-x-0">
      <div className="animate-scroll-left flex whitespace-nowrap">
        {[...quotes, ...quotes].map((quote, i) => (
          <span
            key={i}
            className="mx-12 text-sm font-medium tracking-widest uppercase text-gold/80"
          >
            ✦ {quote}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ScrollingQuotes;

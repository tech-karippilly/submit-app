import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PolicyPageProps {
  title: string;
  storageKey: string;
  defaultContent: string;
}

const PolicyPage = ({ title, storageKey, defaultContent }: PolicyPageProps) => {
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    document.title = title;
    const saved = localStorage.getItem(storageKey);
    if (saved) setContent(saved);
    return () => { document.title = "The Summit"; };
  }, [title, storageKey]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="gradient-hero text-primary-foreground pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-4xl md:text-5xl font-bold">{title}</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl gold-border p-8 lg:p-12"
          >
            {content.split("\n\n").map((para, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">{para}</p>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export const PrivacyPolicy = () => (
  <PolicyPage
    title="Privacy Policy"
    storageKey="summit-privacy-policy"
    defaultContent={`We at The Summit LLP are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your personal information when you visit our website or attend our events.

We may collect personal information such as your name, email address, phone number, and professional details when you register for our conferences, subscribe to our newsletters, or contact us through our website.

Your information is used solely for the purpose of providing our services, communicating updates about events, and improving your experience. We do not sell or share your personal data with third parties except as required by law.

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.

For any questions regarding this policy, please contact us at info@thesummitllp.com.`}
  />
);

export const RefundPolicy = () => (
  <PolicyPage
    title="Refund Policy"
    storageKey="summit-refund-policy"
    defaultContent={`The Summit LLP strives to ensure complete satisfaction with our events and services. This Refund Policy outlines the terms and conditions for refund requests.

Refund requests must be submitted in writing to info@thesummitllp.com. Requests made 30 or more days before the event will receive a full refund minus a processing fee. Requests made 15–29 days before the event will receive a 50% refund. No refunds will be issued for requests made less than 15 days before the event.

In the event that The Summit LLP cancels an event, all registered participants will receive a full refund. Refunds will be processed within 15 business days of approval.

For any questions regarding refunds, please contact us at info@thesummitllp.com.`}
  />
);

export const CancellationPolicy = () => (
  <PolicyPage
    title="Cancellation Policy"
    storageKey="summit-cancellation-policy"
    defaultContent={`This Cancellation Policy governs the cancellation of registrations for events organized by The Summit LLP.

Participants may cancel their registration by sending a written request to info@thesummitllp.com. Cancellations are subject to the refund terms outlined in our Refund Policy.

The Summit LLP reserves the right to cancel or reschedule events due to unforeseen circumstances, insufficient registrations, or force majeure. In such cases, registered participants will be notified promptly and offered the option of a full refund or transfer to the rescheduled event.

Substitution of registered participants is allowed at no additional cost, provided notification is given at least 7 days before the event.

For any questions regarding cancellations, please contact us at info@thesummitllp.com.`}
  />
);

export const ConfidentialityStatement = () => (
  <PolicyPage
    title="Confidentiality Statement"
    storageKey="summit-confidentiality-statement"
    defaultContent={`The Summit LLP is committed to maintaining the confidentiality of all information shared by participants, speakers, sponsors, and partners in connection with our events and services.

All proprietary information, trade secrets, business strategies, patient data references, research findings, and any other sensitive information disclosed during our conferences, workshops, or consultations shall be treated as strictly confidential.

Attendees, speakers, and partners agree not to disclose, reproduce, or distribute any confidential information obtained during Summit events without prior written consent from the disclosing party.

The Summit LLP implements robust data protection measures to ensure that all confidential information is securely stored and accessible only to authorized personnel on a need-to-know basis.

This confidentiality obligation shall survive the conclusion of any event or engagement and remain in effect indefinitely unless otherwise agreed upon in writing.

Any breach of this confidentiality statement may result in legal action and immediate termination of any ongoing relationship with The Summit LLP.

For questions regarding confidentiality, please contact us at info@thesummitllp.com.`}
  />
);

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Founder from "./pages/Founder";
import FounderDetail from "./pages/FounderDetail";
import Speakers from "./pages/Speakers";
import SpeakerDetail from "./pages/SpeakerDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Conference from "./pages/Conference";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import { PrivacyPolicy, RefundPolicy, CancellationPolicy, ConfidentialityStatement } from "./pages/PolicyPage";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHero from "./pages/admin/AdminHero";
import AdminRegisterUser from "./pages/admin/AdminRegisterUser";
import AdminCarousel from "./pages/admin/AdminCarousel";
import AdminSpeakers from "./pages/admin/AdminSpeakers";
import AdminFounder from "./pages/admin/AdminFounder";
import CreateFounder from "./pages/admin/CreateFounder";
import AdminPolicies from "./pages/admin/AdminPolicies";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventForm from "./pages/admin/AdminEventForm";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminPricing from "./pages/admin/AdminPricing";
import CreatePricing from "./pages/admin/CreatePricing";
import AdminEventTypes from "./pages/admin/AdminEventTypes";
import AdminContact from "./pages/admin/AdminContact";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminEnquiries from "./pages/admin/AdminEnquiries";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import AdminRefunds from "./pages/admin/AdminRefunds";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminThemes from "./pages/admin/AdminThemes";
import Reports from "./pages/admin/Reports";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const savedTheme = localStorage.getItem("summit-theme");
if (savedTheme && savedTheme !== "default" && savedTheme !== "ocean") {
  document.documentElement.setAttribute("data-theme", savedTheme);
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/founder" element={<Founder />} />
                    <Route path="/founder/:id" element={<FounderDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/speakers" element={<Speakers />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/speaker/:id" element={<SpeakerDetail />} />
                              <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/conference" element={<Conference />} />
          <Route path="/register" element={<Register />} />
                    <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/confidentiality-statement" element={<ConfidentialityStatement />} />

          {/* Admin Login */}
          <Route path="/admin" element={<Login />} />

          {/* Admin Dashboard - Protected */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="register-user" element={<AdminRegisterUser />} />
            <Route path="hero" element={<AdminHero />} />
            <Route path="carousel" element={<AdminCarousel />} />
            <Route path="speakers" element={<AdminSpeakers />} />
            <Route path="founder" element={<AdminFounder />} />
            <Route path="founder/create" element={<CreateFounder />} />
            <Route path="founder/edit/:id" element={<CreateFounder />} />
            <Route path="policies" element={<AdminPolicies />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="events/create" element={<AdminEventForm />} />
            <Route path="events/edit/:id" element={<AdminEventForm />} />
            <Route path="event-types" element={<AdminEventTypes />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="pricing/create" element={<CreatePricing />} />
            <Route path="pricing/edit/:id" element={<CreatePricing />} />
            <Route path="email-templates" element={<AdminEmailTemplates />} />
            <Route path="refunds" element={<AdminRefunds />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="themes" element={<AdminThemes />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useEffect, useState } from "react";
import { MessageSquare, Users, Image, Calendar, Loader2, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { dashboardApi, DashboardStats, RecentEnquiry } from "@/services/dashboard.services";

const PAGE_TITLE = "Admin Dashboard";

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = PAGE_TITLE;
    fetchDashboardData();
    return () => {
      document.title = "The Summit";
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats();
      console.log("Dashboard API response:", response);
      if (response.success) {
        setStats(response.data.stats);
        setRecentEnquiries(response.data.recentEnquiries);
      }
    } catch (error) {
      console.error("Dashboard API error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const statsConfig = stats ? [
    { label: "Total Enquiries", value: stats.enquiriesCount.toString(), icon: MessageSquare, color: "text-gold", link: "/admin-dashboard/enquiries" },
    { label: "Speakers Listed", value: stats.speakersCount.toString(), icon: Users, color: "text-emerald-light", link: "/admin-dashboard/speakers" },
    { label: "Events", value: stats.eventsCount.toString(), icon: Calendar, color: "text-gold", link: "/admin-dashboard/events" },
    { label: "Participants", value: stats.participantsCount.toString(), icon: Users, color: "text-emerald-light", link: "/admin-dashboard/registrations" },
    { label: "Carousel Images", value: stats.carouselImagesCount.toString(), icon: Image, color: "text-gold", link: "/admin-dashboard/carousel" },
    { label: "Total Revenue", value: `₹${stats.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: "text-emerald-500", link: "/admin-dashboard/transactions" },
  ] : [];

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your conference management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
        {statsConfig.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-card rounded-xl p-5 border border-border hover:border-gold/30 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={22} className={`${stat.color} group-hover:scale-110 transition-transform`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent enquiries */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-xl font-bold text-foreground">Recent Enquiries</h2>
          <Link to="/admin-dashboard/enquiries" className="text-gold text-sm hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Name</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Subject</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">No enquiries yet</td>
                </tr>
              ) : (
                recentEnquiries.map((e) => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{e.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{e.email}</td>
                    <td className="p-4 text-sm text-muted-foreground truncate max-w-xs">{e.title}</td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(e.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

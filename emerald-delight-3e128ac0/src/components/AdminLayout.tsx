import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Image,
  Users,
  PanelLeft,
  Megaphone,
  LogOut,
  UserCircle,
  CalendarDays,
  Handshake,
  Quote,
  FileText,
  ClipboardList,
  Receipt,
  IndianRupee,
  UserPlus,
  Contact,
  Info,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  LucideIcon,
  Mail,
  RotateCcw,
  Wallet,
  BarChart3,
  Palette,
} from "lucide-react";
import { useAppDispatch } from "@/hooks/useRedux";
import { logout } from "@/store/authSlice";

type SidebarLink = {
  label: string;
  path: string;
  icon: LucideIcon;
};

type SidebarGroup = {
  label: string;
  icon: LucideIcon;
  children: SidebarLink[];
};

type SidebarItem = SidebarLink | SidebarGroup;

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
  { label: "Hero Section", path: "/admin-dashboard/hero", icon: Megaphone },
  { label: "Carousel", path: "/admin-dashboard/carousel", icon: Image },
  { label: "Founders", path: "/admin-dashboard/founder", icon: UserCircle },
  { label: "Policies", path: "/admin-dashboard/policies", icon: FileText },
  {
    label: "Events",
    icon: CalendarDays,
    children: [
      { label: "Speakers", path: "/admin-dashboard/speakers", icon: Users },
      { label: "Events", path: "/admin-dashboard/events", icon: CalendarDays },
      { label: "Event Types", path: "/admin-dashboard/event-types", icon: FileText },
      { label: "Registrations", path: "/admin-dashboard/registrations", icon: ClipboardList },
      { label: "Register User", path: "/admin-dashboard/register-user", icon: UserPlus },
      { label: "Pricing", path: "/admin-dashboard/pricing", icon: IndianRupee },
    ],
  },
  {
    label: "Invoices",
    icon: Receipt,
    children: [
      { label: "All Invoices", path: "/admin-dashboard/invoices", icon: FileText },
      { label: "Refunds", path: "/admin-dashboard/refunds", icon: RotateCcw },
      { label: "Transactions", path: "/admin-dashboard/transactions", icon: Receipt },
    ],
  },
  { label: "Partners", path: "/admin-dashboard/partners", icon: Handshake },
  { label: "About", path: "/admin-dashboard/about", icon: Info },
  { label: "Contact", path: "/admin-dashboard/contact", icon: Contact },
  { label: "Testimonials", path: "/admin-dashboard/testimonials", icon: Quote },
  { label: "Enquiries", path: "/admin-dashboard/enquiries", icon: MessageSquare },
  { label: "Email Templates", path: "/admin-dashboard/email-templates", icon: Mail },
  { label: "Themes", path: "/admin-dashboard/themes", icon: Palette },
  { label: "Reports", path: "/admin-dashboard/reports", icon: BarChart3 },
];

function isGroup(item: SidebarItem): item is SidebarGroup {
  return 'children' in item;
}

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Events", "Invoices"]);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin", { replace: true });
  };

  const isActive = (path: string) =>
    path === "/admin-dashboard"
      ? location.pathname === "/admin-dashboard"
      : location.pathname.startsWith(path);

  const isGroupActive = (group: SidebarGroup) =>
    group.children.some((child) => isActive(child.path));

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } bg-emerald-dark text-primary-foreground flex flex-col transition-all duration-300 fixed inset-y-0 left-0 z-40`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <img
                src="/summit-logo.png"
                alt="Summit Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-serif text-lg font-bold tracking-wide">
                SUMMIT <span className="text-gradient-gold">Admin</span>
              </span>
            </div>
          ) : (
            <img
              src="/summit-logo.png"
              alt="Summit Logo"
              className="w-8 h-8 object-contain mx-auto"
            />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-gold"
          >
            <PanelLeft size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {sidebarItems.map((item, index) => {
            if (isGroup(item)) {
              const isExpanded = expandedGroups.includes(item.label);
              const groupActive = isGroupActive(item);
              
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      groupActive
                        ? "bg-sidebar-accent text-gold"
                        : "text-primary-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && (
                      isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                  </button>
                  {!collapsed && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive(child.path)
                              ? "bg-sidebar-accent text-gold"
                              : "text-primary-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
                          }`}
                        >
                          <child.icon size={16} />
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-sidebar-accent text-gold"
                    : "text-primary-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
                }`}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border pt-2 pb-4 space-y-1">
          <div className="px-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
            >
              <LogOut size={18} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
          <div className="px-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              {!collapsed && <span>Back to Site</span>}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

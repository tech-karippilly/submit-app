import { useEffect, useState, useRef } from "react";
import { 
  FileText, Users, Calendar, IndianRupee, CreditCard, 
  MessageSquare, Download, Loader2, TrendingUp, TrendingDown,
  PieChart, BarChart3, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { reportsApi } from "@/services/reports.services";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_TITLE = "Reports";

type ReportType = 'enquiries' | 'attendee-types' | 'groups' | 'events' | 'revenue' | 'transactions';

const Reports = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('enquiries');
  const [loading, setLoading] = useState<Record<ReportType, boolean>>({
    enquiries: false,
    'attendee-types': false,
    groups: false,
    events: false,
    revenue: false,
    transactions: false,
  });
  
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    loadReport('enquiries');
    return () => { document.title = "The Summit LLP"; };
  }, []);

  const loadReport = async (type: ReportType) => {
    if (data[type]) return; // Already loaded
    
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      let response;
      switch (type) {
        case 'enquiries':
          response = await reportsApi.getEnquiriesReport();
          break;
        case 'attendee-types':
          response = await reportsApi.getAttendeeTypeReport();
          break;
        case 'groups':
          response = await reportsApi.getGroupRegistrationReport();
          break;
        case 'events':
          response = await reportsApi.getEventRegistrationReport();
          break;
        case 'revenue':
          response = await reportsApi.getRevenueReport();
          break;
        case 'transactions':
          response = await reportsApi.getTransactionHistory();
          break;
      }
      
      if (response?.success) {
        setData(prev => ({ ...prev, [type]: response.data }));
      }
    } catch (error) {
      console.error(`Error loading ${type} report:`, error);
      toast.error(`Failed to load ${type} report`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleTabChange = (value: string) => {
    const reportType = value as ReportType;
    setActiveTab(reportType);
    loadReport(reportType);
  };

  const exportToCSV = (reportType: ReportType) => {
    const reportData = data[reportType];
    if (!reportData) return;

    let csv = '';
    let filename = '';

    switch (reportType) {
      case 'enquiries':
        csv = 'Name,Email,Subject,Date\n';
        reportData.recentEnquiries.forEach((e: any) => {
          csv += `"${e.name}","${e.email}","${e.title}","${new Date(e.createdAt).toLocaleDateString()}"\n`;
        });
        filename = 'enquiries-report.csv';
        break;
      case 'attendee-types':
        csv = 'Event,Students,Professionals,Total\n';
        reportData.breakdownByEvent.forEach((e: any) => {
          csv += `"${e.eventName}",${e.students},${e.professionals},${e.total}\n`;
        });
        filename = 'attendee-types-report.csv';
        break;
      case 'groups':
        csv = 'Lead Name,Email,Event,Size,Fee\n';
        reportData.groups.forEach((g: any) => {
          csv += `"${g.leadName}","${g.email}","${g.eventName}",${g.size},${g.registrationFee}\n`;
        });
        filename = 'group-registrations-report.csv';
        break;
      case 'events':
        csv = 'Event,Date,Capacity,Registered,Revenue\n';
        reportData.events.forEach((e: any) => {
          csv += `"${e.eventName}","${new Date(e.eventDate).toLocaleDateString()}",${e.capacity},${e.registered},${e.revenue}\n`;
        });
        filename = 'event-registrations-report.csv';
        break;
      case 'transactions':
        csv = 'Date,Type,Description,Amount,Name,Event\n';
        reportData.transactions.forEach((t: any) => {
          csv += `"${new Date(t.createdAt).toLocaleDateString()}","${t.type}","${t.description}",${t.amount},"${t.participantName}","${t.eventName}"\n`;
        });
        filename = 'transaction-history.csv';
        break;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Comprehensive analytics and reports</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          <TabsTrigger value="enquiries" className="flex items-center gap-2">
            <MessageSquare size={16} /> Enquiries
          </TabsTrigger>
          <TabsTrigger value="attendee-types" className="flex items-center gap-2">
            <Users size={16} /> Attendees
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users size={16} /> Groups
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar size={16} /> Events
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <IndianRupee size={16} /> Revenue
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard size={16} /> Transactions
          </TabsTrigger>
        </TabsList>

        {/* Enquiries Report */}
        <TabsContent value="enquiries" className="space-y-6">
          {loading.enquiries ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : data.enquiries ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Enquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gold">{data.enquiries.totalEnquiries}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => exportToCSV('enquiries')} variant="outline" className="w-full">
                      <Download size={16} className="mr-2" /> Download CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Enquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.enquiries.recentEnquiries?.map((enquiry: any) => (
                        <TableRow key={enquiry.id}>
                          <TableCell>{enquiry.name}</TableCell>
                          <TableCell>{enquiry.email}</TableCell>
                          <TableCell>{enquiry.title}</TableCell>
                          <TableCell>{new Date(enquiry.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Attendee Types Report */}
        <TabsContent value="attendee-types" className="space-y-6">
          {loading['attendee-types'] ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : data['attendee-types'] ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gold">{data['attendee-types'].totalParticipants}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-500">{data['attendee-types'].students?.count}</p>
                    <p className="text-sm text-muted-foreground">
                      Individual: {data['attendee-types'].students?.individual} | 
                      Group: {data['attendee-types'].students?.group}
                    </p>
                    <p className="text-sm text-gold mt-1">₹{data['attendee-types'].students?.revenue?.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Professionals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-500">{data['attendee-types'].professionals?.count}</p>
                    <p className="text-sm text-gold mt-1">₹{data['attendee-types'].professionals?.revenue?.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Breakdown by Event</CardTitle>
                  <Button onClick={() => exportToCSV('attendee-types')} variant="outline" size="sm">
                    <Download size={16} className="mr-2" /> Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Professionals</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data['attendee-types'].breakdownByEvent?.map((event: any) => (
                        <TableRow key={event.eventId}>
                          <TableCell>{event.eventName}</TableCell>
                          <TableCell>{event.students}</TableCell>
                          <TableCell>{event.professionals}</TableCell>
                          <TableCell className="font-bold">{event.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Group Registration Report */}
        <TabsContent value="groups" className="space-y-6">
          {loading.groups ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : data.groups ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Groups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gold">{data.groups.totalGroups}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-500">{data.groups.totalGroupMembers}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Avg Group Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-emerald-500">{data.groups.averageGroupSize?.toFixed(1)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Group Details</CardTitle>
                  <Button onClick={() => exportToCSV('groups')} variant="outline" size="sm">
                    <Download size={16} className="mr-2" /> Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead Name</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.groups.groups?.map((group: any) => (
                        <TableRow key={group.id}>
                          <TableCell>{group.leadName}</TableCell>
                          <TableCell>{group.eventName}</TableCell>
                          <TableCell>{group.size} members</TableCell>
                          <TableCell>₹{group.registrationFee?.toLocaleString()}</TableCell>
                          <TableCell>{new Date(group.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Event Registration Report */}
        <TabsContent value="events" className="space-y-6">
          {loading.events ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : data.events ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Event-wise Registrations</CardTitle>
                  <Button onClick={() => exportToCSV('events')} variant="outline" size="sm">
                    <Download size={16} className="mr-2" /> Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Professionals</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.events.events?.map((event: any) => (
                        <TableRow key={event.eventId}>
                          <TableCell className="font-medium">{event.eventName}</TableCell>
                          <TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell>
                          <TableCell>{event.capacity || 'Unlimited'}</TableCell>
                          <TableCell>
                            {event.registered}
                            {event.capacity > 0 && (
                              <span className="text-muted-foreground text-sm ml-1">
                                ({Math.round((event.registered / event.capacity) * 100)}%)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{event.students}</TableCell>
                          <TableCell>{event.professionals}</TableCell>
                          <TableCell className="text-gold font-medium">₹{event.revenue?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Revenue Report */}
        <TabsContent value="revenue" className="space-y-6">
          {loading.revenue ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : data.revenue ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gold">₹{data.revenue.totalRevenue?.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-500">{data.revenue.totalTransactions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Refunded</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-500">₹{data.revenue.refunds?.totalRefunded?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{data.revenue.refunds?.count} refunds</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Net Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-500">
                      ₹{(data.revenue.totalRevenue - data.revenue.refunds?.totalRefunded)?.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Revenue by Event</CardTitle>
                  <Button onClick={() => exportToCSV('revenue')} variant="outline" size="sm">
                    <Download size={16} className="mr-2" /> Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.revenue.revenueByEvent?.map((event: any) => (
                        <TableRow key={event.eventId}>
                          <TableCell className="font-medium">{event.eventName}</TableCell>
                          <TableCell>{event.participants}</TableCell>
                          <TableCell className="text-gold font-medium">₹{event.revenue?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="transactions" className="space-y-6">
          {loading.transactions ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : data.transactions ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-500" /> Credits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-500">₹{data.transactions.summary?.totalCredits?.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingDown size={18} className="text-red-500" /> Debits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-500">₹{data.transactions.summary?.totalDebits?.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Net Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gold">₹{data.transactions.summary?.netAmount?.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button onClick={() => exportToCSV('transactions')} variant="outline" size="sm">
                    <Download size={16} className="mr-2" /> Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Event</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.transactions.transactions?.map((t: any) => (
                        <TableRow key={t.id}>
                          <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              t.type === 'credit' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {t.type === 'credit' ? 'Credit' : 'Debit'}
                            </span>
                          </TableCell>
                          <TableCell>{t.description}</TableCell>
                          <TableCell className={t.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}>
                            {t.type === 'credit' ? '+' : '-'}₹{t.amount?.toLocaleString()}
                          </TableCell>
                          <TableCell>{t.participantName}</TableCell>
                          <TableCell>{t.eventName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;

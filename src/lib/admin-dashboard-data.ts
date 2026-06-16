import { prisma } from "@/lib/prisma";

export type DashboardTrendPoint = {
  label: string;
  pageViews: number;
  sessions: number;
};

export type DashboardDeviceBreakdown = {
  label: string;
  value: number;
  color: "indigo" | "emerald" | "amber";
};

export type DashboardLead = {
  name: string;
  company: string;
  email: string;
  stage: "New lead" | "Qualified" | "Proposal" | "Closed";
  budget: string;
};

export type DashboardData = {
  stats: {
    label: string;
    value: string;
    change: string;
    trend: "up" | "down";
    tone: "green" | "cyan" | "orange" | "indigo";
    sparkline: number[];
  }[];
  chart: {
    range: "7d" | "30d" | "90d";
    series: DashboardTrendPoint[];
    deviceBreakdown: DashboardDeviceBreakdown[];
  };
  orders: {
    id: string;
    customer: string;
    total: string;
    status: string;
    createdAt: string;
  }[];
  highlights: {
    title: string;
    description: string;
    action: string;
  }[];
  leads: DashboardLead[];
  products: {
    id: string;
    name: string;
    priceLabel: string;
    priceValue: number;
    featured: boolean;
    category: string;
    description: string;
    image: string;
    tags: string[];
    inventory: number;
    rating: number;
  }[];
};

const chartSeries: DashboardTrendPoint[] = [
  { label: "Jan", pageViews: 132, sessions: 92 },
  { label: "Feb", pageViews: 72, sessions: 70 },
  { label: "Mar", pageViews: 110, sessions: 77 },
  { label: "Apr", pageViews: 100, sessions: 48 },
  { label: "May", pageViews: 138, sessions: 36 },
  { label: "Jun", pageViews: 128, sessions: 70 },
  { label: "Jul", pageViews: 78, sessions: 70 },
  { label: "Aug", pageViews: 82, sessions: 70 },
  { label: "Sep", pageViews: 160, sessions: 86 },
  { label: "Oct", pageViews: 76, sessions: 40 },
  { label: "Nov", pageViews: 76, sessions: 53 },
  { label: "Dec", pageViews: 111, sessions: 54 },
];

const deviceBreakdown: DashboardDeviceBreakdown[] = [
  { label: "Desktop", value: 45.8, color: "indigo" },
  { label: "Mobile", value: 38.7, color: "emerald" },
  { label: "Tablet", value: 15.5, color: "amber" },
];

const fallbackLeads: DashboardLead[] = [];

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPkr(amount: number): string {
  return `PKR ${new Intl.NumberFormat("en-PK").format(Math.round(amount))}`;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const [
      userCount,
      productCount,
      orderCount,
      latestOrders,
      latestProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const conversionRate =
      userCount > 0 ? ((orderCount / userCount) * 100).toFixed(1) : "0.0";

    return {
      stats: [
        {
          label: "Total Users",
          value: formatCount(userCount),
          change: "+12.5% from last month",
          trend: "up",
          tone: "green",
          sparkline: [16, 18, 19, 22, 24, 27, 26, 29],
        },
        {
          label: "Total Views",
          value: "0",
          change: "+8.2% from last week",
          trend: "up",
          tone: "cyan",
          sparkline: [8, 12, 10, 14, 16, 18, 20, 21],
        },
        {
          label: "Published Products",
          value: formatCount(productCount),
          change: "-2.1% from yesterday",
          trend: "down",
          tone: "orange",
          sparkline: [22, 18, 20, 17, 15, 16, 14, 13],
        },
        {
          label: "Conversion Rate",
          value: `${conversionRate}%`,
          change: "+0.3% from last month",
          trend: "up",
          tone: "indigo",
          sparkline: [4, 5, 4, 6, 7, 6, 8, 7],
        },
      ],
      chart: {
        range: "30d",
        series: chartSeries,
        deviceBreakdown,
      },
      orders: latestOrders.map((order) => ({
        id: order.id.slice(0, 8).toUpperCase(),
        customer: order.user?.name ?? order.user?.email ?? "Guest",
        total: `$${order.total.toNumber().toFixed(2)}`,
        status: order.status,
        createdAt: order.createdAt.toLocaleDateString(),
      })),
      highlights: [
        {
          title: "New waitlist signups",
          description: "542 members ready for the next capsule drop.",
          action: "Invite customers",
        },
        {
          title: "Low inventory alert",
          description: "3 hero products are below the 15 unit threshold.",
          action: "Restock inventory",
        },
      ],
      leads: fallbackLeads,
      products: latestProducts.map((product) => ({
        id: product.id,
        name: product.name,
        priceLabel: formatPkr(product.price.toNumber()),
        priceValue: product.price.toNumber(),
        featured: product.featured,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category: (product as any).category ?? "",
        description: product.description,
        image: product.image,
        tags: product.tags,
        inventory: product.inventory,
        rating: product.rating,
      })),
    };
  } catch (error) {
    console.warn("Falling back to mocked admin data", error);
    return {
      stats: [
        {
          label: "Total Users",
          value: "2",
          change: "+12.5% from last month",
          trend: "up",
          tone: "green",
          sparkline: [16, 18, 19, 22, 24, 27, 26, 29],
        },
        {
          label: "Total Views",
          value: "0",
          change: "+8.2% from last week",
          trend: "up",
          tone: "cyan",
          sparkline: [8, 12, 10, 14, 16, 18, 20, 21],
        },
        {
          label: "Published Products",
          value: "1",
          change: "-2.1% from yesterday",
          trend: "down",
          tone: "orange",
          sparkline: [22, 18, 20, 17, 15, 16, 14, 13],
        },
        {
          label: "Conversion Rate",
          value: "0%",
          change: "+0.3% from last month",
          trend: "up",
          tone: "indigo",
          sparkline: [4, 5, 4, 6, 7, 6, 8, 7],
        },
      ],
      chart: {
        range: "30d",
        series: chartSeries,
        deviceBreakdown,
      },
      orders: [
        {
          id: "XSA9132",
          customer: "Studio Form",
          total: "$1,280",
          status: "PAID",
          createdAt: "Jun 4",
        },
        {
          id: "QW92LA1",
          customer: "Nova Collective",
          total: "$890",
          status: "FULFILLED",
          createdAt: "Jun 3",
        },
        {
          id: "VT88DD9",
          customer: "Atlas Agency",
          total: "$2,430",
          status: "PENDING",
          createdAt: "Jun 2",
        },
      ],
      highlights: [
        {
          title: "New waitlist signups",
          description: "542 members ready for the next capsule drop.",
          action: "Invite customers",
        },
        {
          title: "Low inventory alert",
          description: "3 hero products are below the 15 unit threshold.",
          action: "Restock inventory",
        },
      ],
      leads: fallbackLeads,
      products: [
        {
          id: "aurora",
          name: "Aurora Headphones",
          priceLabel: "$349.00",
          priceValue: 349,
          featured: true,
          category: "",
          description:
            "Spatial audio, adaptive noise cancelling, and a sculpted aluminum frame.",
          image:
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
          tags: ["audio", "new"],
          inventory: 25,
          rating: 4.8,
        },
        {
          id: "lumen",
          name: "Lumen Watch",
          priceLabel: "$499.00",
          priceValue: 499,
          featured: true,
          category: "",
          description:
            "Sapphire glass, multi-day battery, and proactive wellness tracking.",
          image:
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
          tags: ["wearables"],
          inventory: 25,
          rating: 4.9,
        },
      ],
    };
  }
}

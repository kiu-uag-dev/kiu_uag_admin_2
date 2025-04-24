// config/routes.js
import {
  SquareTerminal,
  Users,
  TicketCheck,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  QrCode,
  FileText,
} from 'lucide-react';

export const routes = {
  dashboard: {
    dashboard: '/dashboard',
    users: '/dashboard/users',
    tickets: '/dashboard/tickets',
    qrScanner: '/dashboard/qr-scanner',
  },
  signIn: '/',
  profile: '/dashboard/profile',
};

// Role-specific menu items
export const roleMenuItems = {
  admin: [
    {
      title: 'მთავარი გვერდი',
      url: '/dashboard',
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: 'მომხმარებლები',
      url: '/dashboard/users',
      icon: Users,
      isActive: false,
    },
    {
      title: 'მარშრუტები',
      url: '/dashboard/directions',
      icon: TicketCheck,
      isActive: false,
    },
    {
      title: 'სტატუსები',
      url: '/dashboard/statuses',
      icon: TicketCheck,
      isActive: false,
    },
    {
      title: 'განრიგი',
      url: '/dashboard/schedule',
      icon: TicketCheck,
      isActive: false,
    },
    {
      title: 'ბილეთები',
      url: '/dashboard/tickets',
      icon: TicketCheck,
      isActive: false,
    },
  ],
  salesagent: [
    {
      title: 'მომხმარებლები',
      url: '/dashboard/customers',
      icon: Users,
      isActive: false,
    },
    {
      title: 'ბილეთები',
      url: '/dashboard/sell-ticket',
      icon: TicketCheck,
      isActive: false,
    },
  ],
  driver: [
    {
      title: 'QR სკანერი',
      url: '/dashboard/qr-scanner',
      icon: QrCode,
      isActive: true,
    }
  ],
};

export const menuItems = {
  user: {
    name: 'სახელი გვარი',
    email: 'info@telecomm1.com',
    avatar: 'https://ui.shadcn.com/avatars/02.png',
  },

  dashboard: {
    title: 'მთავარი გვერდი',
    url: '/dashboard',
    icon: SquareTerminal,
    isActive: true,
  },

  navMain: [
    {
      title: 'მთავარი გვერდი',
      url: '/dashboard',
      icon: SquareTerminal,
      isActive: false,
    },
    {
      title: 'მომხმარებლები',
      url: '/dashboard/users',
      icon: Users,
      isActive: false,
    },
    {
      title: 'მარშრუტები',
      url: '/dashboard/directions',
      icon: TicketCheck,
      isActive: false,
    },
    {
      title: 'განრიგი',
      url: '/dashboard/schedule',
      icon: TicketCheck,
      isActive: false,
    },
    {
      title: 'ბილეთები',
      url: '/dashboard/tickets',
      icon: TicketCheck,
      isActive: false,
    },
  ],
};

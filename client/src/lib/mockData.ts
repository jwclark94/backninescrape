export interface DailyBooking {
  day: string;
  hours: number;
}

export interface LocationData {
  id: string;
  name: string;
  city: string;
  totalHours: number;
  revenue: {
    allTime: number;
    lastWeek: number;
    lastMonth: number;
  };
  hoursBooked: {
    allTime: number;
    lastWeek: number;
    lastMonth: number;
  };
  dailyBookings: DailyBooking[];
}

export const mockLocations: LocationData[] = [
  {
    id: "1",
    name: "Downtown Hub",
    city: "New York",
    totalHours: 1250,
    revenue: { allTime: 150000, lastWeek: 3200, lastMonth: 12500 },
    hoursBooked: { allTime: 1250, lastWeek: 45, lastMonth: 180 },
    dailyBookings: [
      { day: "Mon", hours: 8 },
      { day: "Tue", hours: 12 },
      { day: "Wed", hours: 10 },
      { day: "Thu", hours: 15 },
      { day: "Fri", hours: 18 },
      { day: "Sat", hours: 22 },
      { day: "Sun", hours: 14 },
    ],
  },
  {
    id: "2",
    name: "Westside Studio",
    city: "Los Angeles",
    totalHours: 980,
    revenue: { allTime: 98000, lastWeek: 2100, lastMonth: 9200 },
    hoursBooked: { allTime: 980, lastWeek: 30, lastMonth: 120 },
    dailyBookings: [
      { day: "Mon", hours: 6 },
      { day: "Tue", hours: 8 },
      { day: "Wed", hours: 12 },
      { day: "Thu", hours: 10 },
      { day: "Fri", hours: 14 },
      { day: "Sat", hours: 20 },
      { day: "Sun", hours: 18 },
    ],
  },
  {
    id: "3",
    name: "North Point",
    city: "Chicago",
    totalHours: 850,
    revenue: { allTime: 82000, lastWeek: 1800, lastMonth: 7500 },
    hoursBooked: { allTime: 850, lastWeek: 25, lastMonth: 110 },
    dailyBookings: [
      { day: "Mon", hours: 5 },
      { day: "Tue", hours: 7 },
      { day: "Wed", hours: 8 },
      { day: "Thu", hours: 12 },
      { day: "Fri", hours: 15 },
      { day: "Sat", hours: 18 },
      { day: "Sun", hours: 10 },
    ],
  },
  {
    id: "4",
    name: "Tech Park",
    city: "San Francisco",
    totalHours: 1100,
    revenue: { allTime: 135000, lastWeek: 2900, lastMonth: 11000 },
    hoursBooked: { allTime: 1100, lastWeek: 40, lastMonth: 160 },
    dailyBookings: [
      { day: "Mon", hours: 10 },
      { day: "Tue", hours: 14 },
      { day: "Wed", hours: 16 },
      { day: "Thu", hours: 14 },
      { day: "Fri", hours: 12 },
      { day: "Sat", hours: 8 },
      { day: "Sun", hours: 6 },
    ],
  },
  {
    id: "5",
    name: "Harbor View",
    city: "Seattle",
    totalHours: 720,
    revenue: { allTime: 65000, lastWeek: 1500, lastMonth: 6200 },
    hoursBooked: { allTime: 720, lastWeek: 20, lastMonth: 95 },
    dailyBookings: [
      { day: "Mon", hours: 4 },
      { day: "Tue", hours: 6 },
      { day: "Wed", hours: 9 },
      { day: "Thu", hours: 11 },
      { day: "Fri", hours: 13 },
      { day: "Sat", hours: 16 },
      { day: "Sun", hours: 12 },
    ],
  },
];

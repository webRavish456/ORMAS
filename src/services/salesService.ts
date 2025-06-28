
interface SalesData {
  date: string;
  totalSales: number;
}

export const getSalesData = async (): Promise<SalesData[]> => {
  // Mock data for now - replace with actual Firebase call
  return [
    { date: '2024-01-01', totalSales: 15000 },
    { date: '2024-01-02', totalSales: 18000 },
    { date: '2024-01-03', totalSales: 22000 },
    { date: '2024-01-04', totalSales: 19500 },
    { date: '2024-01-05', totalSales: 25000 },
  ];
};

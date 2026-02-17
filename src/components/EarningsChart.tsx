import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockEarningsData = [
  { week: 'Week 1', earnings: 120 },
  { week: 'Week 2', earnings: 180 },
  { week: 'Week 3', earnings: 240 },
  { week: 'Week 4', earnings: 320 },
  { week: 'Week 5', earnings: 280 },
  { week: 'Week 6', earnings: 350 },
  { week: 'Week 7', earnings: 420 },
  { week: 'Week 8', earnings: 380 },
];

export const EarningsChart = () => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockEarningsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="week" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value) => [`$${value}`, 'Earnings']}
          />
          <Line 
            type="monotone" 
            dataKey="earnings" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
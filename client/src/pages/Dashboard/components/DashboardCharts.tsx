import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type CategoryStock = {
  category: string;
  stock: number;
};

type Props = {
  data: CategoryStock[];
};

const COLORS = [
  "#2563EB",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#14B8A6",
];

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "18px",
  padding: "24px",
  border: "1px solid #E5E7EB",
  boxShadow: "0 8px 20px rgba(0,0,0,.06)",
  transition: ".3s",
};

const DashboardCharts = ({ data }: Props) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "24px",
        marginTop: "25px",
      }}
    >
      {/* Category Wise Pie Chart */}
      <div
        style={cardStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-5px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0px)")
        }
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: "20px",
            color: "#111827",
          }}
        >
          📊 Category Wise Stock
        </h2>

        {data.length === 0 ? (
          <div
            style={{
              height: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              fontSize: "18px",
            }}
          >
            No Data Available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data}
                dataKey="stock"
                nameKey="category"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={4}
                label
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stock Overview */}
      <div
        style={cardStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-5px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0px)")
        }
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: "20px",
            color: "#111827",
          }}
        >
          📈 Stock Overview
        </h2>

        {data.length === 0 ? (
          <div
            style={{
              height: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              fontSize: "18px",
            }}
          >
            No Data Available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="category" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="stock"
                fill="#EF3B3A"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
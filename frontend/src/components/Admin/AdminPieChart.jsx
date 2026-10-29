import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function AdminPieChart({ real = 0, fake = 0 }) {
  const total = Number(real) + Number(fake);
  const realPercent = total ? Math.round((Number(real) / total) * 100) : 0;
  const data = [
    { name: "Real News", value: Number(real) },
    { name: "Fake News", value: Number(fake) },
  ];
  const colors = ["#22c55e", "#ef4444"];

  return (
    <div className="admin-distribution-chart">
      <div className="distribution-chart-wrap">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={68} outerRadius={96} paddingAngle={3} stroke="none">
                {data.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}
              </Pie>
              <Tooltip formatter={(value) => [`${value} predictions`, "Count"]} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="distribution-empty">No prediction data</div>
        )}
        {total > 0 && (
          <div className="distribution-chart-center">
            <strong>{total}</strong>
            <span>Total</span>
          </div>
        )}
      </div>
      <div className="distribution-legend">
        <div><span className="legend-dot real" /><p><strong>{real}</strong><small>Real News · {realPercent}%</small></p></div>
        <div><span className="legend-dot fake" /><p><strong>{fake}</strong><small>Fake News · {100 - realPercent}%</small></p></div>
      </div>
    </div>
  );
}

export default AdminPieChart;
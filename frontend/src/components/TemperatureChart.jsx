

const TemperatureChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const raw = await queryInflux(fluxQuery);
        const parsed = parseInfluxCSV(raw);
        setData(parsed);
      } catch (err) {
        console.error("Error al consultar Influx:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000); // cada 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
        {data.length === 0 ? (
            <p>Cargando datos...</p>
            ) : (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" minTickGap={20} />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
            )}
    </div>
  );
};

export default TemperatureChart;
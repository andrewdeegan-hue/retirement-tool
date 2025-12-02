import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp, Info, DollarSign, Calendar, Percent, BarChart2, Activity, Database } from 'lucide-react';

// --- DATA ---
// S&P 500 Real Returns (Inflation Adjusted)
const HISTORICAL_DATA = [
  { year: 1928, return: 0.4549 }, { year: 1929, return: -0.0883 }, { year: 1930, return: -0.2001 },
  { year: 1931, return: -0.3807 }, { year: 1932, return: 0.0182 }, { year: 1933, return: 0.4885 },
  { year: 1934, return: -0.0266 }, { year: 1935, return: 0.4249 }, { year: 1936, return: 0.3006 },
  { year: 1937, return: -0.3713 }, { year: 1938, return: 0.3298 }, { year: 1939, return: -0.0110 },
  { year: 1940, return: -0.1131 }, { year: 1941, return: -0.2062 }, { year: 1942, return: 0.1235 },
  { year: 1943, return: 0.2285 }, { year: 1944, return: 0.1764 }, { year: 1945, return: 0.3392 },
  { year: 1946, return: -0.1982 }, { year: 1947, return: -0.0333 }, { year: 1948, return: 0.0274 },
  { year: 1949, return: 0.2036 }, { year: 1950, return: 0.2435 }, { year: 1951, return: 0.1542 },
  { year: 1952, return: 0.1739 }, { year: 1953, return: -0.0163 }, { year: 1954, return: 0.5362 },
  { year: 1955, return: 0.3096 }, { year: 1956, return: 0.0354 }, { year: 1957, return: -0.1349 },
  { year: 1958, return: 0.4137 }, { year: 1959, return: 0.1037 }, { year: 1960, return: -0.0125 },
  { year: 1961, return: 0.2605 }, { year: 1962, return: -0.0991 }, { year: 1963, return: 0.2109 },
  { year: 1964, return: 0.1524 }, { year: 1965, return: 0.1026 }, { year: 1966, return: -0.1272 },
  { year: 1967, return: 0.2015 }, { year: 1968, return: 0.0582 }, { year: 1969, return: -0.1360 },
  { year: 1970, return: -0.0190 }, { year: 1971, return: 0.1061 }, { year: 1972, return: 0.1484 },
  { year: 1973, return: -0.2117 }, { year: 1974, return: -0.3404 }, { year: 1975, return: 0.2811 },
  { year: 1976, return: 0.1809 }, { year: 1977, return: -0.1282 }, { year: 1978, return: -0.0230 },
  { year: 1979, return: 0.0461 }, { year: 1980, return: 0.1708 }, { year: 1981, return: -0.1251 },
  { year: 1982, return: 0.1652 }, { year: 1983, return: 0.1822 }, { year: 1984, return: 0.0226 },
  { year: 1985, return: 0.2737 }, { year: 1986, return: 0.1741 }, { year: 1987, return: 0.0083 },
  { year: 1988, return: 0.1205 }, { year: 1989, return: 0.2646 }, { year: 1990, return: -0.0927 },
  { year: 1991, return: 0.2699 }, { year: 1992, return: 0.0459 }, { year: 1993, return: 0.0718 },
  { year: 1994, return: -0.0135 }, { year: 1995, return: 0.3456 }, { year: 1996, return: 0.1917 },
  { year: 1997, return: 0.3113 }, { year: 1998, return: 0.2696 }, { year: 1999, return: 0.1827 },
  { year: 2000, return: -0.1224 }, { year: 2001, return: -0.1332 }, { year: 2002, return: -0.2384 },
  { year: 2003, return: 0.2649 }, { year: 2004, return: 0.0738 }, { year: 2005, return: 0.0142 },
  { year: 2006, return: 0.1306 }, { year: 2007, return: 0.0139 }, { year: 2008, return: -0.3711 },
  { year: 2009, return: 0.2325 }, { year: 2010, return: 0.1348 }, { year: 2011, return: -0.0094 },
  { year: 2012, return: 0.1396 }, { year: 2013, return: 0.3069 }, { year: 2014, return: 0.1287 },
  { year: 2015, return: 0.0065 }, { year: 2016, return: 0.0984 }, { year: 2017, return: 0.1925 },
  { year: 2018, return: -0.0655 }, { year: 2019, return: 0.2882 }, { year: 2020, return: 0.1644 },
  { year: 2021, return: 0.2002 }, { year: 2022, return: -0.2301 }, { year: 2023, return: 0.2197 }
];

const GEO_MEAN = 0.067; 

const App = () => {
  const [initialWealth, setInitialWealth] = useState(1000000);
  const [withdrawalRate, setWithdrawalRate] = useState(4.0);
  const [duration, setDuration] = useState(25);
  const [viewMode, setViewMode] = useState('trajectory');

  const simulationResults = useMemo(() => {
    const withdrawalAmount = initialWealth * (withdrawalRate / 100);
    const avgPath = [];
    
    let avgWealth = initialWealth;
    for (let i = 0; i <= duration; i++) {
        avgPath.push({ year: i, wealth: avgWealth });
        avgWealth = avgWealth * (1 + GEO_MEAN) - withdrawalAmount;
        if (avgWealth < 0) avgWealth = 0;
    }

    const validStartIndices = HISTORICAL_DATA.length - duration;
    
    let worstTerminal = Infinity;
    let worstStartYear = 0;
    let worstPath = [];
    
    let bestTerminal = -Infinity;
    let bestStartYear = 0;
    let bestPath = [];

    let allOutcomes = [];

    for (let i = 0; i < validStartIndices; i++) {
        const startYear = HISTORICAL_DATA[i].year;
        let currentWealth = initialWealth;
        let path = [];
        let failed = false;
        let ruinYear = null;

        for (let j = 0; j <= duration; j++) {
            path.push({ year: j, wealth: currentWealth });
            if (j < duration) {
                 const ret = HISTORICAL_DATA[i + j].return;
                 currentWealth = currentWealth * (1 + ret) - withdrawalAmount;
                 if (currentWealth < 0) {
                     currentWealth = 0;
                     failed = true;
                     // Capture the specific calendar year the money ran out
                     if (ruinYear === null) {
                        ruinYear = HISTORICAL_DATA[i + j].year;
                     }
                 }
            }
        }

        const outcomeData = { 
            startYear, 
            terminalWealth: currentWealth, 
            path, 
            failed,
            ruinYear, // Store the year of failure
            endYear: startYear + duration
        };
        allOutcomes.push(outcomeData);

        if (currentWealth < worstTerminal) {
            worstTerminal = currentWealth;
            worstStartYear = startYear;
            worstPath = path;
        }
        if (currentWealth > bestTerminal) {
            bestTerminal = currentWealth;
            bestStartYear = startYear;
            bestPath = path;
        }
    }

    const sortedOutcomes = [...allOutcomes].sort((a, b) => a.terminalWealth - b.terminalWealth);
    const medianIndex = Math.floor(sortedOutcomes.length / 2);
    const medianScenario = sortedOutcomes[medianIndex];

    const failureCount = allOutcomes.filter(o => o.failed).length;
    const failureRate = (failureCount / allOutcomes.length) * 100;

    return {
        avgPath,
        worstPath,
        worstStartYear,
        bestPath,
        bestStartYear,
        medianPath: medianScenario.path,
        medianStartYear: medianScenario.startYear,
        failureRate,
        medianTerminal: medianScenario.terminalWealth,
        avgTerminal: avgPath[duration].wealth,
        worstTerminal: worstTerminal,
        allOutcomes 
    };

  }, [initialWealth, withdrawalRate, duration]);


  const lineChartData = useMemo(() => {
    const data = [];
    for (let i = 0; i <= duration; i++) {
        data.push({
            year: i,
            Average: simulationResults.avgPath[i]?.wealth,
            Worst: simulationResults.worstPath[i]?.wealth,
            Median: simulationResults.medianPath[i]?.wealth,
            Best: simulationResults.bestPath[i]?.wealth
        });
    }
    return data;
  }, [simulationResults, duration]);

  const formatCurrency = (val) => {
    if (val === 0) return "$0";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      
      <div className="max-w-7xl mx-auto w-full mb-8">
        <h1 className="text-3xl font-bold text-purple-900 mb-2">Sequence of Returns Risk Analyzer</h1>
        <p className="text-slate-600 max-w-3xl">
          This dashboard demonstrates why using an "Average Return" assumption is dangerous for retirement planning. 
          Even if the long-term average is positive, the <strong>order</strong> of returns matters. Bad timing early in retirement (drawdown) can deplete a portfolio, a risk hidden by simple averages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Parameters
            </h2>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Initial Portfolio</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="number" 
                        value={initialWealth}
                        onChange={(e) => setInitialWealth(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Annual Withdrawal Rate
                </label>
                <div className="flex items-center gap-4 mb-2">
                    <input 
                        type="range" 
                        min="2" max="8" step="0.1"
                        value={withdrawalRate}
                        onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="font-bold text-purple-600 w-12 text-right">{withdrawalRate}%</span>
                </div>
                <div className="text-xs text-slate-500 bg-slate-100 p-2 rounded">
                    Annual Income: <strong>{formatCurrency(initialWealth * (withdrawalRate/100))}</strong> (Real)
                </div>
            </div>

            <div className="mb-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Years)</label>
                <div className="flex items-center gap-4">
                    <input 
                        type="range" 
                        min="15" max="60" step="5"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="font-bold text-slate-600 w-12 text-right">{duration}y</span>
                </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mb-6">
             <h3 className="text-purple-900 font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4"/> Risk of Ruin
             </h3>
             <p className="text-sm text-purple-800 leading-relaxed">
                The typical (median) retiree actually finished <strong>better</strong> ({formatCurrency(simulationResults.medianTerminal)}) than the long-term average model predicted ({formatCurrency(simulationResults.avgTerminal)}).
             </p>
             <div className="my-3 border-t border-purple-200"></div>
             <p className="text-sm text-purple-800 leading-relaxed">
                <strong>However, this creates a false sense of security.</strong> Despite good typical returns, <strong>{simulationResults.failureRate.toFixed(1)}%</strong> of retirees still ran out of money completely due to bad timing (Sequence Risk).
             </p>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
            
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                <h3 className="text-slate-700 font-semibold mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Database className="w-4 h-4"/> Data Source
                </h3>
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                    <li><strong>Source:</strong> S&P 500 Returns (Total Return including dividends) from 1928 to 2023.</li>
                    <li><strong>Inflation Adjusted:</strong> All figures are "Real Returns" adjusted for CPI inflation.</li>
                    <li><strong>Calculations:</strong> The "Assumed Average" uses the Geometric Mean (CAGR) of 6.7% real return.</li>
                </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border-2 ${simulationResults.failureRate > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Historical Failure Rate</div>
                    <div className={`text-2xl font-bold ${simulationResults.failureRate > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                        {simulationResults.failureRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">of 25-year periods ran out of money</div>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-purple-200 shadow-sm shadow-purple-50">
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Median Ending Wealth</div>
                    <div className="text-2xl font-bold text-purple-700">
                        {formatCurrency(simulationResults.medianTerminal)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">The "Typical" Outcome</div>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-purple-200 shadow-sm shadow-purple-50">
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Average "Illusion" End</div>
                    <div className="text-2xl font-bold text-slate-400 dashed-text">
                        {formatCurrency(simulationResults.avgTerminal)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Assumed 6.7% (Inflation Adj.) Return</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">
                            {viewMode === 'trajectory' ? 'Portfolio Trajectory: Average vs. Reality' : 'Historical Outcomes by Start Year'}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {viewMode === 'trajectory' 
                                ? `Real (Inflation-Adjusted) Values over ${duration} years` 
                                : `Ending Wealth for every ${duration}-year period since 1928`}
                        </p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg self-start md:self-auto">
                        <button 
                            onClick={() => setViewMode('trajectory')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'trajectory' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Activity className="w-4 h-4" /> Trajectories
                        </button>
                        <button 
                            onClick={() => setViewMode('outcomes')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'outcomes' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <BarChart2 className="w-4 h-4" /> Outcomes
                        </button>
                    </div>
                </div>
                
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height={400}>
                        {viewMode === 'trajectory' ? (
                            <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="year" 
                                    label={{ value: 'Years into Retirement', position: 'insideBottom', offset: -5 }} 
                                    stroke="#64748b"
                                    tick={{fontSize: 12}}
                                />
                                <YAxis 
                                    tickFormatter={(val) => formatCurrency(val)} 
                                    stroke="#64748b"
                                    tick={{fontSize: 12}}
                                    width={80}
                                />
                                <Tooltip 
                                    formatter={(value) => formatCurrency(value)}
                                    labelFormatter={(label) => `Year ${label}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />

                                <Line type="monotone" dataKey="Average" name="Assumed Average (6.7% Real)" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                                <Line type="monotone" dataKey="Best" name={`Best Start`} stroke="#10b981" strokeWidth={2} dot={false} opacity={0.6} />
                                <Line type="monotone" dataKey="Median" name="Median Historical" stroke="#9333ea" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="Worst" name={`Worst Start`} stroke="#ef4444" strokeWidth={3} dot={false} />
                            </LineChart>
                        ) : (
                            <BarChart data={simulationResults.allOutcomes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="startYear" 
                                    stroke="#64748b"
                                    tick={{fontSize: 12}}
                                    interval={4} // Show every 4th year to avoid clutter
                                />
                                <YAxis 
                                    tickFormatter={(val) => formatCurrency(val)} 
                                    stroke="#64748b"
                                    tick={{fontSize: 12}}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{fill: '#f1f5f9'}}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg">
                                                <p className="font-bold text-slate-800 mb-1">{label} Start Year</p>
                                                <p className="text-xs text-slate-500 mb-2">Retired: {label} - {data.endYear}</p>
                                                <p className={`text-sm font-semibold ${data.terminalWealth === 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                    End Wealth: {formatCurrency(data.terminalWealth)}
                                                </p>
                                                {/* NEW: Ruin Year Warning */}
                                                {data.terminalWealth === 0 && data.ruinYear && (
                                                    <div className="mt-2 pt-2 border-t border-slate-100">
                                                        <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Ran out in {data.ruinYear}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                        }
                                        return null;
                                    }}
                                />
                                <ReferenceLine y={initialWealth} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: "Initial Principal", position: 'insideTopLeft', fill: '#94a3b8', fontSize: 12 }} />
                                <Bar dataKey="terminalWealth" name="Ending Wealth">
                                    {simulationResults.allOutcomes.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={
                                                entry.terminalWealth === 0 ? '#ef4444' : // Red for failure
                                                entry.terminalWealth < initialWealth ? '#f59e0b' : // Amber for loss of real principal
                                                '#9333ea' // Purple for gain
                                            } 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
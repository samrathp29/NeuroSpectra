// App.js
import React, { useState } from 'react';
import EEGUpload from './components/EEGUpload';
import EEGVisualization from './components/EEGVisualization';

function App() {
  const [eegData, setEEGData] = useState(null);

  return (
    <div className="App">
      <h1>EEG Data Visualization</h1>
      <EEGUpload setEEGData={setEEGData} />
      {eegData && <EEGVisualization data={eegData} />}
    </div>
  );
}

export default App;

// components/EEGUpload.js
import React from 'react';
import axios from 'axios';

function EEGUpload({ setEEGData }) {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Float32Array(e.target.result);
      try {
        const response = await axios.post('http://localhost:5000/upload', { eegData: Array.from(data) });
        setEEGData(response.data);
      } catch (error) {
        console.error('Error uploading EEG data:', error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept=".eeg,.dat" />
    </div>
  );
}

export default EEGUpload;

// components/EEGVisualization.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function EEGVisualization({ data }) {
  const chartRef = useRef();

  useEffect(() => {
    if (data) {
      drawChart();
    }
  }, [data]);

  const drawChart = () => {
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, data.frequencies.length])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data.powerSpectrum)])
      .range([height, 0]);

    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d));

    svg.append("path")
      .datum(data.powerSpectrum)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add more visualizations for different brainwave frequencies here
  };

  return (
    <div>
      <div ref={chartRef}></div>
      <div>
        <h3>Brainwave Power:</h3>
        <ul>
          <li>Delta: {data.brainwaves.delta.toFixed(2)}</li>
          <li>Theta: {data.brainwaves.theta.toFixed(2)}</li>
          <li>Alpha: {data.brainwaves.alpha.toFixed(2)}</li>
          <li>Beta: {data.brainwaves.beta.toFixed(2)}</li>
          <li>Gamma: {data.brainwaves.gamma.toFixed(2)}</li>
        </ul>
      </div>
    </div>
  );
}

export default EEGVisualization;

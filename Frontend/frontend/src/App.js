import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000"; 

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (endpoint) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/${endpoint}`);
      setData(response.data);
    } catch (error) {
      setData({ error: "Failed to fetch data" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-5">
      <h1 className="text-3xl font-bold mb-6">API Data Fetcher</h1>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card title="Top Users" onClick={() => fetchData("users")} />
        <Card title="Latest Posts" onClick={() => fetchData("posts?type=latest")} />
        <Card title="Popular Posts" onClick={() => fetchData("posts?type=popular")} />
      </div>

      {/* Display Data */}
      <div className="mt-6 w-full max-w-4xl">
        {loading && <p className="text-center text-lg font-semibold">Loading...</p>}
        {data && (
          <div className="bg-white p-5 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold">Results:</h2>
            <pre className="mt-2 p-3 bg-gray-200 rounded">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};


const Card = ({ title, onClick }) => {
  return (
    <div
      className="bg-white shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-2xl transition"
      onClick={onClick}
    >
      <h2 className="text-xl font-semibold text-center">{title}</h2>
    </div>
  );
};

export default App;

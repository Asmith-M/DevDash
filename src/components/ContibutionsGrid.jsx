// ContibutionsGrid.jsx
import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const ContributionGrid = ({ username }) => {
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`);
        const data = await response.json();
        setContributions(data.contributions);
      } catch (error) {
        console.error("Error fetching contributions:", error);
        setContributions([]);
      }
    };

    fetchContributions();
  }, [username]);

  return (
    <CalendarHeatmap
      startDate={new Date('2024-01-01')} // Updated start date for current year
      endDate={new Date()}
      values={contributions}
    />
  );
};

export default ContributionGrid;
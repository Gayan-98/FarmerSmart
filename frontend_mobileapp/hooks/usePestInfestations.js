import { useState, useEffect } from 'react';

export const usePestInfestations = () => {
  const [infestations, setInfestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInfestations = async (area = null) => {
    try {
      setLoading(true);
      setError(null);
      const url = area
        ? `http://your-backend-url/api/pest-infestations/area/${area}`
        : 'http://your-backend-url/api/pest-infestations';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch pest infestations');
      }
      
      const data = await response.json();
      setInfestations(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching pest infestations:', err);
    } finally {
      setLoading(false);
    }
  };

  const addInfestation = async (newInfestation) => {
    try {
      const response = await fetch('http://your-backend-url/api/pest-infestations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInfestation),
      });

      if (!response.ok) {
        throw new Error('Failed to add pest infestation');
      }

      const data = await response.json();
      setInfestations(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error adding pest infestation:', err);
      throw err;
    }
  };

  return {
    infestations,
    loading,
    error,
    fetchInfestations,
    addInfestation,
  };
}; 
import React, { useState, useEffect, useCallback } from "react";
import { useExhibition } from "../../contexts/ExhibitionContext";
import { db } from "../../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface Exhibition {
  id: string;
  name: string;
}

const ExhibitionSelector: React.FC = () => {
  const { selectedExhibition, setSelectedExhibition } = useExhibition();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExhibitions = useCallback(async () => {
    try {
      const q = query(collection(db, 'exhibitions'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const exhibitionData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Exhibition));
      

      
      setExhibitions(exhibitionData);
      
      // If no exhibition is selected and we have exhibitions, select the first one
      if (!selectedExhibition && exhibitionData.length > 0) {
        setSelectedExhibition(exhibitionData[0].name.toLowerCase().replace(/\s+/g, '-'));
      }
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      setExhibitions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedExhibition, setSelectedExhibition]);

  useEffect(() => {
    fetchExhibitions();
  }, [fetchExhibitions]);

  if (loading) {
    return (
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Exhibition:</label>
        <select className="border rounded px-2 py-1" disabled>
          <option>Loading...</option>
        </select>
      </div>
    );
  }

  if (exhibitions.length === 0) {
    return (
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Exhibition:</label>
        <select className="border rounded px-2 py-1" disabled>
          <option>No exhibitions available</option>
        </select>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="mr-2 font-semibold">Select Exhibition:</label>
      <select
        value={selectedExhibition}
        onChange={e => setSelectedExhibition(e.target.value)}
        className="border rounded px-2 py-1"
      >
        {exhibitions.map(exh => (
          <option key={exh.id} value={exh.name.toLowerCase().replace(/\s+/g, '-')}>{exh.name}</option>
        ))}
      </select>
    </div>
  );
};

export default ExhibitionSelector; 
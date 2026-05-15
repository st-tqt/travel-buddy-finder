import { useState, useEffect } from 'react';
import { tripApi } from '../../api/tripApi';
import TripCard from './TripCard';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we would fetch this. For now we use some mock data locally until MSW handlers for trips are complete.
    const fetchTrips = async () => {
      try {
        // const data = await tripApi.getAllTrips();
        // setTrips(data);
        
        // Mock data
        setTrips([
          { id: 1, title: 'Trip to Paris', description: 'Exciting trip to Paris.', destination: 'Paris, France', startDate: '2026-06-01' },
          { id: 2, title: 'Hiking in the Alps', description: 'A wonderful hiking experience.', destination: 'Swiss Alps', startDate: '2026-07-15' },
        ]);
      } catch (error) {
        console.error('Failed to fetch trips', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return <div>Loading trips...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map(trip => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
};

export default TripList;

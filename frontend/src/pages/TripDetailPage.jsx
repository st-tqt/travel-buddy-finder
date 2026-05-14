import { useParams } from 'react-router-dom';

const TripDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Trip Details - {id}</h1>
      <p>Trip details will go here.</p>
    </div>
  );
};

export default TripDetailPage;

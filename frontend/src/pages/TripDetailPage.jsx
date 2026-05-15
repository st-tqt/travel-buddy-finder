import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../api/tripApi';
import { joinRequestApi } from '../api/joinRequestApi';
import { useAuth } from '../hooks/useAuth';
import ChatWidget from '../components/chat/ChatWidget';

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [joinStatus, setJoinStatus] = useState(''); // '', 'loading', 'pending', 'joined'

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripData = await tripApi.getTripById(id);
        setTrip(tripData);
        
        // If owner, fetch join requests
        if (user && tripData.ownerId === user.id) {
          const reqs = await joinRequestApi.getRequestsForTrip(id);
          setRequests(reqs);
        } else if (user) {
          // If guest, check if already joined or pending
          // For now, we mock this by checking if user is in members array
          const isMember = tripData.members?.some(m => m.id === user.id);
          if (isMember) {
            setJoinStatus('joined');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Could not load trip details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTripData();
  }, [id, user]);

  const handleJoinTrip = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setJoinStatus('loading');
      await joinRequestApi.createRequest({ tripId: id });
      setJoinStatus('pending');
    } catch (err) {
      if (err.response?.status === 409) {
        setJoinStatus('pending');
        alert('You have already requested to join this trip.');
      } else {
        setJoinStatus('');
        alert('Failed to send join request. Please try again.');
      }
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await joinRequestApi.approveRequest(requestId);
      setRequests(requests.filter(req => req.id !== requestId));
      // Optionally reload trip members
      const updatedTrip = await tripApi.getTripById(id);
      setTrip(updatedTrip);
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await joinRequestApi.rejectRequest(requestId);
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4">
        <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900">Oops!</h2>
        <p className="text-gray-500 mt-2">{error || 'Trip not found'}</p>
        <button onClick={() => navigate('/')} className="mt-6 text-blue-600 font-medium hover:underline">
          &larr; Back to Trips
        </button>
      </div>
    );
  }

  const isOwner = user && trip.ownerId === user.id;
  const isMember = joinStatus === 'joined' || trip.members?.some(m => m.id === user?.id);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header Image */}
          <div className="h-64 sm:h-80 relative bg-indigo-900">
            <img 
              src={`https://source.unsplash.com/1200x600/?${encodeURIComponent(trip.location || 'travel')}`} 
              alt={trip.title}
              className="w-full h-full object-cover opacity-60"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 text-white">
              <div className="flex flex-wrap gap-2 mb-3">
                {trip.tags?.map((tag, idx) => (
                  <span key={idx} className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
                    #{tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold mb-2 tracking-tight">{trip.title}</h1>
              <div className="flex items-center text-gray-200">
                <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                <span className="text-lg">{trip.location}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About this trip</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                    {trip.description || "No description provided."}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Members ({trip.currentMember || 0}/{trip.maxMember})</h2>
                  <div className="flex flex-wrap gap-4">
                    {/* Owner */}
                    <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-3">
                        {trip.ownerName?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{trip.ownerName || 'Trip Owner'}</div>
                        <div className="text-xs text-blue-600 font-medium">Organizer</div>
                      </div>
                    </div>
                    {/* Other members */}
                    {trip.members?.filter(m => m.id !== trip.ownerId).map(member => (
                      <div key={member.id} className="flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
                          {member.name?.charAt(0) || 'U'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Join Requests Table for Owner */}
                {isOwner && (
                  <section className="mt-10 border-t border-gray-100 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Requests</h2>
                    {requests.length === 0 ? (
                      <p className="text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center">No pending requests.</p>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested At</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map(req => (
                              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                      {req.userName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{req.userName || `User ${req.userId}`}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button 
                                    onClick={() => handleApprove(req.id)}
                                    className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg mr-2 transition-colors shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleReject(req.id)}
                                    className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors shadow-sm"
                                  >
                                    Reject
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Trip Info</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="font-medium">Starts:</span>
                      <span className="ml-auto text-gray-900">{new Date(trip.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="font-medium">Ends:</span>
                      <span className="ml-auto text-gray-900">{new Date(trip.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      <span className="font-medium">Capacity:</span>
                      <span className="ml-auto text-gray-900 font-bold">{trip.currentMember || 0} / {trip.maxMember}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-auto font-bold ${trip.status === 'OPEN' ? 'text-green-600' : 'text-gray-500'}`}>
                        {trip.status || 'OPEN'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwner ? (
                    <div className="space-y-3">
                      <button className="w-full bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors">
                        Edit Trip
                      </button>
                      <button className="w-full bg-white border-2 border-red-500 text-red-500 font-bold py-3 px-4 rounded-xl hover:bg-red-50 transition-colors">
                        Delete Trip
                      </button>
                    </div>
                  ) : isMember ? (
                    <div className="w-full bg-green-100 text-green-800 text-center font-bold py-3 px-4 rounded-xl border border-green-200">
                      You are a member!
                    </div>
                  ) : (
                    <button 
                      onClick={handleJoinTrip}
                      disabled={joinStatus === 'loading' || joinStatus === 'pending' || (trip.currentMember >= trip.maxMember)}
                      className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-md transition-all ${
                        joinStatus === 'pending' 
                          ? 'bg-yellow-500 text-white cursor-not-allowed'
                          : trip.currentMember >= trip.maxMember
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                      }`}
                    >
                      {joinStatus === 'loading' && <span className="inline-block animate-spin mr-2">⟳</span>}
                      {joinStatus === 'pending' ? 'Pending Approval...' : 
                       trip.currentMember >= trip.maxMember ? 'Trip is Full' : 'Join Trip'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Show ChatWidget if user is a member or owner */}
      {(isOwner || isMember) && <ChatWidget tripId={id} />}
    </div>
  );
};

export default TripDetailPage;

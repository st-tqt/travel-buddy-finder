import { http, HttpResponse, delay } from 'msw'

export const handlers = [
  // ==========================================
  // [Trip Service handlers]
  // ==========================================
  http.get('/api/trips', async () => {
    await delay(500)
    return HttpResponse.json([
      { id: "trip-1", ownerId: "uuid-1", title: "Da Lat Escape", location: "Da Lat, VN", startDate: "2026-06-10", endDate: "2026-06-15", maxMember: 5, currentMember: 2, tags: ["nature", "chill"], status: "OPEN" },
      { id: "trip-2", ownerId: "uuid-2", title: "Phu Quoc Summer", location: "Phu Quoc, VN", startDate: "2026-07-01", endDate: "2026-07-05", maxMember: 10, currentMember: 8, tags: ["beach", "party"], status: "OPEN" },
      { id: "trip-3", ownerId: "uuid-3", title: "Hanoi Autumn", location: "Hanoi, VN", startDate: "2026-10-10", endDate: "2026-10-15", maxMember: 4, currentMember: 4, tags: ["culture", "food"], status: "CLOSED" },
      { id: "trip-4", ownerId: "uuid-4", title: "Sapa Trekking", location: "Sapa, VN", startDate: "2026-08-20", endDate: "2026-08-25", maxMember: 6, currentMember: 3, tags: ["trekking", "mountain"], status: "OPEN" },
      { id: "trip-5", ownerId: "uuid-1", title: "Da Nang Roadtrip", location: "Da Nang, VN", startDate: "2026-09-01", endDate: "2026-09-07", maxMember: 8, currentMember: 5, tags: ["roadtrip", "beach"], status: "OPEN" },
    ])
  }),

  http.get('/api/trips/:id', async ({ params }) => {
    await delay(500)
    return HttpResponse.json({
      id: params.id,
      ownerId: "uuid-1",
      title: "Detailed Trip Title",
      location: "Detailed Location",
      startDate: "2026-06-10",
      endDate: "2026-06-15",
      maxMember: 5,
      currentMember: 2,
      tags: ["nature", "chill"],
      status: "OPEN",
      description: "This is a detailed mock description for the trip."
    })
  }),

  http.post('/api/trips', async ({ request }) => {
    const body = await request.json()
    await delay(500)
    return HttpResponse.json({
      id: "trip-new-" + Date.now(),
      ...body,
      currentMember: 1,
      status: "OPEN"
    }, { status: 201 })
  }),

  http.put('/api/trips/:id', async ({ request, params }) => {
    const body = await request.json()
    await delay(500)
    return HttpResponse.json({
      id: params.id,
      ...body
    })
  }),

  http.delete('/api/trips/:id', async () => {
    await delay(500)
    return HttpResponse.json({ message: "Deleted" })
  }),

  // ==========================================
  // [Join Request handlers]
  // ==========================================
  http.post('/api/join-requests', async ({ request }) => {
    const body = await request.json()
    await delay(500)
    return HttpResponse.json({
      id: "req-new-" + Date.now(),
      tripId: body.tripId,
      userId: body.userId,
      status: "pending"
    }, { status: 201 })
  }),

  http.get('/api/join-requests', async ({ request }) => {
    const url = new URL(request.url)
    const tripId = url.searchParams.get('tripId')
    await delay(500)
    return HttpResponse.json([
      { id: "req-1", tripId: tripId || "trip-1", userId: "user-2", status: "pending", message: "I want to join!" },
      { id: "req-2", tripId: tripId || "trip-1", userId: "user-3", status: "approved", message: "Can I join?" },
      { id: "req-3", tripId: tripId || "trip-1", userId: "user-4", status: "rejected", message: "Please let me join." },
    ])
  }),

  http.put('/api/join-requests/:id/approve', async () => {
    await delay(500)
    return HttpResponse.json({ message: "Approved" })
  }),

  http.put('/api/join-requests/:id/reject', async () => {
    await delay(500)
    return HttpResponse.json({ message: "Rejected" })
  }),

  // ==========================================
  // [Notification handlers]
  // ==========================================
  http.get('/api/notifications/:userId', async ({ params }) => {
    await delay(500)
    return HttpResponse.json([
      { id: "notif-1", message: "Yêu cầu tham gia trip đã được duyệt", type: "JOIN_APPROVED", isRead: false, createdAt: new Date().toISOString() },
      { id: "notif-2", message: "Có người xin tham gia trip của bạn", type: "NEW_JOIN_REQUEST", isRead: true, createdAt: new Date().toISOString() },
      { id: "notif-3", message: "Trip sắp khởi hành vào ngày mai", type: "TRIP_REMINDER", isRead: false, createdAt: new Date().toISOString() },
    ])
  }),

  http.put('/api/notifications/:id/read', async () => {
    await delay(500)
    return HttpResponse.json({ message: "Marked as read" })
  }),

  // ==========================================
  // [Chat handlers]
  // ==========================================
  http.get('/api/messages', async ({ request }) => {
    const url = new URL(request.url)
    const tripId = url.searchParams.get('tripId')
    await delay(500)
    return HttpResponse.json([
      { id: "msg-1", tripId: tripId, senderId: "uuid-1", senderName: "Test User", content: "Hello everyone!", createdAt: new Date(Date.now() - 10000).toISOString() },
      { id: "msg-2", tripId: tripId, senderId: "uuid-2", senderName: "Alice", content: "Hi! Excited for the trip.", createdAt: new Date(Date.now() - 8000).toISOString() },
      { id: "msg-3", tripId: tripId, senderId: "uuid-3", senderName: "Bob", content: "What should we pack?", createdAt: new Date(Date.now() - 6000).toISOString() },
      { id: "msg-4", tripId: tripId, senderId: "uuid-1", senderName: "Test User", content: "Just some light clothes and sunscreen.", createdAt: new Date(Date.now() - 4000).toISOString() },
      { id: "msg-5", tripId: tripId, senderId: "uuid-2", senderName: "Alice", content: "Got it, thanks!", createdAt: new Date(Date.now() - 2000).toISOString() },
    ])
  }),

  // ==========================================
  // [Review handlers]
  // ==========================================
  http.post('/api/reviews', async ({ request }) => {
    const body = await request.json()
    await delay(500)
    return HttpResponse.json({
      id: "rev-new-" + Date.now(),
      tripId: body.tripId,
      reviewerId: body.reviewerId,
      targetUserId: body.targetUserId,
      rating: body.rating,
      comment: body.comment
    }, { status: 201 })
  }),

  http.get('/api/reviews/user/:id', async ({ params }) => {
    await delay(500)
    return HttpResponse.json([
      { id: "rev-1", tripId: "trip-1", reviewerId: "uuid-2", targetUserId: params.id, rating: 5, comment: "Great trip companion!" },
      { id: "rev-2", tripId: "trip-2", reviewerId: "uuid-3", targetUserId: params.id, rating: 4, comment: "Very helpful and friendly." },
      { id: "rev-3", tripId: "trip-3", reviewerId: "uuid-4", targetUserId: params.id, rating: 5, comment: "Would love to travel together again." },
    ])
  })
]

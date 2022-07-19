function joinRoom(
  roomId: string,
  currentUserId: number,
  selectedUserId: number,
  socket: any
) {
  if (!currentUserId) {
    return alert("Please login");
  }

  socket.emit("join-room", roomId, selectedUserId, currentUserId);

  // dispatch for notifications
  // dispatch(resetNotifications(room));
}

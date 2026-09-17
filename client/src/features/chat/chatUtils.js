// Shared display label for a conversation, used by both the conversation
// list rows and the open thread's header, so the two always read the same
// way ("Inoka Edirisinghe - Job 27").
export function formatConversationTitle(counterpartName, bookingId) {
  return `${counterpartName ?? 'Unknown'} - Job ${bookingId}`;
}

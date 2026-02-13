import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Helper: Trigger seat lock event
export async function triggerSeatLock(seats: Array<{ row: string; number: number }>) {
  await pusherServer.trigger('seats-channel', 'seat-locked', {
    seats,
    timestamp: new Date().toISOString(),
  });
}

// Helper: Trigger seat unlock event
export async function triggerSeatUnlock(seats: Array<{ row: string; number: number }>) {
  await pusherServer.trigger('seats-channel', 'seat-unlocked', {
    seats,
    timestamp: new Date().toISOString(),
  });
}

// Helper: Trigger seat paid event
export async function triggerSeatPaid(seats: Array<{ row: string; number: number }>) {
  await pusherServer.trigger('seats-channel', 'seat-paid', {
    seats,
    timestamp: new Date().toISOString(),
  });
}
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Incident, IncidentEvent } from '../types';

const SOCKET_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3001/incidents';

interface UseIncidentSocketParams {
  incidentId: string | null;
  token: string | null;
  onIncidentUpdated: (incident: Incident) => void;
  onNewEvent: (event: IncidentEvent) => void;
}

export function useIncidentSocket({
  incidentId,
  token,
  onIncidentUpdated,
  onNewEvent,
}: UseIncidentSocketParams) {
  useEffect(() => {
    if (!incidentId || !token) return;

    const socket: Socket = io(SOCKET_URL, { auth: { token } });

    socket.emit('incident:join', incidentId);
    socket.on('incident:updated', onIncidentUpdated);
    socket.on('incident:event', onNewEvent);

    return () => {
      socket.emit('incident:leave', incidentId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId, token]);
}
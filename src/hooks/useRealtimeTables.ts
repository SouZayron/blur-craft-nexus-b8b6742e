import { useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";

interface UseRealtimeTablesOptions {
  channelName: string;
  enabled?: boolean;
  fallbackMs?: number;
  onSync: () => void | Promise<void>;
  tables: string[];
}

export const useRealtimeTables = ({
  channelName,
  enabled = true,
  fallbackMs = 2500,
  onSync,
  tables,
}: UseRealtimeTablesOptions) => {
  const onSyncRef = useRef(onSync);
  const tablesKey = tables.join("|");

  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    const sync = () => {
      if (!active) return;
      void onSyncRef.current();
    };

    sync();

    const channel = tables.reduce(
      (currentChannel, table) =>
        currentChannel.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          sync,
        ),
      supabase.channel(channelName),
    );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") sync();
    });

    const intervalId = window.setInterval(sync, fallbackMs);
    const handleFocus = () => sync();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") sync();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void supabase.removeChannel(channel);
    };
  }, [channelName, enabled, fallbackMs, tablesKey]);
};
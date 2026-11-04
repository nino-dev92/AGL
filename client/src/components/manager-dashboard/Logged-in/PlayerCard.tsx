import type { User } from "../../../types/types";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "sonner";
import { isAxiosError } from "axios";

type Props = {
  player?: Partial<User> & { _id?: string };
  showDelete?: boolean;
  teamId?: string;
  height?: number;
  variant?: "default" | "roster";
};

type DeletePlayerData = {
  memberId: string;
  teamId: string;
};

export default function PlayerCard({
  player,
  showDelete = false,
  teamId,
  height,
  variant = "default",
}: Props) {
  const [show, setShow] = useState<boolean>(false);
  const client = useQueryClient();
  const axiosPrivate = useAxiosPrivate();
  const totalKills = player?.totalKills ?? 0;
  const totalDeaths = player?.totalDeaths ?? 0;
  const totalGames = player?.totalGames ?? 0;
  const KD = totalDeaths > 0 ? totalKills / totalDeaths : 0;
  const playerId = player?.id ?? player?._id;
  const isRosterCard = variant === "roster";
  const initial = player?.userName?.trim().charAt(0).toUpperCase() || "?";
  const cardSize = isRosterCard
    ? "h-full w-full min-w-0 p-3"
    : `min-w-50 ${height ? `h-${height}` : "h-12"} p-2`;

  const removePlayerMutation = useMutation({
    mutationFn: async ({ memberId, teamId }: DeletePlayerData) => {
      const res = await axiosPrivate.delete(
        `/teams/${teamId}/members/${memberId}`,
      );

      return res.data;
    },

    onSuccess: () => {
      toast.success("Player removed from team");
      client.invalidateQueries({ queryKey: ["teams"] });
      setShow(false);
    },

    onError: (error: unknown) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message ?? "Unable to remove player from team");
    },
  });

  return (
    <div
      className={`${cardSize} flex items-center justify-between gap-3 rounded-xl border border-agl-border-light bg-agl-background-dark-gray text-white transition-colors hover:border-agl-red/50`}
    >
      <div
        className={`flex min-w-0 items-center ${isRosterCard ? "gap-3" : "gap-2"}`}
      >
        <div
          className={`${isRosterCard ? "h-10 text-base" : "h-8 text-sm"} flex aspect-square shrink-0 items-center justify-center rounded-full border border-agl-border-light bg-agl-red font-bold`}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-[14px]" title={player?.userName}>
            {player?.userName?.toUpperCase() ?? "UNKNOWN PLAYER"}
          </p>
          <p className="text-[12px] text-agl-gray">
            {KD.toFixed(2)} KD
            {isRosterCard && totalGames > 0 ? ` · ${totalGames} matches` : ""}
          </p>
        </div>
      </div>

      {/**Delete Icon */}
      {showDelete && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Remove ${player?.userName ?? "player"} from team`}
          title="Remove player from team"
          className="cursor-pointer hover:scale-110 hover:text-agl-red transition-all duration-200 ease"
          onClick={() => setShow(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setShow(true);
            }
          }}
        >
          <RiDeleteBin6Line />
        </div>
      )}

      {/**Delete Player Modal */}
      {show && playerId && teamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-player-title"
            className="w-full max-w-sm rounded-2xl border border-agl-border-light bg-agl-black p-5 text-agl-white shadow-xl"
          >
            <h2 id="remove-player-title" className="mb-2 text-lg font-bold">
              Remove {player?.userName ?? "player"} from team?
            </h2>
            <p className="mb-5 text-sm text-agl-gray">
              This will remove the player from this team.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-agl-border-light px-3 py-2 hover:bg-agl-background-light disabled:cursor-not-allowed disabled:opacity-60"
                disabled={removePlayerMutation.isPending}
                onClick={() => setShow(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-agl-red px-3 py-2 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={removePlayerMutation.isPending}
                onClick={() =>
                  removePlayerMutation.mutate({
                    memberId: playerId,
                    teamId,
                  })
                }
              >
                {removePlayerMutation.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

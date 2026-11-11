import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import PlayerCard from "../Logged-in/PlayerCard";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { FaPlus } from "react-icons/fa6";
import { GiTrophyCup } from "react-icons/gi";
import TournamentRegistrationCard from "./TournamentRegistrationCard";
import type { Team } from "../../../types/types";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "sonner";

type Props = {
  team: Team;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TeamDetails({ team, setMode, setShowModal }: Props) {
  const [showModal, closeModal] = useState<boolean>(false);
  const axiosPrivate = useAxiosPrivate();
  const client = useQueryClient();
  const players = team.members;

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.delete(`/teams/${id}`);
      return response.data;
    },

    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted Successfully");
      closeModal(false);
    },
  });

  const deleteTeam = (id: string) => {
    deleteTeamMutation.mutate(id);
  };

  return (
    <div className="">
      {" "}
      <div className="flex flex-col border-b border-agl-border-light pb-4 ">
        <div className="flex justify-between">
          <div>
            <h2 className="font-bebas-neue text-2xl text-agl-white">
              {team.name.toUpperCase()}
            </h2>
            <p className="text-agl-gray">Tag [{team.slug.toUpperCase()}]</p>
          </div>
          <div>
            <RiDeleteBin6Line
              size={20}
              title="Delete team"
              className="cursor-pointer text-agl-white hover:text-agl-red"
              onClick={() => closeModal(true)}
            />
          </div>
        </div>

        {/**Buttons */}
        <div className="flex h-8 gap-2 mt-3 text-[12px]">
          <button
            className="flex gap-1 items-center px-2 py-1 bg-agl-yellow hover:bg-yellow-200 rounded-xl cursor-pointer"
            onClick={() => {
              setMode("add");
              setShowModal(true);
            }}
          >
            <FaPlus />
            Add Player
          </button>
          <button
            className="flex gap-1 items-center text-agl-white px-2 py-1 bg-agl-border-light hover:bg-gray-900 rounded-xl cursor-pointer"
            onClick={() => {
              setMode("register");
              setShowModal(true);
            }}
          >
            <GiTrophyCup /> Register for Tournament
          </button>
        </div>
      </div>
      {/**Team Members */}
      <div className="flex flex-col border-b border-agl-border-light py-4">
        <h3 className="font-bebas-neue text-xl text-agl-white">PLAYERS</h3>
        <div className="flex flex-col gap-2">
          {players.length > 0 ? (
            players.map((player) => (
              <PlayerCard
                key={player._id}
                player={player}
                showDelete={true}
                teamId={team._id}
                height={19}
              />
            ))
          ) : (
            <h2 className="text-agl-white text-center">No player registered</h2>
          )}
        </div>
      </div>
      {/**Tournament Registrations*/}
      <div className="flex flex-col py-4">
        <h3 className="font-bebas-neue text-2xl text-agl-white">
          TOURNAMENT REGISTRATIONS
        </h3>

        {/**Registragion Cards */}
        <TournamentRegistrationCard team={team} />
      </div>
      {/**Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-team-title"
            className="w-full max-w-sm rounded-2xl border border-agl-border-light bg-agl-black p-5 text-agl-white shadow-xl"
          >
            <h2 id="delete-team-title" className="mb-2 text-lg font-bold">
              Delete {team.name}?
            </h2>
            <p className="mb-5 text-sm text-agl-gray">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-agl-border-light px-3 py-2 hover:bg-agl-background-light"
                onClick={() => closeModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-agl-red px-3 py-2 hover:bg-red-500"
                onClick={() => deleteTeam(team._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

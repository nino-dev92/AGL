import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Game, Team, Tournamen, User } from "../../../types/types";
import useAuth from "../../../hooks/useAuth";
import TeamCard from "./TeamCard";
import TeamDetails from "./TeamDetails";
import { FaPlus } from "react-icons/fa6";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { IoSearch } from "react-icons/io5";

type Props = {
  teams: Team[];
};

type CreateTeamData = {
  name: string;
  manager: string | undefined;
  maxMembers: string | number;
  game: string;
  description: string;
};

type AddPlayerData = { teamId: string; playerId: string };

type RegisterForTournamentData = { tournament: string; team: string };

export default function TeamManagement({ teams }: Props) {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const [teamName, setTeamName] = useState<string>("");
  const [player, setPlayer] = useState<User | null>(null);
  const [playerSearch, setPlayerSearch] = useState("");
  const [debouncedPlayerSearch, setDebouncedPlayerSearch] = useState("");
  const [maxMembers, setMaxMembers] = useState<string | number>("");
  const [game, setGame] = useState<string>("");
  const [tournamentId, setTournamentId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [mode, setMode] = useState<string>("");
  const axiosPrivate = useAxiosPrivate();

  const selectedTeam =
    teams.find((team) => team._id === selectedTeamId) ?? teams[0] ?? null;

  const gameQuery = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const res = await axiosPrivate.get<{ data: Game[] }>("/games");

      return res.data.data;
    },
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedPlayerSearch(playerSearch.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [playerSearch]);

  const playerQuery = useQuery({
    queryKey: ["players", "search", debouncedPlayerSearch],
    enabled: debouncedPlayerSearch.length >= 2,
    queryFn: async () => {
      const res = await axiosPrivate.get<{ data: User[] }>("/players", {
        params: {
          search: debouncedPlayerSearch,
          limit: 50,
        },
      });

      return res.data.data;
    },
  });

  const tournamentQuery = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const res = await axiosPrivate.get<{ data: Tournamen[] }>("/tournaments");
      return res.data.data;
    },
  });

  const matchingPlayers = Array.from(
    new Map((playerQuery.data ?? []).map((candidate) => [candidate.id, candidate])).values(),
  );
  const filteredPlayers = matchingPlayers.filter((candidate) => {
    const alreadyOnTeam = selectedTeam?.members.some(
      (member) => (member.id ?? member._id) === candidate.id,
    );
    return !alreadyOnTeam;
  });

  const allGames = gameQuery.data ?? [];

  const tournaments = tournamentQuery.data
    ? tournamentQuery.data.filter(
        (tournament) => tournament.status === "registration-open",
      )
    : [];

  function clearModal() {
    setTeamName("");
    setDescription("");
    setPlayer(null);
    setPlayerSearch("");
    setDebouncedPlayerSearch("");
    setTournamentId("");
    setShowModal(false);
  }

  const createTeamMutation = useMutation<unknown, Error, CreateTeamData>({
    mutationFn: async (newTeamData) => {
      const response = await axiosPrivate.post("/teams", newTeamData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Team created successfully");

      queryClient.invalidateQueries({ queryKey: ["teams"] });
      clearModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create team");
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: async ({ teamId, playerId }: AddPlayerData) => {
      const res = await axiosPrivate.patch(`/teams/${teamId}/members`, {
        members: [playerId],
      });
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Player successfully added to team");
      clearModal();
    },

    onError: () => {
      toast.error("Error adding player! Try again");
    },
  });

  const registerForTournamentMutation = useMutation({
    mutationFn: async ({ tournament, team }: RegisterForTournamentData) => {
      const res = await axiosPrivate.post("/tournament-registrations", {
        tournament,
        team,
      });

      return res.data;
    },

    onSuccess: () => {
      toast.success("Successfully registered team for tournament");
      queryClient.invalidateQueries({
        queryKey: ["tournament-registrations", "my-applications"],
      });
      setShowModal(false);
    },

    onError: (error: unknown) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message ?? "Sorry, could not register team for tournament");
    },
  });

  const createTeam = () => {
    if (game === "") toast.error("Choose team game");

    const body = {
      name: teamName,
      manager: auth?.id,
      maxMembers,
      game,
      description,
    };

    createTeamMutation.mutate(body);
  };

  return (
    <>
      <section
        className={`${showModal && "blur-xs"} flex flex-col gap-4 my-4 min-w-full transition-all ease`}
      >
        <div className="flex justify-between items-center text-agl-white">
          <h2 className="font-bebas-neue text-2xl">TEAM MANAGEMENT</h2>
          <button
            className="flex gap-2 w- place-content-center items-center text-[14px] p-2 bg-agl-red hover:bg-red-500 rounded-xl cursor-pointer"
            onClick={() => {
              setMode("create");
              setShowModal(true);
            }}
          >
            <FaPlus /> Create Team
          </button>
        </div>

        {/**Team Section --- Left */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/**Team Cards */}
          <div className="flex flex-col gap-2">
            {teams.map((team) => {
              return (
                <div key={team._id} onClick={() => setSelectedTeamId(team._id)}>
                  <TeamCard
                    team={team}
                    selected={team._id === selectedTeam?._id}
                  />
                </div>
              );
            })}
            {teams.length === 0 && (
              <p className="text-sm text-agl-gray">No teams found.</p>
            )}
          </div>

          {/**Team Details --- Right */}
          <div className="grow p-4 border-agl-border-light bg-agl-background-light rounded-2xl">
            {selectedTeam ? (
              <TeamDetails
                team={selectedTeam}
                setMode={setMode}
                setShowModal={setShowModal}
              />
            ) : (
              <p className="text-agl-gray">
                Select a team to view its details.
              </p>
            )}
          </div>
        </div>
      </section>

      {/**Modal */}
      {showModal && (
        <section className="fixed inset-0 flex items-center justify-center z-50">
          <div className="text-agl-white w-120 justify-center border border-agl-border-light bg-agl-black p-4 rounded-2xl">
            <div className="flex justify-between items-center">
              {/**Create Team Modal */}
              {mode === "create" && (
                <h2 className="font-bebas-neue text-2xl capitalize">
                  CREATE TEAM
                </h2>
              )}
              {mode === "add" && (
                <h2 className="font-bebas-neue text-2xl capitalize">
                  Add Players
                </h2>
              )}
              {mode === "register" && (
                <h2 className="font-bebas-neue text-2xl capitalize">
                  Register for Tournament
                </h2>
              )}
              <button
                className="py-1 px-2 font-extrabold border border-agl-background-light  bg-agl-background-light hover:border-agl-gray text-agl-gray text-[12px] cursor-pointer rounded"
                onClick={clearModal}
              >
                x
              </button>
            </div>
            <p className="text-agl-gray text-[14px] border-b border-agl-border-light pb-2">
              {mode === "create"
                ? "Register a new team on the platform"
                : selectedTeam?.name}
            </p>

            {/**Create Team Form */}
            {mode === "create" && (
              <>
                {/**Form */}
                <form className="my-2 flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-agl-gray text-[14px] capitalize">
                      TEAM NAME
                    </label>
                    <input
                      type="text"
                      placeholder="Team name..."
                      className="p-1 border border-agl-border-light rounded text-[14px]"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-agl-gray text-[14px] capitalize">
                      MAX MEMBERS
                    </label>
                    <input
                      type="number"
                      className="p-1 border border-agl-border-light rounded text-[14px]"
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-agl-gray text-[14px] capitalize">
                      GAME
                    </label>
                    <select
                      value={game}
                      className="border border-agl-gray p-1 rounded cursor-pointer"
                      onChange={(e) => setGame(e.target.value)}
                    >
                      <option value="" className="text-black">
                        Select Game
                      </option>
                      {allGames.map((game) => {
                        return (
                          <option
                            key={game._id}
                            value={game._id}
                            className="text-black"
                            onClick={() => setGame(game._id)}
                          >
                            {game.name?.toUpperCase()}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/**Description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-agl-gray text-[14px] capitalize">
                      {" "}
                      DESCRIPTION
                    </label>
                    <textarea
                      placeholder="Description...."
                      className="h-20 p-2 text-[14px] border border-agl-gray rounded"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/**Buttons */}
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      type="button"
                      className="bg-agl-red hover:bg-red-400 flex-1 p-2 rounded text-[14px] cursor-pointer"
                      onClick={clearModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="bg-agl-success hover:bg-green-400 flex-1 p-2 rounded text-[14px] cursor-pointer disabled:cursor-no-drop disabled:bg-green-700"
                      disabled={teamName === "" || description === ""}
                      onClick={createTeam}
                    >
                      Create Team
                    </button>
                  </div>
                </form>
              </>
            )}

            {/**Add Player Form */}
            {mode === "add" && (
              <form className="flex flex-col gap-3 mt-4 w-full">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-agl-gray text-[14px] capitalize">
                    PLAYER
                  </label>
                  <div className="flex relative">
                    <IoSearch
                      size={17}
                      className="absolute top-3 left-2 text-agl-gray"
                    />
                    <input
                      type="text"
                      placeholder="Search players by username..."
                      value={player ? player.userName : playerSearch}
                      className="w-full py-2 px-8 border border-agl-border-light rounded-xl focus:border-agl-red focus:outline-none"
                      onChange={(event) => {
                        setPlayer(null);
                        setPlayerSearch(event.target.value);
                      }}
                    />
                  </div>
                  {playerSearch.trim() && !player && (
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-agl-border-light bg-agl-black">
                      {playerSearch.trim().length < 2 ? (
                        <p className="px-3 py-2 text-sm text-agl-gray">
                          Enter at least 2 characters to search.
                        </p>
                      ) : playerQuery.isFetching ? (
                        <p className="px-3 py-2 text-sm text-agl-gray">
                          Searching players...
                        </p>
                      ) : playerQuery.isError ? (
                        <p className="px-3 py-2 text-sm text-agl-gray">
                          Could not search players. Please try again.
                        </p>
                      ) : filteredPlayers.length > 0 ? (
                        filteredPlayers.map((candidate) => (
                          <button
                            key={candidate.id}
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm text-agl-white hover:bg-agl-background-light"
                            onClick={() => {
                              setPlayer(candidate);
                              setPlayerSearch(candidate.userName);
                            }}
                          >
                            {candidate.userName}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-agl-gray">
                          No available players found.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/**Buttons */}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="px-2 py-1 text-[14px] hover:bg-agl-background-light bg-agl-background-light/50 rounded cursor-pointer"
                    onClick={clearModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-[14px] text-black bg-agl-yellow rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedTeam || !player || addPlayerMutation.isPending}
                    onClick={() => {
                      if (selectedTeam && player) {
                        addPlayerMutation.mutate({
                          teamId: selectedTeam._id,
                          playerId: player.id,
                        });
                      }
                    }}
                  >
                    Add Player
                  </button>
                </div>
              </form>
            )}

            {/**Register Tournament Form */}
            {mode === "register" && (
              <form className="flex flex-col gap-3 mt-4 w-full">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-agl-gray text-[14px] capitalize">
                    Tournament
                  </label>
                  <select
                    value={tournamentId}
                    className="border border-agl-gray p-1 rounded cursor-pointer"
                    onChange={(e) => setTournamentId(e.target.value)}
                  >
                    <option value="" className="text-black">
                      Select Tournament
                    </option>
                    {tournaments.map((tournament) => {
                      return (
                        <option
                          key={tournament._id}
                          value={tournament._id}
                          className="text-black"
                        >
                          {tournament.name} - {""}
                          {tournament.game.name?.toUpperCase()}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/**Buttons */}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="px-2 py-1 text-[14px] hover:bg-agl-background-light bg-agl-background-light/50 rounded cursor-pointer"
                    onClick={clearModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-[14px] text-black bg-agl-success hover:bg-green-400 rounded cursor-pointer"
                    onClick={() => {
                      registerForTournamentMutation.mutate({
                        tournament: tournamentId,
                        team: selectedTeam._id,
                      });
                    }}
                  >
                    Submit Registration
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      )}
    </>
  );
}

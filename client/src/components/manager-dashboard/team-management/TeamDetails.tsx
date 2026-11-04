import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import PlayerCard from "../Logged-in/PlayerCard";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { FaPlus } from "react-icons/fa6";
import { GiTrophyCup } from "react-icons/gi";
import TournamentRegistrationCard from "./TournamentRegistrationCard";
import type { Team } from "../../../types/types";
import { RiDeleteBin6Line, RiEditLine } from "react-icons/ri";
import { toast } from "sonner";
import { isAxiosError } from "axios";

type Props = {
  team: Team;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const MAX_BANNER_SIZE_BYTES = 0.5 * 1024 * 1024;

export default function TeamDetails({ team, setMode, setShowModal }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const axiosPrivate = useAxiosPrivate();
  const client = useQueryClient();
  const players = team.members;

  const uploadTeamBannerMutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const formData = new FormData();
      formData.append("logo", file);
      return axiosPrivate.patch(`/teams/${team._id}/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["teams"] });
      setBannerFile(null);
      toast.success("Team banner updated");
    },
    onError: (error: unknown) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message ?? "Unable to update team banner");
    },
  });

  const deleteTeamBannerMutation = useMutation({
    mutationFn: async () => {
      return axiosPrivate.delete(`/teams/${team._id}/logo`);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["teams"] });
      setBannerFile(null);
      toast.success("Team banner deleted");
    },
    onError: (error: unknown) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message ?? "Unable to delete team banner");
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.delete(`/teams/${id}`);
      return response.data;
    },

    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted successfully");
      setShowEditModal(false);
    },
    onError: (error: unknown) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message ?? "Unable to delete team");
    },
  });

  const closeEditModal = () => {
    setShowEditModal(false);
    setConfirmDelete(false);
    setBannerFile(null);
  };

  return (
    <div className="">
      {team.logo?.url && (
        <div
          role="img"
          aria-label={`${team.name} banner`}
          className="mb-4 aspect-[3/1] w-full rounded-xl border border-agl-border-light bg-cover bg-center"
          style={{ backgroundImage: `url("${team.logo.url}")` }}
        />
      )}
      <div className="flex flex-col border-b border-agl-border-light pb-4 ">
        <div className="flex justify-between">
          <div>
            <h2 className="font-bebas-neue text-2xl text-agl-white">
              {team.name.toUpperCase()}
            </h2>
            <p className="text-agl-gray">Tag [{team.slug.toUpperCase()}]</p>
          </div>
          <div>
            <button
              type="button"
              aria-label={`Edit ${team.name}`}
              title="Edit team and banner"
              className="rounded-lg p-2 text-agl-white hover:bg-agl-border-light hover:text-agl-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-agl-red"
              onClick={() => setShowEditModal(true)}
            >
              <RiEditLine size={20} />
            </button>
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
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-team-title"
            className="w-full max-w-lg rounded-2xl border border-agl-border-light bg-agl-black p-5 text-agl-white shadow-xl"
          >
            {confirmDelete ? (
              <>
                <h2 id="edit-team-title" className="mb-2 text-lg font-bold">
                  Delete {team.name}?
                </h2>
                <p className="mb-5 text-sm text-agl-gray">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-agl-border-light px-3 py-2 hover:bg-agl-background-light"
                    disabled={deleteTeamMutation.isPending}
                    onClick={() => setConfirmDelete(false)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-agl-red px-3 py-2 hover:bg-red-500 disabled:opacity-60"
                    disabled={deleteTeamMutation.isPending}
                    onClick={() => deleteTeamMutation.mutate(team._id)}
                  >
                    {deleteTeamMutation.isPending
                      ? "Deleting..."
                      : "Delete team"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 id="edit-team-title" className="text-lg font-bold">
                      Edit {team.name}
                    </h2>
                    <p className="text-sm text-agl-gray">
                      Upload, replace, or remove the team banner.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    className="rounded-lg px-2 py-1 text-agl-gray hover:bg-agl-background-light hover:text-agl-white"
                    onClick={closeEditModal}
                  >
                    ×
                  </button>
                </div>

                {team.logo?.url ? (
                  <div
                    role="img"
                    aria-label={`${team.name} current banner`}
                    className="mb-4 aspect-3/1 w-full rounded-xl border border-agl-border-light bg-cover bg-center"
                    style={{ backgroundImage: `url("${team.logo.url}")` }}
                  />
                ) : (
                  <div className="mb-4 flex aspect-3/1 items-center justify-center rounded-xl border border-dashed border-agl-border-light text-sm text-agl-gray">
                    No team banner uploaded
                  </div>
                )}

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (bannerFile) {
                      uploadTeamBannerMutation.mutate({ file: bannerFile });
                    }
                  }}
                  className="space-y-3"
                >
                  <label
                    htmlFor="team-banner"
                    className="block text-sm font-medium"
                  >
                    Choose an image
                  </label>
                  <input
                    id="team-banner"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (file && file.size > MAX_BANNER_SIZE_BYTES) {
                        event.currentTarget.value = "";
                        setBannerFile(null);
                        toast.error("Image size must not exceed 0.5 MB");
                        return;
                      }
                      setBannerFile(file);
                    }}
                    className="block w-full text-sm text-agl-gray file:mr-3 file:rounded-lg file:border-0 file:bg-agl-border-light file:px-3 file:py-2 file:text-agl-white hover:file:bg-agl-background-light"
                  />
                  <p className="text-xs text-agl-gray">
                    JPEG, PNG, or WebP. Maximum file size: 0.5 MB.
                  </p>
                  <div className="flex flex-wrap justify-between gap-2 pt-2">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg border border-agl-red px-3 py-2 text-agl-red hover:bg-agl-red/10 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        !team.logo?.url ||
                        deleteTeamBannerMutation.isPending ||
                        uploadTeamBannerMutation.isPending
                      }
                      onClick={() => deleteTeamBannerMutation.mutate()}
                    >
                      <RiDeleteBin6Line />
                      {deleteTeamBannerMutation.isPending
                        ? "Removing..."
                        : "Delete banner"}
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-agl-border-light px-3 py-2 hover:bg-agl-background-light"
                        onClick={closeEditModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-agl-red px-3 py-2 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={
                          !bannerFile ||
                          uploadTeamBannerMutation.isPending ||
                          deleteTeamBannerMutation.isPending
                        }
                      >
                        {uploadTeamBannerMutation.isPending
                          ? "Uploading..."
                          : team.logo?.url
                            ? "Replace banner"
                            : "Upload banner"}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-5 border-t border-agl-border-light pt-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-agl-red hover:text-red-400"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <RiDeleteBin6Line />
                    Delete team
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "../types/types";
import useAuth from "../hooks/useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import apiAxios from "../api/apiAxios";
import { IoMdArrowBack } from "react-icons/io";

export default function PlayerProfile() {
  const { username } = useParams<string>();
  const [player, setPlayer] = useState<User>();
  const [editing, setEditing] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const openEditor = () => {
    setUserName(player?.userName ?? "");
    setFirstName(player?.firstName ?? "");
    setLastName(player?.lastName ?? "");
    setRegion(player?.region ?? "");
    setFormError("");
    setEditing(true);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    console.log(userName, firstName, lastName, region);

    try {
      const res = await apiAxios.patch("/users/me", {
        userName,
        firstName,
        lastName,
        region,
      });
      if (res.status == 201) {
        setPlayer((currentPlayer) =>
          currentPlayer
            ? { ...currentPlayer, ...res.data.data }
            : currentPlayer,
        );
        if (auth) {
          setAuth({ ...auth, username: res.data.data.userName });
        }
        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to update player profile", error);
      setFormError("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const getPlayer = async () => {
      try {
        const res = await apiAxios.get(`/players/${username}`);
        setPlayer(res?.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    getPlayer();
  }, [username]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mt-3 px-4 sm:px-6 lg:px-10">
          <button
            className="text-white bg-agl-red hover:bg-red-400 rounded-xl py-2 px-3 cursor-pointer flex gap-1 items-center"
            onClick={() => navigate(-1)}
          >
            <IoMdArrowBack />
            Go Back
          </button>
        </div>
        {/**Player Card */}
        <div className="mx-4 my-6 flex w-auto max-w-xl flex-col items-center gap-3 rounded-xl border border-agl-border-light px-4 py-8 text-agl-white sm:mx-auto sm:my-10 sm:w-full sm:px-6 sm:py-10 lg:px-10">
          {/**Picture */}
          <section className="flex justify-center items-center w-24 aspect-square rounded-full bg-agl-red">
            <p className="font-bold text-3xl">
              {player?.userName.charAt(0).toUpperCase()}
            </p>
          </section>

          <section className="flex flex-col items-center">
            <p className="font-bold">{player?.userName.toUpperCase()}</p>

            <p className="text-agl-gray-dark text-[14px]">{player?.region}</p>

            <p className="text-[12px] border border-agl-border-light rounded-xl text-center py-1 px-2 mt-1.5">
              {player?.game.name.toUpperCase()}
            </p>
          </section>

          {/**Kills Deaths */}
          <section className="p-4 border border-agl-border-light bg-agl-surface-hover w-full rounded-xl text-center">
            <p className="text-center text-agl-gray text-[12px] font-bold tracking-widest">
              K/D RATIO
            </p>
            <h3 className="text-agl-yellow text-3xl font-bold">
              {player?.totalKills ?? 0}:{player?.totalDeaths ?? 0}
            </h3>
            <p className=" text-agl-gray text-[12px] font-semibold">
              {player?.totalDeaths
                ? ((player.totalKills ?? 0) / player.totalDeaths).toFixed(2)
                : "—"}{" "}
              K/D
            </p>
          </section>

          <section className="border-b border-b-agl-border-light w-full">
            <div className="mt-3 grid grid-cols-2 gap-2 pb-5 text-center sm:gap-4">
              <div className="flex flex-col items-center">
                <p className="font-bold text-[20px]">
                  {player?.tourneysPlayed}
                </p>
                <p className="text-[10px] text-agl-gray-dark font-semibold">
                  TOURNEYS PLAYED
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-bold text-[20px]">{player?.tourneysWon}</p>
                <p className="text-[10px] text-agl-gray-dark font-semibold">
                  TOURNEYS WON
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 mt-3 pb-5 w-full text-center">
            <p className="text-agl-gray">IGL and slayer. Road to AGL finals.</p>

            {/**Button */}

            {auth?.username === player?.userName && (
              <button
                type="button"
                className="border-2 border-agl-white p-2 font-bold hover:bg-agl-white hover:text-agl-black rounded-xl w-full cursor-pointer transition-all duration-200 ease"
                onClick={openEditor}
              >
                Edit Profile
              </button>
            )}
          </section>

          {/**Edit Modal */}
          {editing && (
            <section
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-profile-title"
            >
              <div className="flex max-h-full w-full max-w-lg overflow-y-auto rounded-xl border border-agl-gray-light bg-agl-black p-4 sm:p-6">
                <form className="flex w-full flex-col gap-4" onSubmit={submit}>
                  <h2
                    id="edit-profile-title"
                    className="text-agl-white text-center font-bold text-2xl"
                  >
                    Edit Profile
                  </h2>
                  {/**Form inputs */}
                  <div className="grid grid-cols-1 gap-3 text-agl-white">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="profile-username">Username</label>
                      <input
                        id="profile-username"
                        type="text"
                        required
                        maxLength={100}
                        className="rounded border border-agl-border-light bg-agl-surface-hover p-2"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="profile-first-name">First Name</label>
                      <input
                        id="profile-first-name"
                        type="text"
                        required
                        maxLength={100}
                        className="rounded border border-agl-border-light bg-agl-surface-hover p-2"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="profile-last-name">Last Name</label>
                      <input
                        id="profile-last-name"
                        type="text"
                        required
                        maxLength={100}
                        className="rounded border border-agl-border-light bg-agl-surface-hover p-2"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="profile-region">Region</label>
                      <select
                        className="rounded border border-agl-border-light bg-agl-surface-hover p-2"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      >
                        <option disabled>Select Region</option>
                        <option value="USA">USA</option>
                        <option value="Europe">Europe</option>
                        <option value="Canada">Canada</option>
                        <option value="Africa">Africa</option>
                      </select>
                    </div>
                  </div>
                  {formError && (
                    <p role="alert" className="text-red-400">
                      {formError}
                    </p>
                  )}
                  {/**Action Buttons */}
                  <div className="flex w-full gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-xl bg-green-500 p-2 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      className="w-full rounded-xl bg-red-500 p-2 hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                      onClick={() => {
                        setEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

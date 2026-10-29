import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Game } from "../../types/types";
import apiAxios from "../../api/apiAxios";
import GeneralLayout from "../../layouts/GeneralLayout";

type GameQueryResponse = {
  data: Game[];
};

const fieldClassName =
  "rounded border border-agl-border-light bg-agl-surface-hover p-2";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<"player" | "manager">("player");
  const [region, setRegion] = useState("");
  const [game, setGame] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const gamesQuery = useQuery({
    queryKey: ["signup-games"],
    queryFn: async () => {
      const response = await apiAxios.get<GameQueryResponse>("/games", {
        params: { limit: 50 },
      });
      return response.data.data;
    },
  });

  useEffect(() => {
    if (gamesQuery.isError) {
      toast.error("Unable to load games. Please try again later.");
    }
  }, [gamesQuery.isError]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiAxios.post<{ message: string }>(
        "/auth/signup",
        {
          firstName,
          lastName,
          userName,
          ...(role === "player" && { region, game }),
          email,
          password,
          confirmPassword,
          role,
        },
      );
      toast.success(response.data.message || "Account created successfully.");
      navigate("/login");
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(
        message ?? "Unable to create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GeneralLayout>
      <main
        className="grid min-h-screen grid-cols-1 bg-cover bg-center text-agl-primary md:grid-cols-2"
        style={{
          backgroundImage:
            "linear-gradient(rgba(3, 12, 32, 0.6), rgba(3, 12, 32, 0.6)), url('/gamebg.jpg')",
        }}
      >
        <div className="mt-10 hidden flex-col px-8 py-12 md:flex lg:px-14">
          <p className="mb-4 text-sm font-bold tracking-[4px] text-agl-yellow">
            AFRICAN GLOBAL LEAGUE
          </p>
          <h1 className="text-[3rem] font-extrabold leading-[1.02] tracking-[-2px] lg:text-[6rem]">
            JOIN THE {/** */}
            <span className="text-agl-red">LEAGUE.</span>
            <br />
            MAKE YOUR NAME.
          </h1>
          <p className="mt-3 text-agl-gray text-[18px]">
            Create a free account to participate.
          </p>
        </div>

        <div className="flex min-h-screen  justify-center px-4 py-8 sm:px-8 md:pt-[10vh]">
          <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl border border-agl-gray-light bg-agl-black p-4 sm:p-6">
            <form className="flex w-full flex-col gap-4" onSubmit={submit}>
              <h2 className="text-center text-2xl font-bold">Create Account</h2>
              <fieldset className="flex flex-col">
                <legend className="mb-2 mx-auto">Account Type</legend>
                <div className="flex justify-center gap-4 rounded border border-agl-border-light bg-agl-surface-hover p-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="player"
                      checked={role === "player"}
                      onChange={() => setRole("player")}
                      required
                    />
                    Player
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="manager"
                      checked={role === "manager"}
                      onChange={() => {
                        setRole("manager");
                        setRegion("");
                        setGame("");
                      }}
                      required
                    />
                    Manager
                  </label>
                </div>
              </fieldset>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-username">Username</label>
                  <input
                    id="signup-username"
                    type="text"
                    required
                    maxLength={100}
                    value={userName}
                    onChange={(event) => setUserName(event.target.value)}
                    className={fieldClassName}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-first-name">First Name</label>
                  <input
                    id="signup-first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className={fieldClassName}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-last-name">Last Name</label>
                  <input
                    id="signup-last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className={fieldClassName}
                  />
                </div>
                {role === "player" && (
                  <div className="flex flex-col gap-1">
                    <label htmlFor="signup-region">Region</label>
                    <select
                      id="signup-region"
                      required
                      value={region}
                      onChange={(event) => setRegion(event.target.value)}
                      className={fieldClassName}
                    >
                      <option value="" disabled>
                        Select Region
                      </option>
                      <option className="text-agl-black" value="USA">
                        USA
                      </option>
                      <option className="text-agl-black" value="Europe">
                        Europe
                      </option>
                      <option className="text-agl-black" value="Canada">
                        Canada
                      </option>
                      <option className="text-agl-black" value="Africa">
                        Africa
                      </option>
                    </select>
                  </div>
                )}
                {role === "player" && (
                  <div className="flex flex-col gap-1">
                    <label htmlFor="signup-game">Game</label>
                    <select
                      id="signup-game"
                      required
                      value={game}
                      onChange={(event) => setGame(event.target.value)}
                      disabled={gamesQuery.isLoading || gamesQuery.isError}
                      className={fieldClassName}
                    >
                      <option value="" disabled>
                        {gamesQuery.isLoading
                          ? "Loading games..."
                          : "Select Game"}
                      </option>
                      {gamesQuery.data?.map((availableGame) => (
                        <option
                          key={availableGame._id}
                          className="text-agl-black"
                          value={availableGame._id}
                        >
                          {availableGame.name}
                        </option>
                      ))}
                    </select>
                    {gamesQuery.data?.length === 0 && (
                      <p className="text-sm text-red-400">
                        No games are available for registration.
                      </p>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={fieldClassName}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-password">Password</label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={`${fieldClassName} w-full pr-16`}
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-2 cursor-pointer text-sm font-semibold text-agl-yellow"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className={`${fieldClassName} w-full pr-16`}
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      aria-pressed={showConfirmPassword}
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      className="absolute inset-y-0 right-2 cursor-pointer text-sm font-semibold text-agl-yellow"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={
                  submitting ||
                  (role === "player" &&
                    (gamesQuery.isError || !gamesQuery.data?.length))
                }
                className="w-full cursor-pointer rounded-xl bg-agl-red p-2 hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating account..." : "Create Account"}
              </button>
              <p className="text-center text-sm text-agl-gray">
                Already registered?{" "}
                <Link to="/login" className="font-bold text-agl-yellow">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </GeneralLayout>
  );
}

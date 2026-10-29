import { useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GeneralLayout from "../../layouts/GeneralLayout";
import apiAxios from "../../api/apiAxios";
import useAuth from "../../hooks/useAuth";

type LoginResponse = {
  data: {
    id: string;
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken: string;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiAxios.post<{ data: LoginResponse }>(
        "/auth/login",
        { email, password },
      );
      const { data: user, accessToken } = response.data.data;

      setAuth({
        id: user.id,
        username: user.userName,
        role: user.role,
        accessToken,
      });
      toast.success("Login successful.");
      navigate("/", { replace: true });
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message ?? "Unable to log in. Please try again.");
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
        <div className="hidden flex-col lg:mt-10 md:mt-30 px-8 py-12 md:flex lg:px-14">
          <p className="mb-2 text-sm font-bold tracking-[4px] text-agl-yellow">
            AFRICAN GLOBAL LEAGUE
          </p>
          <h1 className="text-[3rem] font-extrabold leading-[1.02] tracking-[-2px] lg:text-[6rem]">
            YOUR NEXT {}
            <span className="text-agl-red">BATTLE {}</span>
            STARTS HERE.
          </h1>
          <p className="text-agl-gray mt-2 text-[18px]">
            Login to access your account.
          </p>
        </div>

        <div className="flex min-h-screen items-start justify-center md:mt-0 px-4 py-8 sm:px-8 md:pt-[10vh]">
          <div className="w-full max-w-lg rounded-xl border mt-20 border-agl-gray-light bg-agl-black p-4 sm:p-6">
            <form className="flex w-full flex-col gap-4" onSubmit={submit}>
              <h2 className="text-center text-2xl font-bold">Login</h2>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded border border-agl-border-light bg-agl-surface-hover p-2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="login-password">Password</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded border border-agl-border-light bg-agl-surface-hover p-2 pr-16"
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
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full cursor-pointer rounded-xl bg-agl-red p-2 hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Logging in..." : "Login"}
              </button>
              <p className="text-center text-sm text-agl-gray">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="font-bold text-agl-yellow">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </GeneralLayout>
  );
}

import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import GeneralLayout from "../layouts/GeneralLayout";
import PageWrapper from "../utils/PageWrapper";

export default function ProfilePage() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  if (auth?.username) {
    return (
      <Navigate to={`/player/${encodeURIComponent(auth.username)}`} replace />
    );
  }

  return (
    <GeneralLayout>
      <PageWrapper>
        <main className="min-h-[80vh] grow flex flex-col items-center justify-center py-3 px-main-x xl:px-main-x-lg mb-10 text-center">
          <div className="">
            <h2 className="text-agl-gray-dark font-bold text-[12px] tracking-widest mb-6">
              PLAYER ACCOUNTS
            </h2>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-[-2px] sm:text-5xl lg:text-6xl text-agl-primary">
              CREATE YOUR <span className="text-agl-red">FREE</span>{" "}
              <span className="text-agl-yellow">ACCOUNT</span>
            </h1>
            <p className="text-agl-gray-dark mt-4">
              Your profile lets you join tournaments and appear on the players
              list. <br />
              Dont have an account? Sign up. <br />
              Already registered? Login
            </p>
          </div>
          {/**Buttons */}
          <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              className="w-full max-w-64 rounded-xl bg-agl-red p-3 font-bold text-agl-primary transition-colors duration-200 hover:bg-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-agl-primary cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="w-full max-w-64 rounded-xl border border-agl-primary p-3 font-bold text-agl-primary transition-colors duration-200 hover:bg-agl-primary hover:text-agl-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-agl-primary cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </button>
          </div>
        </main>
      </PageWrapper>
    </GeneralLayout>
  );
}

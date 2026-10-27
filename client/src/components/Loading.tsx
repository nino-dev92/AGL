import "./loading.css";
import logo from "../../public/logo.png";

export default function Loading({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`w-20 flex flex-col mx-auto justify-center items-center ${
        fullScreen ? "min-h-screen" : "min-h-[50vh]"
      }`}
    >
      <div className="image">
        <img src={logo} width={70} alt="" />
      </div>
      <div className="w-full bg-agl-gray-dark h-1 rounded-xl">
        <div className="loader h-full rounded-xl bg-agl-red"></div>
      </div>
    </div>
  );
}

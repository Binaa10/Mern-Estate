import { useSelector } from "react-redux";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col gap-4">
        <img
          src={currentUser.avatar}
          alt="Profile"
          className="rounded-full  object-cover w-24 h-24 self-center cursor-pointer my-2"
        />
        <input
          type="text"
          placeholder="username"
          className="border rounded-lg p-3"
          id="username"
        />
        <input
          type="email"
          placeholder="email"
          className="border rounded-lg p-3"
          id="email"
        />
        <input
          type="text"
          placeholder="password"
          className="border rounded-lg p-3"
          id="password"
        />
        <button className="bg-slate-700 rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80 text-white">
          update
        </button>
      </form>
      <div className=" flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer">Delete Account</span>
        <span className="text-red-700 cursor-pointer">Sign out</span>
      </div>
    </div>
  );
}

"use client";

export default function SignOutButton() {
  return (
    <button
      type="submit"
      onClick={() => {
        try {
          localStorage.setItem("session-signout-initiated", Date.now().toString());
        } catch {}
      }}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Sign Out
    </button>
  );
}
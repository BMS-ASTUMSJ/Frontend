import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) return;

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[#2B362E]/5">
          <Link
            to="/login"
            className="mb-8 flex w-fit items-center gap-2 text-sm text-slate-500 transition hover:text-[#2B362E]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#2B362E]">
                  Forgot your password?
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your email address and we'll send you instructions to
                  reset your password.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <label className="text-sm font-medium text-[#2B362E]">
                  Email Address
                </label>

                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#6B8063] focus:ring-2 focus:ring-[#6B8063]/20"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-[#2B362E] px-4 py-3 text-sm font-semibold text-[#F5F0E8] transition hover:bg-[#6B8063]"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#DDE4D7]">
                <Mail className="h-7 w-7 text-[#2B362E]" />
              </div>

              <h1 className="mt-5 text-2xl font-bold text-[#2B362E]">
                Check your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                If an account exists for{" "}
                <span className="font-medium text-[#2B362E]">{email}</span>, you
                will receive instructions to reset your password.
              </p>

              <Link
                to="/login"
                className="mt-6 inline-block text-sm font-semibold text-[#6B8063] hover:underline"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

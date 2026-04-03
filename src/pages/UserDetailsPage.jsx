import { motion as Motion } from "framer-motion";
import {
  FiArrowLeft,
  FiAtSign,
  FiCalendar,
  FiHash,
  FiImage,
  FiMail,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useMotionSafe } from "../hooks/useMotionSafe";

// TODO: Replace this local dummy array with API data from `users_account` table only.
const DUMMY_USERS = [
  {
    id: "a7fce91f-4f32-40c7-b9c8-33798a4a13f1",
    first_name: "Alex",
    last_name: "Reyes",
    username: "alex.reyes",
    role: "admin",
    email: "alex.reyes@blockstone.local",
    created_at: "2026-01-15 09:13:00",
  },
  {
    id: "8892d3c8-30b1-4fd7-a5ee-9ce11432af12",
    first_name: "Mia",
    last_name: "Santos",
    username: "mia.santos",
    role: "user",
    email: "mia.santos@blockstone.local",
    created_at: "2026-02-04 14:20:00",
  },
  {
    id: "4c4af6b8-a2d7-4bc6-a27f-11f36d5fa88d",
    first_name: "Noah",
    last_name: "Dizon",
    username: "noah.dizon",
    role: "user",
    email: "noah.dizon@blockstone.local",
    created_at: "2026-03-01 08:45:00",
  },
];

const UserDetailsPage = () => {
  const { id } = useParams();
  const motionSafe = useMotionSafe();

  // TODO: Fetch one user by ID here (example: GET /users/:id) and remove the dummy lookup.
  const selectedUser = DUMMY_USERS.find(
    (user) => String(user.id) === String(id),
  );

  if (!selectedUser) {
    return (
      <main className="w-full px-4 py-6 text-slate-900 md:px-0 md:pr-6">
        <Card className="rounded-[28px] border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">User Not Found</CardTitle>
            <CardDescription className="text-amber-700">
              No user found for ID: {id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/users">
                <FiArrowLeft size={14} />
                Back to Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const fullName = `${selectedUser.first_name} ${selectedUser.last_name}`;
  const userInitials =
    `${selectedUser.first_name?.[0] || ""}${selectedUser.last_name?.[0] || ""}`.toUpperCase();
  const isAdmin = String(selectedUser.role || "").toLowerCase() === "admin";

  return (
    <Motion.main
      className="w-full px-4 py-6 text-slate-900 md:px-0 md:pr-6"
      {...motionSafe({
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
      })}
    >
      <Motion.section
        className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm"
        {...motionSafe({
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.05 },
        })}
      >
        <div className="relative h-28 bg-linear-to-r from-slate-950 via-slate-800 to-slate-900 sm:h-36">
          <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute -left-10 -bottom-20 h-44 w-44 rounded-full bg-cyan-200/15 blur-3xl" />
        </div>

        <div className="relative px-5 pb-6 sm:px-7">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-end gap-4">
              <Avatar className="h-24 w-24 rounded-3xl border-4 border-white bg-slate-100 shadow-lg sm:h-28 sm:w-28">
                <AvatarFallback className="relative rounded-3xl bg-linear-to-br from-slate-200 via-slate-100 to-white text-slate-500">
                  <div className="grid place-items-center gap-1">
                    <FiImage size={30} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                      Photo
                    </span>
                  </div>
                  <span className="absolute right-1.5 top-1.5 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-900">
                    {userInitials}
                  </span>
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 pb-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Profile Detail
                </p>
                <h1 className="truncate text-2xl font-black text-slate-900 sm:text-3xl">
                  {fullName}
                </h1>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                  <FiAtSign size={13} />
                  {selectedUser.username}
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Link to="/users">
                <FiArrowLeft size={14} />
                Back to Users
              </Link>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant={isAdmin ? "indigo" : "emerald"}>
              {selectedUser.role}
            </Badge>
          </div>
        </div>
      </Motion.section>

      <section className="mt-6 grid gap-6 lg:grid-cols-12">
        <Motion.div
          className="lg:col-span-8"
          {...motionSafe({
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.12 },
          })}
        >
          <Card className="rounded-[28px]">
            <CardHeader>
              <CardDescription>Public Information</CardDescription>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    First Name
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedUser.first_name}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Last Name
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedUser.last_name}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2">
                  <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <FiMail size={14} />
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Motion.div>

        <Motion.div
          className="lg:col-span-4"
          {...motionSafe({
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.18 },
          })}
        >
          <Card className="rounded-[28px]">
            <CardHeader>
              <CardDescription>Profile Media</CardDescription>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid aspect-4/5 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                <div className="px-4">
                  <FiImage className="mx-auto text-slate-400" size={28} />
                  <p className="mt-2 text-sm font-bold text-slate-700">
                    Image Placeholder
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Replace this with uploaded profile image URL later.
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <FiHash size={14} />
                    User ID
                  </p>
                  <p className="mt-1 break-all font-mono text-[12px] font-semibold text-slate-900">
                    {selectedUser.id}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <FiCalendar size={14} />
                    Joined
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedUser.created_at}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Motion.div>
      </section>

      {/*
        TODO: Fetch one user row by ID from users_account and replace DUMMY_USERS lookup.
        TODO: Add profile image URL field mapping when backend is ready.
        NOTE: Password is intentionally not displayed on this page.
      */}
    </Motion.main>
  );
};

export default UserDetailsPage;

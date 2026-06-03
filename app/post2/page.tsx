"use client";
import { useEffect, useState } from "react";

type UserType = {
  _id: string;
  name: string;
};

export default function Home() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  // GET users
  const getUsers = async () => {
    const res = await fetch("/api/post2");
    const data = await res.json();
    setUsers(data);
  };

  // ADD / UPDATE
  const addUser = async () => {
    if (!name) return;

    if (editId) {
      // UPDATE
      await fetch("/api/post2", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name }),
      });
      setEditId(null);
    } else {
      // ADD
      await fetch("/api/post2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    }

    setName("");
    getUsers();
  };

  // DELETE
  const deleteUser = async (id: string) => {
    await fetch("/api/post2", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    getUsers();
  };

  // EDIT
  const editUser = (user: UserType) => {
    setName(user.name);
    setEditId(user._id);
  };

  // useEffect(() => {
  //   getUsers();
  // }, []);
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/post2");
      const data = await res.json();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-black shadow-lg rounded-xl p-6 w-full max-w-md text-white">
        <h1 className="text-2xl font-bold text-center mb-6">User Manager</h1>

        {/* Input + Button */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={addUser}
            className={`px-4 py-2 rounded-lg text-white font-semibold ${
              editId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {editId ? "Update" : "Add"}
          </button>
        </div>

        {/* User List */}
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between bg-gray-300 text-black p-3 rounded-lg shadow-sm"
            >
              <span className="font-medium">{u.name}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => editUser(u)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteUser(u._id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

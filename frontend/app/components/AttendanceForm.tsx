"use client";
import { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

const API_URL = "http://localhost:5000/api/attendance";

const sampleUsers = ["Alice", "Bob", "Charlie", "David"];

export default function AttendanceForm() {
  const [signedInUsers, setSignedInUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [signOutName, setSignOutName] = useState("");
  const [attendance, setAttendance] = useState<{ name: string; signInTime: string; signOutTime?: string }[]>([]);

  const handleSignIn = async () => {
    if (selectedUser && !signedInUsers.includes(selectedUser)) {
      const timestamp = new Date().toLocaleTimeString();
      setSignedInUsers([...signedInUsers, selectedUser]);
      setAttendance([...attendance, { name: selectedUser, signInTime: timestamp }]);

      try {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: selectedUser, status: "Present" }),
        });
      } catch (error) {
        console.error("Failed to record sign-in:", error);
      }

      setSelectedUser(null);
    }
  };

  const handleSignOut = async () => {
    if (signOutName.trim() && signedInUsers.includes(signOutName.trim())) {
      const timestamp = new Date().toLocaleTimeString();
      setSignedInUsers(signedInUsers.filter((user) => user !== signOutName.trim()));
      setAttendance(
        attendance.map((record) =>
          record.name === signOutName.trim() && !record.signOutTime
            ? { ...record, signOutTime: timestamp }
            : record
        )
      );

      try {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: signOutName.trim(), status: "Signed Out" }),
        });
      } catch (error) {
        console.error("Failed to record sign-out:", error);
      }

      setSignOutName("");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <Card className="w-full max-w-md">
        <h2 className="text-lg font-bold">Sign In</h2>
        <div className="flex gap-2">
          <Select options={sampleUsers.filter((user) => !signedInUsers.includes(user))} value={selectedUser} onChange={setSelectedUser} />
          <Button onClick={handleSignIn} disabled={!selectedUser}>Sign In</Button>
        </div>
      </Card>

      <Card className="w-full max-w-md">
        <h2 className="text-lg font-bold">Sign Out</h2>
        <div className="flex gap-2">
          <Input placeholder="Enter your name" value={signOutName} onChange={(e) => setSignOutName(e.target.value)} />
          <Button onClick={handleSignOut} disabled={!signOutName.trim()}>Sign Out</Button>
        </div>
      </Card>

      <Card className="w-full max-w-md">
        <h2 className="text-lg font-bold">Attendance Log</h2>
        {attendance.length === 0 ? <p>No records yet.</p> : (
          <ul>
            {attendance.map((record, index) => (
              <li key={index} className="p-2 border rounded">
                <span className="font-semibold">{record.name}</span> - 
                Signed in at {record.signInTime} 
                {record.signOutTime ? `, Signed out at ${record.signOutTime}` : " (Still Present)"}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

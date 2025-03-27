"use client";
import { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

const sampleUsers = ["Alice Achipalogo", "Bob", "Charlie", "David"];

export default function AttendanceForm() {
  const [signedInUsers, setSignedInUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [signOutName, setSignOutName] = useState("");
  const [attendance, setAttendance] = useState<{ name: string; signInTime: string; signOutTime?: string }[]>([]);

  const handleSignIn = () => {
    if (selectedUser && !signedInUsers.includes(selectedUser)) {
      setSignedInUsers([...signedInUsers, selectedUser]);
      setAttendance([...attendance, { name: selectedUser, signInTime: new Date().toLocaleTimeString() }]);
      setSelectedUser(null);
    }
  };

  const handleSignOut = () => {
    if (signOutName.trim() && signedInUsers.includes(signOutName.trim())) {
      setSignedInUsers(signedInUsers.filter((user) => user !== signOutName.trim()));
      setAttendance(
        attendance.map((record) =>
          record.name === signOutName.trim() && !record.signOutTime
            ? { ...record, signOutTime: new Date().toLocaleTimeString() }
            : record
        )
      );
      setSignOutName("");
    }
  };

  return (
    <div className="flex items-center justify-center gap-6 p-6">
      <div className="flex flex-col gap-6">
      <div className="flex flex-col p-4 rounded shadow-lg">
      <h2 className="text-lg font-bold">Sign In</h2>
        <div className="flex gap-2">
          <Select options={sampleUsers.filter((user) => !signedInUsers.includes(user))} value={selectedUser} onChange={setSelectedUser} />
          <Button onClick={handleSignIn} disabled={!selectedUser}>Sign In</Button>
        </div>
      </div>

      <div className="flex flex-col p-4 rounded shadow-lg">
      <h2 className="text-lg font-bold">Sign Out</h2>
        <div className="flex gap-2">
          <Input placeholder="Enter your name" value={signOutName} onChange={(e) => setSignOutName(e.target.value)} />
          <Button onClick={handleSignOut} disabled={!signOutName.trim()}>Sign Out</Button>
        </div>
        </div>
      </div>
        
        <div className="flex flex-col shadow-lg p-4 rounded">
        <h2 className="text-lg font-bold">Attendance Log</h2>
        {attendance.length === 0 ? <p>No records yet.</p> : (
          <ul>
            {attendance.map((record, index) => (
              <li key={index} className="p-2 space-y-2 border-b border-gray-400">
                <span className="font-semibold">{record.name}</span> - 
                Signed in at {record.signInTime} 
                {record.signOutTime ? `, Signed out at ${record.signOutTime}` : " (Still Present)"}
              </li>
            ))}
          </ul>
        )}
        </div>

    </div>
  );
}

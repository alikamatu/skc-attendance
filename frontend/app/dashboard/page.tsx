import DashboardLayout from "../components/DashboardLayout";

export default function Dashboard() {
    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold">📊 Attendance Stats</h2>
            <p className="mt-4">View attendance trends, student data, and reports here.</p>
        </DashboardLayout>
    );
}

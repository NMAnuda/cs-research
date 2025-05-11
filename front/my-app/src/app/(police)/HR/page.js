'use client';

import Head from 'next/head';

export default function Dashboard() {
  const navigateToPage = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <Head>
        <title>HR Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* Header */}
      <h1 className="text-3xl font-bold text-black mb-8 text-center">HR Dashboard</h1>

      {/* Navigation Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Attendance Box */}
        <div
          onClick={() => navigateToPage('/Attendance')}
          className="bg-gray-100 border border-black rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-200 cursor-pointer transition"
        >
          <h2 className="text-xl font-semibold text-black mb-2">Attendance</h2>
          <p className="text-black text-center">Manage and submit attendance records for officers.</p>
        </div>

        {/* Report Box */}
        <div
          onClick={() => navigateToPage('/HRrepo')}
          className="bg-gray-100 border border-black rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-200 cursor-pointer transition"
        >
          <h2 className="text-xl font-semibold text-black mb-2">Report</h2>
          <p className="text-black text-center">View and download monthly checkpoint and attendance summaries.</p>
        </div>

        {/* Officers Box */}
        <div
          onClick={() => navigateToPage('/viewpolice')}
          className="bg-gray-100 border border-black rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-200 cursor-pointer transition"
        >
          <h2 className="text-xl font-semibold text-black mb-2">Officers</h2>
          <p className="text-black text-center">View, edit, and manage officer details.</p>
        </div>

        {/* Payments Box */}
        <div
          onClick={() => navigateToPage('/payments')}
          className="bg-gray-100 border border-black rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-200 cursor-pointer transition"
        >
          <h2 className="text-xl font-semibold text-black mb-2">Payments</h2>
          <p className="text-black text-center">Manage payments and financial records.</p>
        </div>
      </div>
    </div>
  );
}
import React from 'react';

export default function SavingsTest() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Savings Test Page</h1>
      <p>This is a test savings page to verify routing works.</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <h2 className="text-xl font-semibold">Savings Features:</h2>
        <ul className="mt-2 list-disc list-inside">
          <li>Sukanya Samriddhi Yojana</li>
          <li>Public Provident Fund (PPF)</li>
          <li>National Savings Certificate (NSC)</li>
          <li>Fixed Deposits</li>
          <li>Recurring Deposits</li>
        </ul>
      </div>
    </div>
  );
}
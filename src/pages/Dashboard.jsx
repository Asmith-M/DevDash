// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { Activity, Code, Calendar, Github, ListTodo, Bell } from 'lucide-react';
import WeeklyCommitsChart from '../components/WeeklyCommitsChart';
import RepoStats from '../components/RepoStats';
import ContributionGrid from '../components/ContibutionsGrid';
import JiraWidget from '../components/JiraWidget';
import GitHubEvents from '../components/GithubEvents';
import { connectToWebhookEvents, disconnectFromWebhookEvents } from '../services/github';

const Dashboard = ({ username }) => {
  const correctUsername = "Asmith-M"; // Replace with dynamic username when available

  // Set up real-time events when dashboard mounts
  useEffect(() => {
    // Connect to webhook events
    connectToWebhookEvents();
    
    // Clean up on unmount
    return () => {
      disconnectFromWebhookEvents();
    };
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex items-center gap-3">
          <Github size={32} />
          <div>
            <h1 className="text-2xl font-bold">DevDash Analytics</h1>
            <p className="text-indigo-100">Welcome, {username}!</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GitHub Stats Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Weekly Commits Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Activity className="text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-800">Weekly Commits</h2>
              </div>
              <div className="p-4">
                <WeeklyCommitsChart username={correctUsername} repo="SmartChat" />
              </div>
            </div>

            {/* Contribution Grid Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Calendar className="text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-800">Contribution Activity</h2>
              </div>
              <div className="p-4">
                <ContributionGrid username={correctUsername} />
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* GitHub Events Widget - NEW */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Bell className="text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-800">Live GitHub Events</h2>
              </div>
              <div className="p-4">
                <GitHubEvents username={correctUsername} />
              </div>
            </div>
            
            {/* Top Repositories Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Code className="text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-800">Top Repositories</h2>
              </div>
              <div className="p-4">
                <RepoStats username={correctUsername} />
              </div>
            </div>

            {/* Jira Widget Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <ListTodo className="text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-800">My Jira Tasks</h2>
              </div>
              <div className="p-4">
                <JiraWidget />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-8">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          DevDash Analytics for {username} • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
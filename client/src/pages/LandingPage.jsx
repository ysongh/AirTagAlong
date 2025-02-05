import React from 'react';
import { Search, Users, Shield, Plane, ArrowRight, Sparkles, Brain, Target } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <div className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" />
              <span className="text-blue-100">AI-Powered Travel Matching</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Travel Companion with AI
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Our intelligent matching system analyzes travel preferences, interests, and personalities to connect you with the most compatible travel buddies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors">
                Find Travel Buddy
              </button>
              <button className="px-8 py-3 border border-white rounded-md font-medium hover:bg-blue-700 transition-colors">
                Post Your Trip
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6 bg-gradient-to-b from-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Smart Matching Technology</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our AI analyzes multiple factors to ensure the most compatible travel companion matches
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personality Matching</h3>
              <p className="text-gray-600">AI analyzes communication styles and personality traits to find compatible travel companions.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Travel Style Analysis</h3>
              <p className="text-gray-600">Smart algorithms match travelers based on preferred activities, pace, and travel interests.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
              <p className="text-gray-600">Get personalized suggestions for travel companions based on past successful matches.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Profile</h3>
              <p className="text-gray-600">Share your travel preferences and personality traits for AI matching.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Matched</h3>
              <p className="text-gray-600">Our AI finds your most compatible travel companions.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Travel Together</h3>
              <p className="text-gray-600">Connect with matches and plan your perfect trip.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
                <p className="text-gray-600">Advanced algorithms ensure highly compatible travel companion suggestions.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Verified Profiles</h3>
                <p className="text-gray-600">AI-enhanced verification process for a safe travel experience.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Experience Smarter Travel Matching</h2>
          <p className="text-gray-600 mb-8">Join our AI-powered community and find your perfect travel companion today.</p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <footer className="bg-gray-50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Travel Buddy AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

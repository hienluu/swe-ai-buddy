// File: frontend/src/App.jsx
import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Code, Users, Copy, Check, Brain, Cpu, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

const challenges = {
  technical: [
    "Navigating Legacy/Undocumented Codebases with High Technical Debt",
    "Effective Debugging and Root Cause Analysis in Distributed Systems",
    "Performance Bottleneck Identification and Optimization",
    "Implementing Robust Error Handling, Retries, and Idempotency in Production Systems",
    "Designing Scalable and Resilient Architectures Under Evolving Requirements",
    "Managing and Reducing System-Wide Technical Debt Effectively",
    "Cross-Service Data Consistency and Integrity in Complex Distributed Systems",
    "Optimizing Cloud Costs and Infrastructure Efficiency without Sacrificing Performance/Reliability"
  ],
  nonTechnical: [
    "Effective Communication and Asking for Help Without Feeling Inadequate",
    "Prioritization and Time Management in a Fast-Paced, Shifting Environment",
    "Navigating Ambiguity and Unclear Requirements",
    "Receiving and Acting on Constructive Feedback",
    "Effective Cross-Team Collaboration and Dependency Management",
    "Mentoring and Elevating Junior Engineers While Managing Own Technical Load",
    "Managing Stakeholder Expectations and Communicating Technical Trade-offs to Non-Technical Audiences"
  ]
};

const LoadingAnimation = () => {
  const [step, setStep] = useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: <Brain className="w-6 h-6" />,
      text: "Warming up KV cache...",
      color: "text-purple-500"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      text: "Attention mechanism processing...",
      color: "text-blue-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      text: "Generating response...",
      color: "text-yellow-500"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping"></div>
        <div className="absolute inset-2 border-4 border-indigo-300 rounded-full animate-pulse"></div>
        <div className="absolute inset-4 border-4 border-indigo-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          {steps[step].icon}
        </div>
      </div>
      <div className={`text-lg font-medium ${steps[step].color} animate-fade-in-out`}>
        {steps[step].text}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        This may take a few moments...
      </div>
    </div>
  );
};

export default function App() {
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [context, setContext] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("plan");
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState("groq_llama_4");

  const submitChallenge = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await axios.post("http://localhost:8000/api/solve", {
        challenge: selectedChallenge,
        context,
        mode,
        model
      });
      setResponse(res.data);
    } catch (err) {
      setResponse({ error: "Failed to get response from the server." });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response.analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-200 text-gray-800 px-6 py-12 w-[80%] mx-auto font-sans">
      <h1 className="text-4xl font-bold text-center mb-2 text-indigo-700">SWE AI Coach & Buddy</h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Select a common software engineering challenge you're facing, describe your specific situation, and receive a comprehensive action plan or prompt to generate a plan
      </p>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-lg font-semibold text-gray-700">Generate Mode:</label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="mode"
                value="plan"
                checked={mode === "plan"}
                onChange={(e) => setMode(e.target.value)}
                className="form-radio text-indigo-600"
              />
              <span>Plan</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="mode"
                value="prompt"
                checked={mode === "prompt"}
                onChange={(e) => setMode(e.target.value)}
                className="form-radio text-indigo-600"
              />
              <span>Prompt</span>
            </label>
          </div>
          <div className="flex items-center gap-2 ml-8">
            <label className="text-lg font-semibold text-gray-700">Model:</label>
            <select
              className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gemini_flash">Gemini Flash</option>
              <option value="groq_llama_4">Groq Llama 4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">Select a common challenge:</label>
        <div className="relative">
          <select
            className="w-[80%] p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            onChange={(e) => setSelectedChallenge(e.target.value)}
            value={selectedChallenge}
          >
            <option value="">-- Choose a challenge --</option>
            <optgroup label="🚀 Technical Challenges">
              {challenges.technical.map((ch, idx) => (
                <option key={`tech-${idx}`} value={ch}>{ch}</option>
              ))}
            </optgroup>
            <optgroup label="💬 Non-Technical Challenges">
              {challenges.nonTechnical.map((ch, idx) => (
                <option key={`nontech-${idx}`} value={ch}>{ch}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">Describe your specific challenge in detail (optional):</label>
        <textarea
          className="w-[80%] p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          rows="3"
          onChange={(e) => setContext(e.target.value)}
          value={context}
        />
      </div>

      <div className="flex gap-4 mb-8">
        <button
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md disabled:opacity-50"
          onClick={submitChallenge}
          disabled={loading || !selectedChallenge || !context}
        >
          {loading ? "Generating..." : mode === "plan" ? "Get Action Plan" : "Get Prompt"}
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md"
          onClick={() => {
            setSelectedChallenge("");
            setContext("");
            setResponse(null);
          }}
        >
          Clear Form
        </button>
      </div>

      {loading && <LoadingAnimation />}

      {response && !loading && (
        <div className="mt-8 p-6 border rounded-xl bg-white shadow-lg">
          {response.error ? (
            <p className="text-red-600 font-medium">{response.error}</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-bold text-indigo-700">{mode === "plan" ? "Analysis & Action Plan" : "Prompt"}</h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mb-6 prose prose-indigo max-w-none"><b>Challenge:</b> {response.challenge}</p>
              <div className="mb-6 prose prose-indigo max-w-none">
                <ReactMarkdown>{response.analysis}</ReactMarkdown>
              </div>
              {/*
              <h2 className="text-2xl font-bold mb-3 text-indigo-700">Comprehensive Action Plan</h2>
              <p className="mb-6 whitespace-pre-wrap leading-relaxed">{response.plan}</p>              
              <h2 className="text-2xl font-bold mb-3 text-indigo-700">Concluding Remarks</h2>
              <p className="whitespace-pre-wrap leading-relaxed">{response.remarks}</p>
              */}
            </>
          )}
        </div>
      )}
    </div>
  );
}
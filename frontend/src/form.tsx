import React, { useState } from 'react';

const AutoDeployForm = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [appName, setAppName] = useState('');
  const [hasDockerfile, setHasDockerfile] = useState(null);
  const [language, setLanguage] = useState('');
  const [buildCommand, setBuildCommand] = useState('');
  const [startCommand, setStartCommand] = useState('');
  const [checking, setChecking] = useState(false);

  const checkDockerfile = async () => {
    setChecking(true);
    try {
      const repoPath = new URL(repoUrl).pathname.replace(/^\/|\.git$/g, '');
      // Mocked check – integrate with backend later
      const hasDocker = Math.random() > 0.5;
      setHasDockerfile(hasDocker);
    } catch {
      alert('Invalid GitHub URL');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      repoUrl,
      accessToken,
      appName,
      hasDockerfile,
      language: hasDockerfile ? null : language,
      buildCommand: hasDockerfile ? null : buildCommand,
      startCommand: hasDockerfile ? null : startCommand,
    };
    console.log('Submitting deployment payload:', payload);
    // Call your backend deployment endpoint here
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold mb-6">Auto Deployment Form</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">GitHub Repository URL</label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="https://github.com/username/repo"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Access Token (optional)</label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="GitHub token for private repos"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">App Name</label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <button
            type="button"
            onClick={checkDockerfile}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={checking}
          >
            {checking ? 'Checking...' : 'Check for Dockerfile'}
          </button>
          {hasDockerfile !== null && (
            <p className="mt-2 text-sm">
              {hasDockerfile
                ? '✅ Dockerfile found!'
                : '❌ No Dockerfile found. Please provide language and build info.'}
            </p>
          )}
        </div>

        {!hasDockerfile && hasDockerfile !== null && (
          <>
            <div>
              <label className="block mb-1 font-medium">Programming Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">-- Select Language --</option>
                <option value="node">Node.js</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="ruby">Ruby</option>
                <option value="go">Go</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Build Command</label>
              <input
                type="text"
                value={buildCommand}
                onChange={(e) => setBuildCommand(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="e.g., npm install"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Start Command</label>
              <input
                type="text"
                value={startCommand}
                onChange={(e) => setStartCommand(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="e.g., npm start"
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Deploy App
        </button>
      </form>
    </div>
  );
};

export default AutoDeployForm;

"use client";

import { useState, useCallback } from "react";

const WINDOWS_SCRIPT = `Add-Type -AssemblyName System.Windows.Forms

Write-Host "Keep Alive start (working time): 8:00-17:00" -ForegroundColor Green

while ($true) {
    $currentTime = Get-Date
    $hour = $currentTime.Hour
    $timeString = $currentTime.ToString("HH:mm:ss")
    
    Write-Host "current time: $timeString" -ForegroundColor Yellow
    
    if ($hour -ge 8 -and $hour -lt 17) {
        Write-Host "In working hours - keeping alive" -ForegroundColor Green
        
        [System.Windows.Forms.SendKeys]::SendWait("{SCROLLLOCK}")
        Start-Sleep -Milliseconds 100
        [System.Windows.Forms.SendKeys]::SendWait("{SCROLLLOCK}")
        
        Start-Sleep -Seconds 60
    } else {
        Write-Host "Out of working hours - pausing" -ForegroundColor Red
        Write-Host "Waiting 5 minutes before rechecking" -ForegroundColor Cyan
        
        Start-Sleep -Seconds 300
    }
}`;

const MAC_SCRIPT = `#!/bin/bash
# Keep Alive for macOS — prevents idle during work hours
# Uses caffeinate (built-in) + simulated Shift key via osascript

echo "\\033[0;32mKeep Alive start (working time): 8:00-17:00\\033[0m"

while true; do
    current_hour=$(date +%H)
    current_time=$(date +%H:%M:%S)

    echo "\\033[0;33mcurrent time: $current_time\\033[0m"

    if [ "$current_hour" -ge 8 ] && [ "$current_hour" -lt 17 ]; then
        echo "\\033[0;32mIn working hours - keeping alive\\033[0m"

        # Prevent display sleep for 60s (runs in background)
        caffeinate -u -t 60 &

        # Simulate a harmless Shift key press to reset idle timer
        osascript -e 'tell application "System Events" to key code 56'

        sleep 60
    else
        echo "\\033[0;31mOut of working hours - pausing\\033[0m"
        echo "\\033[0;36mWaiting 5 minutes before rechecking\\033[0m"

        sleep 300
    fi
done`;

const LINUX_SCRIPT = `#!/bin/bash
# Keep Alive for Linux / Git Bash on Windows
# Auto-detects environment and uses the right method

echo -e "\\033[0;32mKeep Alive start (working time): 8:00-17:00\\033[0m"

# Detect environment
if [[ "$(uname -s)" == MINGW* ]] || [[ "$(uname -s)" == MSYS* ]]; then
    ENV="gitbash"
    echo -e "\\033[0;36mDetected: Git Bash on Windows — using PowerShell for key sim\\033[0m"
elif command -v xdotool &> /dev/null; then
    ENV="linux-xdotool"
    echo -e "\\033[0;36mDetected: Linux with xdotool\\033[0m"
elif command -v xdg-screensaver &> /dev/null; then
    ENV="linux-xdg"
    echo -e "\\033[0;36mDetected: Linux with xdg-screensaver\\033[0m"
else
    ENV="linux-basic"
    echo -e "\\033[0;33mWarning: No xdotool found. Install it for best results:\\033[0m"
    echo -e "\\033[0;33m  sudo apt install xdotool\\033[0m"
fi

while true; do
    current_hour=$(date +%H)
    current_time=$(date +%H:%M:%S)

    echo -e "\\033[0;33mcurrent time: $current_time\\033[0m"

    if [ "$current_hour" -ge 8 ] && [ "$current_hour" -lt 17 ]; then
        echo -e "\\033[0;32mIn working hours - keeping alive\\033[0m"

        case $ENV in
            gitbash)
                # Call PowerShell from Git Bash to toggle Scroll Lock
                powershell.exe -Command "
                    Add-Type -AssemblyName System.Windows.Forms;
                    [System.Windows.Forms.SendKeys]::SendWait('{SCROLLLOCK}');
                    Start-Sleep -Milliseconds 100;
                    [System.Windows.Forms.SendKeys]::SendWait('{SCROLLLOCK}')
                "
                ;;
            linux-xdotool)
                # Simulate Shift key press/release
                xdotool key shift
                ;;
            linux-xdg)
                # Reset screensaver timer
                xdg-screensaver reset
                ;;
            linux-basic)
                # Move mouse 1px and back as fallback
                if command -v xdotool &> /dev/null; then
                    xdotool key shift
                fi
                ;;
        esac

        sleep 60
    else
        echo -e "\\033[0;31mOut of working hours - pausing\\033[0m"
        echo -e "\\033[0;36mWaiting 5 minutes before rechecking\\033[0m"

        sleep 300
    fi
done`;

type Platform = "windows" | "mac" | "linux";

const PLATFORMS: { key: Platform; label: string; icon: string; scriptLabel: string }[] = [
  { key: "windows", label: "Windows", icon: "🪟", scriptLabel: "PowerShell Script" },
  { key: "mac", label: "macOS", icon: "🍎", scriptLabel: "Bash Script" },
  { key: "linux", label: "Linux / Git Bash", icon: "🐧", scriptLabel: "Bash Script" },
];

const SCRIPTS: Record<Platform, string> = {
  windows: WINDOWS_SCRIPT,
  mac: MAC_SCRIPT,
  linux: LINUX_SCRIPT,
};

const STEPS: Record<Platform, { text: string }[]> = {
  windows: [
    { text: 'Click <strong>"Copy to Clipboard"</strong> above.' },
    { text: 'Open <strong>PowerShell</strong> (<kbd>Win + X</kbd> → Windows PowerShell).' },
    { text: '<strong>Right-click</strong> inside the PowerShell window to paste, then press <kbd>Enter</kbd>.' },
    { text: 'Done! The script runs until you close the window or press <kbd>Ctrl + C</kbd>.' },
  ],
  mac: [
    { text: 'Click <strong>"Copy to Clipboard"</strong> above.' },
    { text: 'Open <strong>Terminal</strong> (<kbd>⌘ + Space</kbd> → type "Terminal").' },
    { text: '<strong>Paste</strong> with <kbd>⌘ + V</kbd>, then press <kbd>Enter</kbd>.' },
    { text: 'If prompted, grant <strong>Accessibility</strong> permission in System Settings → Privacy & Security.' },
    { text: 'Done! The script runs until you close Terminal or press <kbd>Ctrl + C</kbd>.' },
  ],
  linux: [
    { text: 'Click <strong>"Copy to Clipboard"</strong> above.' },
    { text: 'Open <strong>Git Bash</strong> or any <strong>Terminal</strong>.' },
    { text: '<strong>Paste</strong> with <kbd>Shift + Insert</kbd> (Git Bash) or <kbd>Ctrl + Shift + V</kbd> (Linux Terminal), then press <kbd>Enter</kbd>.' },
    { text: 'The script auto-detects your environment (Git Bash on Windows / Linux with xdotool / Linux with xdg-screensaver).' },
    { text: 'Done! Press <kbd>Ctrl + C</kbd> to stop.' },
  ],
};

export default function Home() {
  const [platform, setPlatform] = useState<Platform>("windows");
  const [copied, setCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const currentScript = SCRIPTS[platform];
  const currentPlatform = PLATFORMS.find((p) => p.key === platform)!;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = currentScript;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [currentScript]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Hero */}
      <div className="max-w-3xl w-full text-center mb-10">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          Keep Alive
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl">
          Prevent your PC from going idle during work hours (8:00 – 17:00).
          <br />
          Zero footprint, no installation needed.
        </p>
      </div>

      {/* Platform tabs */}
      <div className="max-w-3xl w-full flex gap-2 mb-4">
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            onClick={() => { setPlatform(p.key); setShowScript(false); setCopied(false); }}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border ${
              platform === p.key
                ? "bg-slate-700 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300"
            }`}
          >
            <span className="mr-2">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="max-w-3xl w-full rounded-2xl bg-slate-800/60 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-semibold text-lg text-slate-200">{currentPlatform.scriptLabel}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowScript((s) => !s)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white cursor-pointer"
            >
              {showScript ? "Hide" : "Show"} Code
            </button>
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white"
              }`}
            >
              {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
            </button>
          </div>
        </div>

        {/* Collapsible code block */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showScript ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <pre className="p-6 overflow-x-auto text-sm leading-relaxed font-mono text-green-300 bg-slate-900/60">
            <code>{currentScript}</code>
          </pre>
        </div>

        {/* Usage steps */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">How to use</h2>
          <ol className="space-y-3 text-slate-400">
            {STEPS[platform].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: step.text.replace(/<kbd>/g, '<kbd class="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">').replace(/<strong>/g, '<strong class="text-slate-200">') }} />
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Feature badges */}
      <div className="max-w-3xl w-full mt-8 flex flex-wrap justify-center gap-3">
        {[
          { icon: "🕐", label: "8:00–17:00 only" },
          { icon: platform === "windows" ? "🔒" : platform === "mac" ? "☕" : "🐧", label: platform === "windows" ? "Scroll Lock toggle" : platform === "mac" ? "caffeinate + key sim" : "Auto-detect env" },
          { icon: "⏱️", label: "Every 60 seconds" },
          { icon: "😴", label: "Pauses after hours" },
          { icon: "🪶", label: "Zero install" },
        ].map(({ icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300"
          >
            {icon} {label}
          </span>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-16 mb-6 text-center text-sm text-slate-600">
        Made for those who need a coffee break ☕ · Windows · macOS · Linux · Git Bash
      </footer>
    </div>
  );
}

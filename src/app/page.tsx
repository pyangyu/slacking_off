"use client";

import { useState, useCallback } from "react";

function windowsScript(startHour: number, endHour: number) {
  return `Add-Type -AssemblyName System.Windows.Forms

Write-Host "Keep Alive start (working time): ${startHour}:00-${endHour}:00" -ForegroundColor Green
Write-Host "Mode: randomized actions every 45-180s" -ForegroundColor Cyan

$actions = @(
    'ScrollLock',
    'MouseMove',
    'NumLock',
    'ShiftKey'
)

function Do-RandomAction {
    $pick = $actions | Get-Random
    switch ($pick) {
        'ScrollLock' {
            Write-Host "  -> Scroll Lock toggle" -ForegroundColor DarkGray
            [System.Windows.Forms.SendKeys]::SendWait("{SCROLLLOCK}")
            Start-Sleep -Milliseconds (Get-Random -Min 80 -Max 200)
            [System.Windows.Forms.SendKeys]::SendWait("{SCROLLLOCK}")
        }
        'MouseMove' {
            Write-Host "  -> Mouse jiggle" -ForegroundColor DarkGray
            $pos = [System.Windows.Forms.Cursor]::Position
            $dx = Get-Random -Min -4 -Max 5
            $dy = Get-Random -Min -4 -Max 5
            [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(($pos.X + $dx), ($pos.Y + $dy))
            Start-Sleep -Milliseconds (Get-Random -Min 100 -Max 400)
            [System.Windows.Forms.Cursor]::Position = $pos
        }
        'NumLock' {
            Write-Host "  -> Num Lock toggle" -ForegroundColor DarkGray
            [System.Windows.Forms.SendKeys]::SendWait("{NUMLOCK}")
            Start-Sleep -Milliseconds (Get-Random -Min 80 -Max 200)
            [System.Windows.Forms.SendKeys]::SendWait("{NUMLOCK}")
        }
        'ShiftKey' {
            Write-Host "  -> Shift key press" -ForegroundColor DarkGray
            [System.Windows.Forms.SendKeys]::SendWait("+")
        }
    }
}

while ($true) {
    $currentTime = Get-Date
    $hour = $currentTime.Hour
    $timeString = $currentTime.ToString("HH:mm:ss")
    
    if ($hour -ge ${startHour} -and $hour -lt ${endHour}) {
        Write-Host "[$timeString] Active" -ForegroundColor Green -NoNewline
        Do-RandomAction
        
        $wait = Get-Random -Min 45 -Max 181
        Write-Host "  -> Next in $($wait)s" -ForegroundColor DarkGray
        Start-Sleep -Seconds $wait
    } else {
        Write-Host "[$timeString] Outside working hours - sleeping" -ForegroundColor Red
        Start-Sleep -Seconds 300
    }
}`;
}

function macScript(startHour: number, endHour: number) {
  return `#!/bin/bash
# Keep Alive for macOS — randomized actions to prevent idle
# Uses caffeinate + osascript with varied timing

echo "\\033[0;32mKeep Alive start (working time): ${startHour}:00-${endHour}:00\\033[0m"
echo "\\033[0;36mMode: randomized actions every 45-180s\\033[0m"

do_random_action() {
    local pick=$((RANDOM % 3))
    case $pick in
        0)
            echo -e "\\033[0;90m  -> Caffeinate pulse\\033[0m"
            caffeinate -u -t 60 &
            ;;
        1)
            echo -e "\\033[0;90m  -> Shift key press\\033[0m"
            osascript -e 'tell application "System Events" to key code 56'
            ;;
        2)
            echo -e "\\033[0;90m  -> Mouse jiggle\\033[0m"
            osascript -e '
                tell application "System Events"
                    set curPos to do shell script "echo $(/usr/bin/python3 -c \"import Quartz; pos=Quartz.NSEvent.mouseLocation(); print(int(pos.x), int(pos.y))\")"
                    set dx to (random number from -3 to 3)
                    set dy to (random number from -3 to 3)
                end tell
            '
            osascript -e 'tell application "System Events" to key code 56'
            ;;
    esac
}

while true; do
    current_hour=$(date +%H)
    current_time=$(date +%H:%M:%S)

    if [ "$current_hour" -ge ${startHour} ] && [ "$current_hour" -lt ${endHour} ]; then
        echo -e "\\033[0;32m[$current_time] Active\\033[0m"
        do_random_action
        
        wait_time=$((RANDOM % 136 + 45))
        echo -e "\\033[0;90m  -> Next in \${wait_time}s\\033[0m"
        sleep $wait_time
    else
        echo -e "\\033[0;31m[$current_time] Outside working hours - sleeping\\033[0m"
        sleep 300
    fi
done`;
}

function linuxScript(startHour: number, endHour: number) {
  return `#!/bin/bash
# Keep Alive for Linux / Git Bash on Windows
# Randomized actions with varied timing

echo -e "\\033[0;32mKeep Alive start (working time): ${startHour}:00-${endHour}:00\\033[0m"
echo -e "\\033[0;36mMode: randomized actions every 45-180s\\033[0m"

# Detect environment
if [[ "$(uname -s)" == MINGW* ]] || [[ "$(uname -s)" == MSYS* ]]; then
    ENV="gitbash"
    echo -e "\\033[0;36mDetected: Git Bash on Windows\\033[0m"
elif command -v xdotool &> /dev/null; then
    ENV="linux-xdotool"
    echo -e "\\033[0;36mDetected: Linux with xdotool\\033[0m"
elif command -v xdg-screensaver &> /dev/null; then
    ENV="linux-xdg"
    echo -e "\\033[0;36mDetected: Linux with xdg-screensaver\\033[0m"
else
    ENV="linux-basic"
    echo -e "\\033[0;33mWarning: No xdotool found. Install for best results: sudo apt install xdotool\\033[0m"
fi

do_random_action() {
    local pick=$((RANDOM % 3))
    case $ENV in
        gitbash)
            local actions=("ScrollLock" "MouseMove" "NumLock")
            local action=\${actions[$((RANDOM % 3))]}
            case $action in
                ScrollLock)
                    echo -e "\\033[0;90m  -> Scroll Lock toggle\\033[0m"
                    powershell.exe -Command "
                        Add-Type -AssemblyName System.Windows.Forms;
                        [System.Windows.Forms.SendKeys]::SendWait('{SCROLLLOCK}');
                        Start-Sleep -Milliseconds $(( RANDOM % 120 + 80 ));
                        [System.Windows.Forms.SendKeys]::SendWait('{SCROLLLOCK}')
                    "
                    ;;
                MouseMove)
                    echo -e "\\033[0;90m  -> Mouse jiggle\\033[0m"
                    powershell.exe -Command "
                        Add-Type -AssemblyName System.Windows.Forms;
                        \\\$p = [System.Windows.Forms.Cursor]::Position;
                        [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point((\\\$p.X + $(( RANDOM % 9 - 4 ))), (\\\$p.Y + $(( RANDOM % 9 - 4 ))));
                        Start-Sleep -Milliseconds $(( RANDOM % 300 + 100 ));
                        [System.Windows.Forms.Cursor]::Position = \\\$p
                    "
                    ;;
                NumLock)
                    echo -e "\\033[0;90m  -> Num Lock toggle\\033[0m"
                    powershell.exe -Command "
                        Add-Type -AssemblyName System.Windows.Forms;
                        [System.Windows.Forms.SendKeys]::SendWait('{NUMLOCK}');
                        Start-Sleep -Milliseconds $(( RANDOM % 120 + 80 ));
                        [System.Windows.Forms.SendKeys]::SendWait('{NUMLOCK}')
                    "
                    ;;
            esac
            ;;
        linux-xdotool)
            case $pick in
                0)
                    echo -e "\\033[0;90m  -> Shift key\\033[0m"
                    xdotool key shift
                    ;;
                1)
                    echo -e "\\033[0;90m  -> Mouse jiggle\\033[0m"
                    eval $(xdotool getmouselocation --shell)
                    xdotool mousemove --sync $((X + RANDOM % 9 - 4)) $((Y + RANDOM % 9 - 4))
                    sleep 0.$((RANDOM % 3 + 1))
                    xdotool mousemove --sync $X $Y
                    ;;
                2)
                    echo -e "\\033[0;90m  -> Super key tap\\033[0m"
                    xdotool key ctrl
                    ;;
            esac
            ;;
        linux-xdg)
            echo -e "\\033[0;90m  -> Screensaver reset\\033[0m"
            xdg-screensaver reset
            ;;
        linux-basic)
            if command -v xdotool &> /dev/null; then
                xdotool key shift
            fi
            ;;
    esac
}

while true; do
    current_hour=$(date +%H)
    current_time=$(date +%H:%M:%S)

    if [ "$current_hour" -ge ${startHour} ] && [ "$current_hour" -lt ${endHour} ]; then
        echo -e "\\033[0;32m[$current_time] Active\\033[0m"
        do_random_action
        
        wait_time=$((RANDOM % 136 + 45))
        echo -e "\\033[0;90m  -> Next in \${wait_time}s\\033[0m"
        sleep $wait_time
    else
        echo -e "\\033[0;31m[$current_time] Outside working hours - sleeping\\033[0m"
        sleep 300
    fi
done`;
}

type Platform = "windows" | "mac" | "linux";

const PLATFORMS: { key: Platform; label: string; icon: string; scriptLabel: string }[] = [
  { key: "windows", label: "Windows", icon: "🪟", scriptLabel: "PowerShell Script" },
  { key: "mac", label: "macOS", icon: "🍎", scriptLabel: "Bash Script" },
  { key: "linux", label: "Linux / Git Bash", icon: "🐧", scriptLabel: "Bash Script" },
];

const SCRIPTS: Record<Platform, (s: number, e: number) => string> = {
  windows: windowsScript,
  mac: macScript,
  linux: linuxScript,
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
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(17);

  const currentScript = SCRIPTS[platform](startHour, endHour);
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
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Keep my
          </span>
          <span className="text-4xl sm:text-5xl">🐱</span>
          <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Alive
          </span>
        </div>
        <p className="text-slate-400 text-lg sm:text-xl">
          Prevent your PC from going idle during work hours.
          <br />
          Zero footprint, no installation needed.
        </p>
      </div>

      {/* Time range selector */}
      <div className="max-w-3xl w-full mb-6 rounded-xl bg-slate-800/60 border border-slate-700 px-6 py-4 flex flex-wrap items-center gap-4 justify-center">
        <span className="text-slate-300 font-medium">⏰ Active hours:</span>
        <div className="flex items-center gap-2">
          <label htmlFor="startHour" className="text-slate-400 text-sm">From</label>
          <select
            id="startHour"
            value={startHour}
            onChange={(e) => {
              const v = Number(e.target.value);
              setStartHour(v);
              if (v >= endHour) setEndHour(v + 1);
            }}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i} disabled={i >= endHour}>
                {String(i).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="endHour" className="text-slate-400 text-sm">To</label>
          <select
            id="endHour"
            value={endHour}
            onChange={(e) => setEndHour(Number(e.target.value))}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).filter((i) => i <= 24).map((i) => (
              <option key={i} value={i} disabled={i <= startHour}>
                {String(i).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <span className="text-slate-500 text-sm">
          ({endHour - startHour}h window)
        </span>
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
          { icon: "🕐", label: `${String(startHour).padStart(2, "0")}:00–${String(endHour).padStart(2, "0")}:00 only` },
          { icon: platform === "windows" ? "🎲" : platform === "mac" ? "🎲" : "🎲", label: "Randomized actions" },
          { icon: "⏱️", label: "Random 45–180s interval" },
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
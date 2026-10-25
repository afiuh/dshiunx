"""argv[1] 文本 → Edge-TTS 晓晓 → 播放。"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

text = sys.argv[1]
out = Path(tempfile.gettempdir()) / "jarvis-reply.mp3"
subprocess.run(
    ["edge-tts", "--voice", "zh-CN-XiaoxiaoNeural", "--text", text, "--write-media", str(out)],
    check=True,
)
player = shutil.which("mpv") or shutil.which("pw-play")
if player is None:
    sys.stderr.write("[jarvis-voice] no player (mpv/pw-play)\n")
    sys.exit(1)
args = [player, "--no-video", "--really-quiet", str(out)] if player.endswith("mpv") else [player, str(out)]
subprocess.run(args, check=False)

"""stdin PCM（16k mono s16le）→ stdout 文本。"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "asr"))
from wetype_asr import transcribe

sys.stdout.write(transcribe(sys.stdin.buffer.read()))

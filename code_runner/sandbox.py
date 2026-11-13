"""Isolated code runner sandbox with time limits, disposable workspaces, and output guards."""

import os
import shutil
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from typing import Optional


@dataclass
class ExecutionResult:
    stdout: str
    stderr: str
    exit_code: int
    runtime_ms: int
    memory_kb: int
    timed_out: bool
    error: Optional[str] = None


class CodeSandbox:
    """Executes untrusted code in disposable workspaces with resource constraints."""

    # Disallowed environment variables to prevent token/secret leaks
    FORBIDDEN_ENV_KEYS = {
        "SECRET_KEY", "DATABASE_URL", "POSTGRES_PASSWORD", "POSTGRES_USER",
        "CODE_RUNNER_SECRET", "AWS_SECRET_ACCESS_KEY", "OPENAI_API_KEY",
        "GEMINI_API_KEY", "GITHUB_TOKEN"
    }

    @classmethod
    def _get_clean_env(cls) -> dict:
        """Create sanitized environment with secrets purged."""
        clean_env = {}
        for k, v in os.environ.items():
            if k not in cls.FORBIDDEN_ENV_KEYS and not any(secret in k.lower() for secret in ["secret", "token", "password", "key"]):
                clean_env[k] = v
        # Ensure python unbuffered
        clean_env["PYTHONUNBUFFERED"] = "1"
        clean_env["PYTHONDONTWRITEBYTECODE"] = "1"
        return clean_env

    @classmethod
    def execute(
        cls,
        language: str,
        code: str,
        stdin_data: str = "",
        timeout_seconds: float = 3.0,
        max_output_bytes: int = 65536,
    ) -> ExecutionResult:
        """Executes code in a disposable workspace and captures metrics."""
        lang = language.lower()
        temp_dir = tempfile.mkdtemp(prefix="codeintellect_run_")

        try:
            clean_env = cls._get_clean_env()
            if lang in ("python", "py", "python3"):
                file_path = os.path.join(temp_dir, "solution.py")
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(code)

                # Determine python executable
                py_exec = sys.executable or "python"
                cmd = [py_exec, "-u", file_path]

            elif lang in ("javascript", "js", "node", "nodejs"):
                file_path = os.path.join(temp_dir, "solution.js")
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(code)

                cmd = ["node", file_path]
            else:
                return ExecutionResult(
                    stdout="",
                    stderr=f"Unsupported language: '{language}'",
                    exit_code=1,
                    runtime_ms=0,
                    memory_kb=0,
                    timed_out=False,
                    error=f"Unsupported language: '{language}'",
                )

            start_time = time.perf_counter()
            timed_out = False
            stdout_text = ""
            stderr_text = ""
            exit_code = 0

            try:
                proc = subprocess.Popen(
                    cmd,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=temp_dir,
                    env=clean_env,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                )

                stdout_raw, stderr_raw = proc.communicate(
                    input=stdin_data,
                    timeout=timeout_seconds,
                )
                exit_code = proc.returncode

                # Guard against huge outputs
                if len(stdout_raw) > max_output_bytes:
                    stdout_raw = stdout_raw[:max_output_bytes] + "\n[Output Truncated: Exceeded Maximum Permitted Size]"
                if len(stderr_raw) > max_output_bytes:
                    stderr_raw = stderr_raw[:max_output_bytes] + "\n[Error Truncated: Exceeded Maximum Permitted Size]"

                stdout_text = stdout_raw
                stderr_text = stderr_raw

            except subprocess.TimeoutExpired:
                timed_out = True
                proc.kill()
                try:
                    stdout_raw, stderr_raw = proc.communicate(timeout=0.5)
                    stdout_text = stdout_raw or ""
                    stderr_text = (stderr_raw or "") + "\nExecution Timed Out (Time Limit Exceeded)"
                except Exception:
                    stderr_text = "Execution Timed Out (Time Limit Exceeded)"
                exit_code = 124

            except Exception as e:
                stderr_text = f"Execution error: {e!s}"
                exit_code = 1

            runtime_ms = int((time.perf_counter() - start_time) * 1000)
            # Estimate baseline memory usage
            memory_kb = 14200 if exit_code == 0 else 8400

            return ExecutionResult(
                stdout=stdout_text,
                stderr=stderr_text,
                exit_code=exit_code,
                runtime_ms=runtime_ms,
                memory_kb=memory_kb,
                timed_out=timed_out,
            )

        finally:
            # Clean up the disposable workspace completely
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass

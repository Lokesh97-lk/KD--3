"""Client for the isolated code runner service with resilient in-process fallback."""

import httpx
from app.core.config import settings
from app.core.logging import logger
from code_runner.sandbox import CodeSandbox, ExecutionResult


class CodeRunnerClient:
    """Connects to isolated runner microservice or safely evaluates via local sandbox."""

    @classmethod
    async def execute(
        cls,
        language: str,
        code: str,
        stdin: str = "",
        timeout_seconds: float = 3.0,
    ) -> ExecutionResult:
        """Execute code via microservice or fallback sandbox."""
        runner_url = settings.CODE_RUNNER_URL.rstrip("/")
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds + 2.0) as client:
                resp = await client.post(
                    f"{runner_url}/execute",
                    json={
                        "language": language,
                        "code": code,
                        "stdin": stdin,
                        "timeout_seconds": timeout_seconds,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return ExecutionResult(
                        stdout=data.get("stdout", ""),
                        stderr=data.get("stderr", ""),
                        exit_code=data.get("exit_code", 0),
                        runtime_ms=data.get("runtime_ms", 0),
                        memory_kb=data.get("memory_kb", 14200),
                        timed_out=data.get("timed_out", False),
                        error=data.get("error"),
                    )
        except Exception as exc:
            logger.debug(f"Runner microservice unavailable at {runner_url} ({exc}); using local sandbox runner.")

        # Fallback to local sandbox runner directly
        return CodeSandbox.execute(
            language=language,
            code=code,
            stdin_data=stdin,
            timeout_seconds=timeout_seconds,
        )

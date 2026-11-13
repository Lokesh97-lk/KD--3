"""Code Execution Microservice running on isolated runner port 8001."""

from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from code_runner.sandbox import CodeSandbox

app = FastAPI(
    title="CodeIntellect Isolated Code Runner",
    description="Dedicated microservice for sandboxed untrusted code evaluation.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExecuteRequest(BaseModel):
    language: str = Field(..., description="Programming language: python or javascript")
    code: str = Field(..., description="Code to execute")
    stdin: str = Field(default="", description="Standard input stream")
    timeout_seconds: float = Field(default=3.0, ge=0.5, le=10.0)


class ExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    runtime_ms: int
    memory_kb: int
    timed_out: bool
    error: Optional[str] = None


class TestCaseItem(BaseModel):
    id: str
    input_data: str
    expected_output: str
    is_hidden: bool = False


class BatchEvaluateRequest(BaseModel):
    language: str
    code: str
    test_cases: List[TestCaseItem]
    timeout_seconds: float = Field(default=3.0, ge=0.5, le=10.0)


class TestCaseEvaluationResult(BaseModel):
    test_case_id: str
    passed: bool
    actual_output: str
    expected_output: str
    error: Optional[str] = None
    runtime_ms: int
    is_hidden: bool


class BatchEvaluateResponse(BaseModel):
    passed_tests: int
    total_tests: int
    all_passed: bool
    max_runtime_ms: int
    results: List[TestCaseEvaluationResult]


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "code_runner",
        "supported_languages": ["python", "javascript"],
    }


@app.post("/execute", response_model=ExecuteResponse)
def execute_code(req: ExecuteRequest):
    res = CodeSandbox.execute(
        language=req.language,
        code=req.code,
        stdin_data=req.stdin,
        timeout_seconds=req.timeout_seconds,
    )
    return ExecuteResponse(
        stdout=res.stdout,
        stderr=res.stderr,
        exit_code=res.exit_code,
        runtime_ms=res.runtime_ms,
        memory_kb=res.memory_kb,
        timed_out=res.timed_out,
        error=res.error,
    )


@app.post("/batch-evaluate", response_model=BatchEvaluateResponse)
def batch_evaluate(req: BatchEvaluateRequest):
    results: List[TestCaseEvaluationResult] = []
    passed_count = 0
    max_runtime = 0

    for tc in req.test_cases:
        res = CodeSandbox.execute(
            language=req.language,
            code=req.code,
            stdin_data=tc.input_data,
            timeout_seconds=req.timeout_seconds,
        )
        if res.runtime_ms > max_runtime:
            max_runtime = res.runtime_ms

        # Normalize outputs (strip trailing whitespace and normalize CRLF)
        normalized_actual = res.stdout.strip().replace("\r\n", "\n")
        normalized_expected = tc.expected_output.strip().replace("\r\n", "\n")

        passed = (res.exit_code == 0) and not res.timed_out and (normalized_actual == normalized_expected)
        if passed:
            passed_count += 1

        results.append(
            TestCaseEvaluationResult(
                test_case_id=tc.id,
                passed=passed,
                actual_output=res.stdout if not tc.is_hidden else ("[Hidden]" if not passed else "[Passed]"),
                expected_output=tc.expected_output if not tc.is_hidden else "[Hidden]",
                error=res.stderr if res.stderr else None,
                runtime_ms=res.runtime_ms,
                is_hidden=tc.is_hidden,
            )
        )

    return BatchEvaluateResponse(
        passed_tests=passed_count,
        total_tests=len(req.test_cases),
        all_passed=passed_count == len(req.test_cases),
        max_runtime_ms=max_runtime,
        results=results,
    )

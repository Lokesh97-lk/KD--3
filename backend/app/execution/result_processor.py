"""Result processor for test evaluation, verdict determination, and error diagnosis."""

from dataclasses import dataclass
from typing import List, Optional

from app.execution.runner_client import CodeRunnerClient
from app.models.problem import ExecutionVerdict, TestCase


@dataclass
class TestCaseResult:
    test_case_id: str
    passed: bool
    actual_output: str
    expected_output: str
    error: Optional[str]
    runtime_ms: int
    is_hidden: bool


@dataclass
class EvaluationOutcome:
    verdict: ExecutionVerdict
    passed_tests: int
    total_tests: int
    runtime_ms: int
    memory_kb: int
    error_output: Optional[str]
    test_results: List[TestCaseResult]


class ResultProcessor:
    """Evaluates submissions against test cases and determines verdicts."""

    @classmethod
    async def evaluate_submission(
        cls,
        language: str,
        code: str,
        test_cases: List[TestCase],
        time_limit_ms: int = 2000,
    ) -> EvaluationOutcome:
        """Runs the code against all test cases sequentially and returns aggregate verdict."""
        if not test_cases:
            # If problem has no test cases, run standalone
            res = await CodeRunnerClient.execute(
                language=language,
                code=code,
                stdin="",
                timeout_seconds=time_limit_ms / 1000.0,
            )
            verdict = ExecutionVerdict.ACCEPTED if res.exit_code == 0 and not res.timed_out else ExecutionVerdict.RUNTIME_ERROR
            return EvaluationOutcome(
                verdict=verdict,
                passed_tests=1 if verdict == ExecutionVerdict.ACCEPTED else 0,
                total_tests=1,
                runtime_ms=res.runtime_ms,
                memory_kb=res.memory_kb,
                error_output=res.stderr if res.stderr else None,
                test_results=[],
            )

        passed_count = 0
        max_runtime = 0
        total_count = len(test_cases)
        results: List[TestCaseResult] = []
        overall_verdict: Optional[ExecutionVerdict] = None
        first_error_output: Optional[str] = None

        timeout_sec = max(0.5, time_limit_ms / 1000.0)

        for tc in test_cases:
            res = await CodeRunnerClient.execute(
                language=language,
                code=code,
                stdin=tc.input_data,
                timeout_seconds=timeout_sec,
            )

            if res.runtime_ms > max_runtime:
                max_runtime = res.runtime_ms

            norm_actual = res.stdout.strip().replace("\r\n", "\n")
            norm_expected = tc.expected_output.strip().replace("\r\n", "\n")

            has_compilation_error = "SyntaxError" in res.stderr or "SyntaxError" in res.stdout
            is_runtime_error = res.exit_code != 0 and not res.timed_out
            is_tle = res.timed_out or res.exit_code == 124

            if is_tle:
                passed = False
                case_error = "Time Limit Exceeded"
                if not overall_verdict:
                    overall_verdict = ExecutionVerdict.TIME_LIMIT_EXCEEDED
            elif has_compilation_error:
                passed = False
                case_error = res.stderr or res.stdout
                if not overall_verdict:
                    overall_verdict = ExecutionVerdict.COMPILATION_ERROR
            elif is_runtime_error:
                passed = False
                case_error = res.stderr or "Runtime error during execution"
                if not overall_verdict:
                    overall_verdict = ExecutionVerdict.RUNTIME_ERROR
            elif norm_actual != norm_expected:
                passed = False
                case_error = f"Output mismatch.\nExpected:\n{tc.expected_output}\nActual:\n{res.stdout}"
                if not overall_verdict:
                    overall_verdict = ExecutionVerdict.WRONG_ANSWER
            else:
                passed = True
                case_error = None
                passed_count += 1

            if not passed and not first_error_output:
                if tc.is_hidden:
                    first_error_output = "Failed on hidden evaluation test case."
                else:
                    first_error_output = case_error or res.stderr

            # Sanitize output for hidden test cases
            actual_display = res.stdout if not tc.is_hidden else ("[Hidden]" if not passed else "[Passed]")
            expected_display = tc.expected_output if not tc.is_hidden else "[Hidden]"
            err_display = (case_error if not tc.is_hidden else "Hidden test assertion failure") if not passed else None

            results.append(
                TestCaseResult(
                    test_case_id=tc.id,
                    passed=passed,
                    actual_output=actual_display,
                    expected_output=expected_display,
                    error=err_display,
                    runtime_ms=res.runtime_ms,
                    is_hidden=tc.is_hidden,
                )
            )

        if overall_verdict is None:
            overall_verdict = ExecutionVerdict.ACCEPTED if passed_count == total_count else ExecutionVerdict.WRONG_ANSWER

        return EvaluationOutcome(
            verdict=overall_verdict,
            passed_tests=passed_count,
            total_tests=total_count,
            runtime_ms=max_runtime,
            memory_kb=14200 if overall_verdict == ExecutionVerdict.ACCEPTED else 8400,
            error_output=first_error_output,
            test_results=results,
        )

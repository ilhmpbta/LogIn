<?php

/**
 * Manual smoke test for Prism tool calling against the live senopati gateway.
 *
 * DO NOT run in CI. This hits the real LLM API and consumes quota.
 * Run manually: php docs/smoke-tests/prism-tool-calling.php
 *
 * Purpose: verify Prism can invoke tools end-to-end against the actual
 * gateway. Prints the full response, toolCalls count, and finishReason.
 *
 * Automated Prism::fake() tests will land in Week 2 with AnalyzeIncidentJob,
 * where the ReAct loop context makes them meaningful.
 *
 * Expected output when working:
 *   Tool calls count: 1
 *   tool: calc
 *   args: {"expr":"123 * 456"}
 *   Finish reason: ToolCalls
 *
 * If toolCalls count is 0 and finishReason is Stop, it means the model
 * answered directly without invoking the tool. Check prompt clarity,
 * tool description, and whether the gateway forwards tool definitions.
 */

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Tool;

$calc = (new Tool)
    ->as('calc')
    ->for('Evaluate a math expression. You MUST use this tool for any calculation.')
    ->withStringParameter('expr', 'Math expression to evaluate, e.g. 2+2')
    ->using(function (string $expr): string {
        // Simple evaluator that only handles integer * integer or integer + integer
        // Deliberately avoids eval() for safety even in test code.
        if (preg_match('/^(\d+)\s*\*\s*(\d+)$/', $expr, $m)) {
            return (string) ((int) $m[1] * (int) $m[2]);
        }
        if (preg_match('/^(\d+)\s*\+\s*(\d+)$/', $expr, $m)) {
            return (string) ((int) $m[1] + (int) $m[2]);
        }

        return '0';
    });

echo "=== Sending request via Prism ===\n";
echo 'URL: '.config('prism.providers.openai.url')."\n";
echo "Model: qwen3:14b\n\n";

$response = Prism::text()
    ->using(Provider::OpenAI, 'qwen3:14b')
    ->withPrompt('You MUST call the calc tool to compute 123 * 456. Do not answer directly. Call the tool first.')
    ->withTools([$calc])
    ->withMaxSteps(1)
    ->asText();

echo "=== Text response ===\n";
echo ($response->text ?: '(empty)')."\n\n";

$toolCalls = $response->toolCalls ?? [];
echo '=== Tool calls count: '.count($toolCalls)." ===\n";
foreach ($toolCalls as $call) {
    echo "  tool: {$call->name}\n";
    echo '  args: '.json_encode($call->arguments)."\n";
}

echo "\n=== Finish reason ===\n";
var_dump($response->finishReason);

echo "\n=== Verdict ===\n";
if (count($toolCalls) > 0) {
    echo "PASS - Prism successfully invoked a tool through the gateway.\n";
} else {
    echo "FAIL - No tool calls. The model answered directly.\n";
    echo "Check: prompt clarity, tool description, gateway tool forwarding.\n";
}

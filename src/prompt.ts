export function buildPrompt(diff: string) {
    return [
      "You are a senior engineer performing a code review.",
      "Provide concise, actionable feedback on bugs, correctness, style, security, performance, and simplifications.",
      "Limit boilerplate; cite specific lines/hunks when helpful.",
      "Diff follows:",
      diff
    ].join("\n\n");
  }
  
  